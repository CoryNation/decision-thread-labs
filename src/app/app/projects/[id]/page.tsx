
'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType,
  addEdge, Connection, Edge, Node, OnConnect,
  ReactFlowProvider, useReactFlow,
  useNodesState, useEdgesState, OnConnectStart, OnConnectEnd
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';
import StickyNode from '@/components/nodes/StickyNode';
import OrthEdge from '@/components/edges/OrthEdge';
import EdgeInspector from '@/components/EdgeInspector';

type K = 'decision'|'data'|'opportunity'|'gateway';

type Decision = {
  id: string;
  project_id: string;
  kind: K;
  title: string;
  statement: string | null;
  x: number | null;
  y: number | null;
  queue_time_min: number | null;
  action_time_min: number | null;
};

type Link = { id: string; from_id: string; to_id: string; kind: string };

const nodeTypes = {
  decision: StickyNode,
  data: StickyNode,
  opportunity: StickyNode,
  gateway: StickyNode,
};

const edgeTypes = {
  process: OrthEdge,
  data: OrthEdge,
};

export default function ProjectCanvasPage() {
  return (
    <ReactFlowProvider>
      <ProjectCanvasInner />
    </ReactFlowProvider>
  );
}

function ProjectCanvasInner() {
  const params = useParams();
  const projectId = params.id as string;
  const [view, setView] = useState<'process'|'information'|'opportunities'>('process');

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const flowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const colorForKind = (k: K) => {
    if (k === 'data') return { bg: '#DCFCE7', textColor:'#1F7A1F' };
    if (k === 'opportunity') return { bg: '#CDE3FF', textColor:'#1f2937' };
    if (k === 'decision') return { bg: '#FFF7B3', textColor:'#1f2937' };
    return { bg: '#F6E7B2', textColor:'#1f2937' };
  };

  const edgeColorFor = (k: string) => (k === 'data' ? '#228B22' : '#5A6C80');

  function addNodeAt(pos: {x:number;y:number}, kind: K, title?: string) {
    return supabase.from('decisions').insert({
      project_id: projectId, kind, title: title || (kind==='data'?'Data':'New item'), x: pos.x, y: pos.y
    }).select('*').single().then(({ data }) => {
      if (data) {
        const d = data as any;
        setDecisions(prev => [...prev, d]);
        setNodes(prev => [...prev, {
          id: d.id, type: d.kind, draggable: true,
          position: {x:d.x||0,y:d.y||0},
          data: { label: (d.kind==='gateway'?'Choice: ':'') + d.title, onRename, onTabCreate: handleTabCreate, isEditing: false, ...colorForKind(d.kind) }
        }]);
        return d;
      }
      return null;
    });
  }

  const NODE_SIZE = 120;
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
    const src = decisions.find(d => d.id === c.source);
    const tgt = decisions.find(d => d.id === c.target);
    const kind = (src?.kind === 'data' || tgt?.kind === 'data') ? 'data' : 'precedes';
    const { data } = await supabase
      .from('decision_links').insert({
        project_id: projectId, from_id: c.source, to_id: c.target, kind
      }).select('*').single();
    if (data) {
      setEdges((eds: any) => addEdge({
        id: data.id, source: data.from_id, target: data.to_id,
        type: kind === 'data' ? 'data' : 'process',
        updatable: true,
        data: { label: kind === 'data' ? 'data' : undefined, edgeColor: edgeColorFor(kind), pattern: 'solid', arrowStart: false, arrowEnd: true },
        markerEnd: { type: MarkerType.ArrowClosed }
      }, eds) as any);
    }
  }, [projectId, decisions]);

  // NEW: Tab-to-create helper
  async function handleTabCreate(sourceId: string) {
    const src = decisions.find(d => d.id === sourceId);
    if (!src) return;
    const newPos = { x: (src.x || 0) + NODE_SIZE + 48, y: src.y || 0 };
    const node = await addNodeAt(newPos, (src.kind as K), undefined);
    if (node) {
      await onConnect({ source: sourceId, sourceHandle: null, target: node.id, targetHandle: null });
      setEditingId(node.id);
    }
  }

  const onConnectStart = useCallback((_, params: { nodeId?: string | null }) => {
    connectingNodeId.current = params.nodeId || null;
  }, []);

  const onConnectEnd = useCallback(async (event: any) => {
    const target = event.target as HTMLElement;
    const isPane = target.classList.contains('react-flow__pane');
    if (isPane && flowWrapper.current && connectingNodeId.current) {
      const bounds = flowWrapper.current.getBoundingClientRect();
      const p = screenToFlowPosition({ x: (event as MouseEvent).clientX - bounds.left, y: (event as MouseEvent).clientY - bounds.top });
      const kindOfSource = decisions.find(d => d.id === connectingNodeId.current)?.kind || 'decision';
      const newNode = await addNodeAt({ x: p.x - NODE_SIZE/2, y: p.y - NODE_SIZE/2 }, kindOfSource);
      if (newNode) {
        await onConnect({ source: connectingNodeId.current!, sourceHandle: null, target: newNode.id, targetHandle: null });
        setEditingId(newNode.id);
      }
    }
    connectingNodeId.current = null;
  }, [screenToFlowPosition, decisions, onConnect]);

  const onNodeDragStop = useCallback(async (_e: any, node: Node) => {
    await supabase.from('decisions')
      .update({ x: node.position.x, y: node.position.y })
      .eq('id', node.id);
  }, []);

  // Edge selection & rerouting
  const onEdgeClick = useCallback((_e: any, edge: Edge) => {
    setSelected(null);
    setSelectedEdge(edge);
  }, []);

  const onEdgeUpdate = useCallback(async (oldEdge: Edge, connection: Connection) => {
    setEdges((eds: any) => eds.map((e: any) => e.id === oldEdge.id ? { ...e, source: connection.source, target: connection.target } : e));
    await supabase.from('decision_links').update({
      from_id: connection.source, to_id: connection.target
    }).eq('id', (oldEdge as any).id);
  }, []);

  const load = useCallback(async () => {
    const { data: decisions } = await supabase
      .from('decisions')
      .select('id, project_id, kind, title, statement, x, y, queue_time_min, action_time_min')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const { data: links } = await supabase
      .from('decision_links')
      .select('*')
      .eq('project_id', projectId);

    const ds = (decisions || []) as Decision[];
    const ls = (links || []) as Link[];

    setDecisions(ds);
    setNodes(ds.map((d) => ({
      id: d.id,
      type: d.kind || 'decision',
      draggable: true,
      position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
      data: {
        label: (d.kind==='gateway' ? 'Choice: ' : '') + (d.title || 'Note'),
        onRename,
        onTabCreate: handleTabCreate,
        isEditing: editingId === d.id,
        ...colorForKind(d.kind || 'decision')
      }
    })));

    setEdges(ls.map((l) => ({
      id: l.id,
      source: l.from_id,
      target: l.to_id,
      updatable: true,
      type: l.kind === 'data' ? 'data' : 'process',
      data: { label: l.kind === 'data' ? 'data' : undefined, edgeColor: edgeColorFor(l.kind), pattern: 'solid', arrowStart: false, arrowEnd: true },
      markerStart: undefined,
      markerEnd: { type: MarkerType.ArrowClosed },
    }) as any));
  }, [projectId, editingId]);

  useEffect(() => { load(); }, [load]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  function selectNode(nodeId: string) {
    const d = decisions.find(d => d.id === nodeId) || null;
    setSelectedEdge(null);
    setSelected(d);
  }

  async function onRename(id: string, title: string) {
    await supabase.from('decisions').update({ title }).eq('id', id);
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, label: n.type==='gateway' ? 'Choice: ' + title : title } } : n));
    setDecisions(prev => prev.map(d => d.id===id ? { ...d, title } : d));
  }

  function onSaved(updated: any) {
    setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
    setNodes(prev => prev.map(n => n.id === updated.id ? {
      ...n,
      type: updated.kind,
      data: { ...n.data, label: (updated.kind==='gateway'?'Choice: ':'') + updated.title, ...colorForKind(updated.kind) }
    } : n));
  }

  function onDelete(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setDecisions(prev => prev.filter(d => d.id !== id));
  }

  function applyEdgeChanges(upd: any) {
    setEdges((eds: any) => eds.map((e: any) => {
      if (e.id !== selectedEdge.id) return e;
      const mStart = upd.data?.arrowStart ? { type: MarkerType.ArrowClosed } : undefined;
      const mEnd = upd.data?.arrowEnd ? { type: MarkerType.ArrowClosed } : undefined;
      const dash = upd.data?.pattern === 'dotted' ? '2 6' : upd.data?.pattern === 'dashed' ? '8 6' : undefined;
      return {
        ...e,
        data: { ...(e.data||{}), ...upd.data },
        markerStart: mStart,
        markerEnd: mEnd,
        style: { ...(e.style||{}), strokeDasharray: dash },
      };
    }));
  }

  const filteredNodes = useMemo(() => {
    return nodes.map((n: any) => {
      if (view === 'information') return { ...n, hidden: n.type !== 'data' };
      if (view === 'opportunities') return { ...n, hidden: n.type !== 'opportunity' };
      return n;
    });
  }, [nodes, view]);

  const filteredEdges = useMemo(() => {
    if (view === 'information') return edges.map((e: any) => ({ ...e, hidden: e.type !== 'data' }));
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
    const t = q + a;
    return { q, a, t };
  }, [decisions, view]);

  return (
    <div className="relative m-4 rounded-2xl border" style={{ backgroundColor: '#EDE6D6', overflow: 'hidden' }}>
      <CanvasToolbar view={view} setView={setView} />
      <div ref={flowWrapper} style={{ height: '80vh', overflow: 'hidden' }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneClick={() => { setSelected(null); setSelectedEdge(null); setEditingId(null); }}
          onNodeClick={(_e, n) => selectNode(n.id)}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgeClick={onEdgeClick}
          onEdgeUpdate={onEdgeUpdate}
          fitView
          panOnDrag={true}
          nodesDraggable={true}
          nodesConnectable={true}
          selectionOnDrag
          snapToGrid
          snapGrid={[24,24]}
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
          onSaved={onSaved}
          onDelete={onDelete}
        />
      )}
      {selectedEdge && (
        <EdgeInspector
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onChange={applyEdgeChanges}
        />
      )}
    </div>
  );
}
