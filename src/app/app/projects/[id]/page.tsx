'use client';
import type { Decision, Kind, Link } from '@/types/canvas';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType,
  addEdge, Connection, Edge, Node, OnConnect, ConnectionMode,
  ReactFlowProvider, useReactFlow,
  useNodesState, useEdgesState, OnConnectStart, OnConnectEnd
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';
import StickyNode from '@/components/nodes/StickyNode';
import DiamondNode from '@/components/nodes/DiamondNode';
import EdgeInspector from '@/components/EdgeInspector';


const nodeTypes = {
  decision: StickyNode,
  data: StickyNode,
  opportunity: StickyNode,
  choice: DiamondNode,
} as const;

export default function ProjectCanvasPage() {
  return <ReactFlowProvider><Inner /></ReactFlowProvider>;
}

function Inner() {
  const { id: projectId } = useParams() as { id: string };
  const [view, setView] = useState<'process'|'information'|'opportunities'>('process');

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const flowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const connectingFromHandle = useRef<string | null>(null);
  const didConnectRef = useRef<boolean>(false);

  const { screenToFlowPosition } = useReactFlow();

  const colorForKind = (k: Kind) => {
    if (k === 'data') return { bg: '#DCFCE7', textColor:'#1F7A1F', fold:'rgba(31,122,31,.22)' };
    if (k === 'opportunity') return { bg: '#CDE3FF', textColor:'#1f2937', fold:'rgba(30,64,175,.18)' };
    if (k === 'decision') return { bg: '#FFF7B3', textColor:'#1f2937', fold:'rgba(0,0,0,.14)' };
    return { bg: '#F6E7B2', textColor:'#1f2937', fold:'rgba(0,0,0,.14)' }; // choice
  };
  const edgeColorFor = (k: string) => (k === 'data' ? '#228B22' : '#5A6C80');

  const onRename = useCallback(async (id: string, title: string) => {
    await supabase.from('decisions').update({ title }).eq('id', id);
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, title } : d));
    setNodes(prev => prev.map((n: any) =>
      n.id !== id ? n : ({ ...n, data: { ...n.data, label: ((n.type as string)==='choice'?'Choice: ':'') + title } })
    ));
  }, [setDecisions, setNodes]);

  const load = useCallback(async () => {
    const { data: decisions } = await supabase.from('decisions')
      .select('id, project_id, kind, title, statement, x, y, queue_time_min, action_time_min')
      .eq('project_id', projectId).order('created_at', { ascending: true });

    const { data: links } = await supabase.from('decision_links')
      .select('*').eq('project_id', projectId);

    const ds = (decisions || []) as Decision[];
    const ls = (links || []) as Link[];

    setDecisions(ds);
    setNodes(ds.map((d) => ({
      id: d.id,
      type: (d.kind || 'decision') as Kind,
      draggable: true,
      position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
      data: {
        label: (d.kind==='choice' ? 'Choice: ' : '') + (d.title || 'Note'),
        onRename,
        onTabCreate: handleTabCreate,
        isEditing: editingId === d.id,
        ...colorForKind((d.kind || 'decision') as Kind)
      }
    })));

    setEdges(ls.map((l) => ({
      id: l.id,
      source: l.from_id,
      target: l.to_id,
      sourceHandle: l.source_handle || undefined,
      targetHandle: l.target_handle || undefined,
      updatable: true,
      type: (l.curve as any) || 'step',
      data: {
        edgeColor: edgeColorFor(l.kind),
        pattern: l.pattern || 'solid',
        arrowStart: !!l.arrow_start,
        arrowEnd: l.arrow_end !== false,
      },
      markerStart: l.arrow_start ? { type: MarkerType.ArrowClosed } : undefined,
      markerEnd: l.arrow_end !== false ? { type: MarkerType.ArrowClosed } : undefined,
      style: l.pattern==='dotted' ? { strokeDasharray:'2 6' } : l.pattern==='dashed' ? { strokeDasharray:'8 6' } : undefined
    }) as any));
  }, [projectId, editingId, onRename]);

  useEffect(() => { load(); }, [load]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  }, []);

  const NODE_SIZE = 140;

  function addNodeAt(pos: {x:number;y:number}, kind: K, title?: string) {
    return supabase.from('decisions').insert({
      project_id: projectId, kind, title: title || (kind==='data'?'Data':'New item'), x: pos.x, y: pos.y
    }).select('*').single().then(({ data }) => {
      if (data) {
        const d = data as Decision;
        setDecisions(prev => [...prev, d]);
        setNodes(prev => [...prev, {
          id: d.id, type: d.kind, draggable: true,
          position: {x:d.x||0,y:d.y||0},
          data: { label: (d.kind==='choice'?'Choice: ':'') + d.title, onRename, onTabCreate: handleTabCreate, isEditing: false, ...colorForKind(d.kind as K) }
        }]);
        return d;
      }
      return null;
    });
  }

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as K;
    if (!type || !flowWrapper.current) return;
    const bounds = flowWrapper.current.getBoundingClientRect();
    const p = screenToFlowPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    const position = { x: p.x - NODE_SIZE/2, y: p.y - NODE_SIZE/2 };
    addNodeAt(position, type);
  }, [screenToFlowPosition]);

  const onConnect: OnConnect = useCallback(async (c: Connection) => {
    if (!c.source || !c.target) return;
    didConnectRef.current = true;

    const src = decisions.find(d => d.id === c.source);
    const tgt = decisions.find(d => d.id === c.target);
    const kind = (src?.kind === 'data' || tgt?.kind === 'data') ? 'data' : 'precedes';

    const { data } = await supabase.from('decision_links').insert({
      project_id: projectId, from_id: c.source, to_id: c.target,
      kind, source_handle: c.sourceHandle || null, target_handle: c.targetHandle || null,
      curve: 'step', pattern: 'solid', arrow_end: true, arrow_start: false
    }).select('*').single();

    if (data) {
      setEdges((eds: any) => addEdge({
        id: data.id, source: data.from_id, target: data.to_id,
        sourceHandle: data.source_handle || undefined,
        targetHandle: data.target_handle || undefined,
        updatable: true, type: 'step',
        data: { edgeColor: edgeColorFor(kind), pattern:'solid', arrowStart:false, arrowEnd:true },
        markerEnd: { type: MarkerType.ArrowClosed }
      }, eds) as any);
    }
  }, [projectId, decisions]);

  const oppositeTarget = (srcHandle?: string | null) => {
    if (!srcHandle) return null;
    if (srcHandle.startsWith('r')) return 'l-tgt';
    if (srcHandle.startsWith('l')) return 'r-tgt';
    if (srcHandle.startsWith('t')) return 'b-tgt';
    if (srcHandle.startsWith('b')) return 't-tgt';
    return null;
  };

  const onConnectStart: OnConnectStart = useCallback((_e, params) => {
    connectingNodeId.current = params.nodeId || null;
    connectingFromHandle.current = params.handleId || null;
    didConnectRef.current = false;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(async (event) => {
    if (didConnectRef.current) { didConnectRef.current = false; return; }

    const target = event.target as HTMLElement;
    const isPane = target.classList.contains('react-flow__pane');

    if (isPane && flowWrapper.current && connectingNodeId.current) {
      const bounds = flowWrapper.current.getBoundingClientRect();
      const p = screenToFlowPosition({ x: (event as MouseEvent).clientX - bounds.left, y: (event as MouseEvent).clientY - bounds.top });

      const src = decisions.find(d => d.id === connectingNodeId.current);
      const newNode = await addNodeAt({ x: p.x - NODE_SIZE/2, y: p.y - NODE_SIZE/2 }, (src?.kind || 'decision') as K);

      if (newNode) {
        await onConnect({
          source: connectingNodeId.current!,
          target: newNode.id,
          sourceHandle: connectingFromHandle.current || undefined,
          targetHandle: oppositeTarget(connectingFromHandle.current) || undefined
        });
        setEditingId(newNode.id);
      }
    }

    connectingNodeId.current = null;
    connectingFromHandle.current = null;
    didConnectRef.current = false;
  }, [decisions, onConnect, screenToFlowPosition]);

  const onNodeDragStop = useCallback(async (_e: any, node: Node) => {
    await supabase.from('decisions').update({ x: node.position.x, y: node.position.y }).eq('id', node.id);
  }, []);

  const onNodeDoubleClick = useCallback((_e: any, n: Node) => {
    const d = decisions.find((dd) => dd.id === n.id) || null;
    setSelectedEdge(null); setSelected(d);
  }, [decisions]);

  const onEdgeDoubleClick = useCallback((_e: any, edge: Edge) => {
    setSelected(null); setSelectedEdge(edge);
  }, []);

  const onEdgeUpdate = useCallback(async (oldEdge: Edge, connection: Connection) => {
    setEdges((eds: any) => eds.map((e: any) => e.id === oldEdge.id ? {
      ...e, source: connection.source, target: connection.target,
      sourceHandle: connection.sourceHandle, targetHandle: connection.targetHandle
    } : e));
    await supabase.from('decision_links').update({
      from_id: connection.source, to_id: connection.target,
      source_handle: connection.sourceHandle || null, target_handle: connection.targetHandle || null
    }).eq('id', (oldEdge as any).id);
  }, []);

  async function handleTabCreate(sourceId: string) {
    const src = decisions.find(d => d.id === sourceId); if (!src) return;
    const newPos = { x: (src.x || 0) + NODE_SIZE + 48, y: src.y || 0 };
    const node = await addNodeAt(newPos, (src.kind as K), undefined);
    if (node) {
      await onConnect({ source: sourceId, target: node.id, sourceHandle: 'r-src', targetHandle: 'l-tgt' });
      setEditingId(node.id);
    }
  }

  const filteredNodes = useMemo(() => nodes.map((n: any) => {
    if (view === 'information') return { ...n, hidden: n.type !== 'data' };
    if (view === 'opportunities') return { ...n, hidden: n.type !== 'opportunity' };
    return n;
  }), [nodes, view]);

  const filteredEdges = useMemo(() => {
    if (view === 'information') return edges.map((e: any) => ({ ...e, hidden: false }));
    if (view === 'opportunities') return edges.map((e: any) => ({ ...e, hidden: true }));
    return edges;
  }, [edges, view]);

  const sums = useMemo(() => {
    const visible = decisions.filter(d => {
      if (view === 'information') return d.kind === 'data';
      if (view === 'opportunities') return d.kind === 'opportunity';
      return true;
    });
    const q = visible.reduce((a, d) => a + (d.queue_time_min || 0), 0);
    const a = visible.reduce((a2, d) => a2 + (d.action_time_min || 0), 0);
    return { q, a, t: q + a };
  }, [decisions, view]);

  return (
    <div className="relative m-4 rounded-2xl border bg-[var(--canvas-bg)] overflow-hidden">
      <CanvasToolbar view={view} setView={setView} />

      <div ref={flowWrapper} style={{ height: '80vh', overflow: 'hidden' }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ updatable: true, type:'step' }}
          connectionMode={ConnectionMode.Loose}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneClick={() => { setSelected(null); setSelectedEdge(null); setEditingId(null); }}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeUpdate={onEdgeUpdate}
          fitView
          panOnDrag
          nodesDraggable
          nodesConnectable
          selectionOnDrag
          snapToGrid
          snapGrid={[24,24]}
          edgeUpdaterRadius={30}
        >
          <Background gap={24} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      <div className="absolute left-2 bottom-16 text-xs bg-white/90 rounded px-2 py-1 shadow pointer-events-none">
        <div>Queue: {sums.q} min</div>
        <div>Action: {sums.a} min</div>
        <div>Total: {sums.t} min</div>
      </div>

      {selected && (
        <SipocInspector
          decision={selected}
          onClose={() => setSelected(null)}
          onSaved={(d: any) => {
            setDecisions(prev => prev.map((x: any) => x.id===d.id ? { ...x, ...d } : x));
            setNodes(prev => prev.map((n: any) => n.id===d.id ? {
              ...n, type: d.kind, data:{ ...n.data, label: (d.kind==='choice'?'Choice: ':'') + d.title, ...colorForKind(d.kind as K) }
            } : n));
          }}
          onDelete={(id) => {
            setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
            setNodes(prev => prev.filter(n => n.id !== id));
            setDecisions(prev => prev.filter(d => d.id !== id));
          }}
        />
      )}

      {selectedEdge && (
        <EdgeInspector
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onChange={(upd) => {
            setEdges((eds: any) => eds.map((e: any) => {
              if (e.id !== selectedEdge.id) return e;
              const type = upd.type || e.type;
              const mStart = upd.data?.arrowStart ? { type: MarkerType.ArrowClosed } : undefined;
              const mEnd   = upd.data?.arrowEnd   ? { type: MarkerType.ArrowClosed } : undefined;
              const dash = upd.data?.pattern === 'dotted' ? '2 6' : upd.data?.pattern === 'dashed' ? '8 6' : undefined;
              return { ...e, type, data: { ...(e.data||{}), ...(upd.data||{}) }, markerStart: mStart, markerEnd: mEnd, style: { ...(e.style||{}), strokeDasharray: dash } };
            }));
          }}
        />
      )}
    </div>
  );
}
