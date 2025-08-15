'use client';

// at the top
import type { Decision, Kind, Link, RFNode, RFEdge } from '@/types/canvas';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  addEdge,
  Connection,
  ConnectionMode,
  Edge,
  Node,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';
import EdgeInspector from '@/components/EdgeInspector';
import StickyNode from '@/components/nodes/StickyNode';
import DiamondNode from '@/components/nodes/DiamondNode';

const nodeTypes = {
  decision: StickyNode,
  data: StickyNode,
  opportunity: StickyNode,
  choice: DiamondNode,
};

const NODE = 140;

function Inner() {
  const { id: projectId } = useParams() as { id: string };
  const [view, setView] = useState<'process' | 'information' | 'opportunities'>('process');

  const [decisions, setDecisions] = useState<Decision[]>([]);
const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const connectingFromHandle = useRef<string | null>(null);
  const didConnectRef = useRef(false);

  const { screenToFlowPosition } = useReactFlow();

  const colorFor = (k: Kind) => {
    if (k === 'data') return { bg: '#DCFCE7', textColor: '#1F7A1F', fold: 'rgba(31,122,31,.22)' };
    if (k === 'opportunity') return { bg: '#CDE3FF', textColor: '#1f2937', fold: 'rgba(30,64,175,.18)' };
    if (k === 'decision') return { bg: '#FFF7B3', textColor: '#1f2937', fold: 'rgba(0,0,0,.14)' };
    return { bg: '#F6E7B2', textColor: '#1f2937', fold: 'rgba(0,0,0,.14)' }; // choice (diamond)
  };
  const edgeColorFor = (kind: string) => (kind === 'data' ? '#228B22' : '#5A6C80');

  const onRename = useCallback(
    async (id: string, title: string) => {
      await supabase.from('decisions').update({ title }).eq('id', id);
      setDecisions((p) => p.map((d) => (d.id === id ? { ...d, title } : d)));
      setNodes((p) =>
        p.map((n) => (n.id !== id ? n : { ...n, data: { ...n.data, label: (n.type === 'choice' ? 'Choice: ' : '') + title } }))
      );
    },
    [setDecisions, setNodes]
  );

  const load = useCallback(async () => {
    const { data: drows } = await supabase
      .from('decisions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const { data: lrows } = await supabase.from('decision_links').select('*').eq('project_id', projectId);

    const ds = (drows || []) as Decision[];
    const ls = (lrows || []) as Link[];

    setDecisions(ds);

setNodes(
  ds.map((d): RFNode => ({
    id: d.id,
    type: (d.kind || 'decision') as Kind,
    draggable: true,
    position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
    data: {
      label: (d.kind === 'choice' ? 'Choice: ' : '') + (d.title || 'Note'),
      onRename,
      isEditing: editingId === d.id,
      ...colorForKind((d.kind || 'decision') as Kind),
    },
  }))
);

    setEdges(
      ls.map((l) => ({
        id: l.id,
        source: l.from_id,
        target: l.to_id,
        sourceHandle: l.source_handle || undefined,
        targetHandle: l.target_handle || undefined,
        type: (l.curve as any) || 'step',
        updatable: true,
        data: {
          edgeColor: edgeColorFor(l.kind),
          pattern: l.pattern || 'solid',
          arrowStart: !!l.arrow_start,
          arrowEnd: l.arrow_end !== false,
        },
        markerStart: l.arrow_start ? { type: MarkerType.ArrowClosed } : undefined,
        markerEnd: l.arrow_end !== false ? { type: MarkerType.ArrowClosed } : undefined,
        style:
          l.pattern === 'dotted'
            ? { strokeDasharray: '2 6' }
            : l.pattern === 'dashed'
            ? { strokeDasharray: '8 6' }
            : undefined,
      }))
    );
  }, [projectId, editingId, onRename]);

  useEffect(() => {
    load();
  }, [load]);

  // drag & drop new nodes
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  async function addNodeAt(pos: { x: number; y: number }, kind: Kind, title?: string) {
    const { data } = await supabase
      .from('decisions')
      .insert({
        project_id: projectId,
        kind,
        title: title || (kind === 'data' ? 'Data' : 'New item'),
        x: pos.x,
        y: pos.y,
      })
      .select('*')
      .single();

    if (!data) return null;

    const d = data as Decision;
    setDecisions((p) => [...p, d]);
    setNodes((p) => [
      ...p,
      {
        id: d.id,
        type: d.kind as Kind,
        draggable: true,
        position: { x: d.x || 0, y: d.y || 0 },
        data: { label: (d.kind === 'choice' ? 'Choice: ' : '') + d.title, ...colorFor(d.kind as Kind) },
      } as Node,
    ]);
    return d;
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/reactflow') as Kind;
      if (!kind || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const p = screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      addNodeAt({ x: p.x - NODE / 2, y: p.y - NODE / 2 }, kind);
    },
    [screenToFlowPosition]
  );

  // connections
  const onConnect: OnConnect = useCallback(
    async (c: Connection) => {
      if (!c.source || !c.target) return;
      didConnectRef.current = true;

      const src = decisions.find((d) => d.id === c.source);
      const tgt = decisions.find((d) => d.id === c.target);
      const kind = src?.kind === 'data' || tgt?.kind === 'data' ? 'data' : 'precedes';

      const { data } = await supabase
        .from('decision_links')
        .insert({
          project_id: projectId,
          from_id: c.source,
          to_id: c.target,
          kind,
          source_handle: c.sourceHandle || null,
          target_handle: c.targetHandle || null,
          curve: 'step',
          pattern: 'solid',
          arrow_end: true,
          arrow_start: false,
        })
        .select('*')
        .single();

      if (data) {
        setEdges((eds) =>
          addEdge(
            {
              id: data.id,
              source: data.from_id,
              target: data.to_id,
              sourceHandle: data.source_handle || undefined,
              targetHandle: data.target_handle || undefined,
              type: 'step',
              updatable: true,
              data: { edgeColor: edgeColorFor(kind), pattern: 'solid', arrowStart: false, arrowEnd: true },
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            eds
          )
        );
      }
    },
    [projectId, decisions]
  );

  const opposite = (h?: string | null) => {
    if (!h) return undefined;
    if (h.startsWith('r')) return 'l-tgt';
    if (h.startsWith('l')) return 'r-tgt';
    if (h.startsWith('t')) return 'b-tgt';
    if (h.startsWith('b')) return 't-tgt';
    return undefined;
  };

  const onConnectStart: OnConnectStart = useCallback((_e, params) => {
    connectingNodeId.current = params.nodeId || null;
    connectingFromHandle.current = params.handleId || null;
    didConnectRef.current = false;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    async (e) => {
      // if a real connect fired, skip
      if (didConnectRef.current) {
        didConnectRef.current = false;
        return;
      }
      const target = e.target as HTMLElement;
      const isPane = target?.classList?.contains('react-flow__pane');
      if (!isPane || !wrapperRef.current || !connectingNodeId.current) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const p = screenToFlowPosition({ x: (e as MouseEvent).clientX - bounds.left, y: (e as MouseEvent).clientY - bounds.top });

      const src = decisions.find((d) => d.id === connectingNodeId.current);
      const newNode = await addNodeAt({ x: p.x - NODE / 2, y: p.y - NODE / 2 }, (src?.kind || 'decision') as Kind);
      if (newNode) {
        await onConnect({
          source: connectingNodeId.current!,
          target: newNode.id,
          sourceHandle: connectingFromHandle.current || undefined,
          targetHandle: opposite(connectingFromHandle.current),
        });
        setEditingId(newNode.id);
      }

      connectingNodeId.current = null;
      connectingFromHandle.current = null;
    },
    [decisions, onConnect, screenToFlowPosition]
  );

  const onNodeDragStop = useCallback(async (_e: any, node: Node) => {
    await supabase.from('decisions').update({ x: node.position.x, y: node.position.y }).eq('id', node.id);
  }, []);

  const onNodeDoubleClick = useCallback(
    (_e: any, n: Node) => {
      const d = decisions.find((x) => x.id === n.id) || null;
      setSelectedEdge(null);
      setSelected(d);
    },
    [decisions]
  );

  const onEdgeDoubleClick = useCallback((_e: any, edge: Edge) => {
    setSelected(null);
    setSelectedEdge(edge);
  }, []);

  const onEdgeUpdate = useCallback(async (oldEdge: Edge, conn: Connection) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === oldEdge.id
          ? { ...e, source: conn.source!, target: conn.target!, sourceHandle: conn.sourceHandle, targetHandle: conn.targetHandle }
          : e
      )
    );
    await supabase
      .from('decision_links')
      .update({
        from_id: conn.source,
        to_id: conn.target,
        source_handle: conn.sourceHandle || null,
        target_handle: conn.targetHandle || null,
      })
      .eq('id', oldEdge.id);
  }, []);

  // filtering by view
  const filteredNodes = useMemo(
    () =>
      nodes.map((n) => {
        if (view === 'information') return { ...n, hidden: n.type !== 'data' };
        if (view === 'opportunities') return { ...n, hidden: n.type !== 'opportunity' };
        return n;
      }),
    [nodes, view]
  );

  const filteredEdges = useMemo(() => {
    if (view === 'opportunities') return edges.map((e) => ({ ...e, hidden: true }));
    return edges.map((e) => ({ ...e, hidden: false }));
  }, [edges, view]);

  const sums = useMemo(() => {
    const vis = decisions.filter((d) => (view === 'information' ? d.kind === 'data' : view === 'opportunities' ? d.kind === 'opportunity' : true));
    const q = vis.reduce((a, d) => a + (d.queue_time_min || 0), 0);
    const a = vis.reduce((b, d) => b + (d.action_time_min || 0), 0);
    return { q, a, t: q + a };
  }, [decisions, view]);

  return (
    <div className="relative m-4 rounded-2xl border bg-[var(--canvas-bg,#f8f5ef)] overflow-hidden">
      <CanvasToolbar view={view} setView={setView} />

      <div ref={wrapperRef} style={{ height: '80vh', overflow: 'hidden' }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ updatable: true, type: 'step' }}
          connectionMode={ConnectionMode.Loose}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={onNodeDragStop}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeUpdate={onEdgeUpdate}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={() => {
            setSelected(null);
            setSelectedEdge(null);
            setEditingId(null);
          }}
          fitView
          panOnDrag
          nodesDraggable
          nodesConnectable
          selectionOnDrag
          snapToGrid
          snapGrid={[24, 24]}
          edgeUpdaterRadius={40}
          connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
        >
          <Background gap={24} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      {/* sums */}
      <div className="absolute left-2 bottom-16 text-xs bg-white/90 rounded px-2 py-1 shadow pointer-events-none">
        <div>Queue: {sums.q} min</div>
        <div>Action: {sums.a} min</div>
        <div>Total: {sums.t} min</div>
      </div>

      {selected && (
        <SipocInspector
          decision={selected}
          onClose={() => setSelected(null)}
          onSaved={(d) => {
            setDecisions((p) => p.map((x) => (x.id === d.id ? { ...x, ...d } : x)));
            setNodes((p) =>
              p.map((n) =>
                n.id === d.id ? { ...n, type: d.kind as Kind, data: { ...n.data, label: (d.kind === 'choice' ? 'Choice: ' : '') + d.title, ...colorFor(d.kind as Kind) } } : n
              )
            );
          }}
          onDelete={(id) => {
            setEdges((p) => p.filter((e) => e.source !== id && e.target !== id));
            setNodes((p) => p.filter((n) => n.id !== id));
            setDecisions((p) => p.filter((d) => d.id !== id));
          }}
        />
      )}

      {selectedEdge && (
        <EdgeInspector
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onChange={(upd) => {
            setEdges((eds) =>
              eds.map((e) => {
                if (e.id !== selectedEdge.id) return e;
                const nextType = (upd.type as any) || e.type;
                const mStart = upd.data?.arrowStart ? { type: MarkerType.ArrowClosed } : undefined;
                const mEnd = upd.data?.arrowEnd ? { type: MarkerType.ArrowClosed } : undefined;
                const dash =
                  upd.data?.pattern === 'dotted' ? '2 6' : upd.data?.pattern === 'dashed' ? '8 6' : undefined;
                return { ...e, type: nextType, data: { ...(e.data || {}), ...(upd.data || {}) }, markerStart: mStart, markerEnd: mEnd, style: { ...(e.style || {}), strokeDasharray: dash } };
              })
            );
          }}
        />
      )}
    </div>
  );
}

export default function ProjectCanvasPage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}
