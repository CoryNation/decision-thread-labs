'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType,
  addEdge, Connection, Node, OnConnect,
  ReactFlowProvider, useReactFlow,
  useNodesState, useEdgesState, OnConnectStart, OnConnectEnd
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';
import StickyNode from '@/components/nodes/StickyNode';
import OrthEdge from '@/components/edges/OrthEdge';

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
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<Decision | null>(null);
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
      type: l.kind === 'data' ? 'data' : 'process',
      data: { label: l.kind === 'data' ? 'data' : undefined, edgeColor: edgeColorFor(l.kind) },
      markerEnd: { type: MarkerType.ArrowClosed }
    })));
  }, [projectId, editingId]);

  useEffect(() => { load(); }, [load]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
    const position = { x: p.x - NODE_SIZE, y: p.y - NODE_SIZE };
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
      setEdges((eds) => addEdge({
        id: data.id, source: data.from_id, target: data.to_id,
        type: kind === 'data' ? 'data' : 'process',
        data: { label: kind === 'data' ? 'data' : undefined, edgeColor: edgeColorFor(kind) },
        markerEnd: { type: MarkerType.ArrowClosed }
      }, eds));
    }
  }, [projectId, decisions]);

  const onConnectStart: OnConnectStart = useCallback((_, params) => {
    connectingNodeId.current = params.nodeId || null;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(async (event) => {
    const target = event.target as HTMLElement;
    const isPane = target.classList.contains('react-flow__pane');
    if (isPane && flowWrapper.current && connectingNodeId.current) {
      const bounds = flowWrapper.current.getBoundingClientRect();
      const p = screenToFlowPosition({ x: (event as MouseEvent).clientX - bounds.left, y: (event as MouseEvent).clientY - bounds.top });
      const kindOfSource = decisions.find(d => d.id === connectingNodeId.current)?.kind || 'decision';
      const newNode = await addNodeAt({ x: p.x - NODE_SIZE, y: p.y - NODE_SIZE }, kindOfSource);
      if (newNode) {
        await onConnect({ source: connectingNodeId.current!, target: newNode.id });
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

  function selectNode(nodeId: string) {
    const d = decisions.find(d => d.id === nodeId) || null;
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

  async function handleTabCreate(sourceId: string) {
    const srcNode = nodes.find(n => n.id === sourceId);
    const srcDecision = decisions.find(d => d.id === sourceId);
    if (!srcNode || !srcDecision || !flowWrapper.current) return;
    const position = { x: srcNode.position.x + 160, y: srcNode.position.y };
    const newNode = await addNodeAt(position, srcDecision.kind as K);
    if (newNode) {
      await onConnect({ source: sourceId, target: newNode.id });
      setEditingId(newNode.id);
    }
  }

  const filteredNodes = useMemo(() => {
    return nodes.map(n => {
      if (view === 'information') return { ...n, hidden: n.type !== 'data' };
      if (view === 'opportunities') return { ...n, hidden: n.type !== 'opportunity' };
      return n;
    });
  }, [nodes, view]);

  const filteredEdges = useMemo(() => {
    if (view === 'information') return edges.map(e => ({ ...e, hidden: e.type !== 'data' }));
    if (view === 'opportunities') return edges.map(e => ({ ...e, hidden: true }));
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
    <div className="relative m-4 rounded-2xl border" style={{ backgroundColor: '#F5F3EA', overflow: 'hidden' }}>
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
          onPaneClick={() => { setSelected(null); setEditingId(null); }}
          onNodeClick={(_e, n) => selectNode(n.id)}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
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

      <div className="absolute left-2 bottom-16 text-xs bg-white/90 rounded px-2 py-1 shadow">
        <div>Queue: {sums.q} min</div>
        <div>Action: {sums.a} min</div>
        <div>Total: {sums.t} min</div>
      </div>

      <SipocInspector
        decision={selected}
        onClose={() => setSelected(null)}
        onSaved={onSaved}
        onDelete={onDelete}
      />
    </div>
  );
}
