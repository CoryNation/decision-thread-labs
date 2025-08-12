'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType,
  addEdge, Connection, Edge, Node, OnConnect, OnEdgesDelete, OnNodesDelete,
  ReactFlowProvider, useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';
import DecisionSticky from '@/components/nodes/DecisionSticky';
import DataCylinder from '@/components/nodes/DataCylinder';
import OpportunitySticky from '@/components/nodes/OpportunitySticky';
import ProcessEdge from '@/components/edges/ProcessEdge';
import DataEdge from '@/components/edges/DataEdge';

type Decision = {
  id: string;
  project_id: string;
  kind: 'decision'|'data'|'opportunity';
  title: string;
  statement: string | null;
  x: number | null;
  y: number | null;
  estimated_duration_min: number | null;
};

type Link = { id: string; from_id: string; to_id: string; kind: string };

const nodeTypes = {
  decision: DecisionSticky,
  data: DataCylinder,
  opportunity: OpportunitySticky,
};

const edgeTypes = {
  process: ProcessEdge,
  data: DataEdge,
};

// Outer wrapper so ReactFlowProvider is above any hook usage
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const flowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const load = useCallback(async () => {
    const { data: decisions } = await supabase
      .from('decisions')
      .select('id, project_id, kind, title, statement, x, y, estimated_duration_min')
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
      position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
      data: { label: d.title || 'Decision' }
    })));

    setEdges(ls.map((l) => ({
      id: l.id,
      source: l.from_id,
      target: l.to_id,
      type: l.kind === 'data' ? 'data' : 'process',
      data: { label: l.kind === 'data' ? 'data' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed }
    })));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  function addNodeAt(pos: {x:number;y:number}, kind: 'decision'|'data'|'opportunity', title?: string) {
    supabase.from('decisions').insert({
      project_id: projectId, kind, title: title || (kind==='data'?'Data':'New item'), x: pos.x, y: pos.y
    }).select('*').single().then(({ data }) => {
      if (data) {
        const d = data as any;
        setDecisions(prev => [...prev, d]);
        setNodes(prev => [...prev, { id: d.id, type: d.kind, position: {x:d.x||0,y:d.y||0}, data: { label: d.title } }]);
      }
    });
  }

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as 'decision'|'data'|'opportunity';
    if (!type || !flowWrapper.current) return;
    const bounds = flowWrapper.current.getBoundingClientRect();
    const position = screenToFlowPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
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
        data: { label: kind === 'data' ? 'data' : undefined },
        markerEnd: { type: MarkerType.ArrowClosed }
      }, eds));
    }
  }, [projectId, decisions]);

  const onNodesDelete: OnNodesDelete = useCallback(async (nds) => {
    const ids = nds.map(n => n.id);
    if (ids.length) {
      await supabase.from('decisions').delete().in('id', ids);
      setDecisions((prev) => prev.filter(d => !ids.includes(d.id)));
    }
  }, []);

  const onEdgesDelete: OnEdgesDelete = useCallback(async (eds) => {
    const ids = eds.map(e => e.id);
    if (ids.length) {
      await supabase.from('decision_links').delete().in('id', ids);
    }
  }, []);

  const onNodeDragStop = useCallback(async (_e: any, node: Node) => {
    await supabase.from('decisions')
      .update({ x: node.position.x, y: node.position.y })
      .eq('id', node.id);
  }, []);

  const onConnectEnd = useCallback((event: any) => {
    const targetIsPane = (event.target as HTMLElement)?.classList?.contains('react-flow__pane');
    if (!targetIsPane) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNodeAt(position, 'decision', 'New decision');
  }, [screenToFlowPosition]);

  function selectNode(nodeId: string) {
    const d = decisions.find(d => d.id === nodeId) || null;
    setSelected(d);
  }

  function onSaved(updated: any) {
    setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
    setNodes(prev => prev.map(n => n.id === updated.id ? { ...n, type: updated.kind, data: { label: updated.title || 'Decision' } } : n));
  }

  function onDelete(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setDecisions(prev => prev.filter(d => d.id !== id));
  }

  const filteredNodes = useMemo(() => {
    if (view === 'information') return nodes.map(n => ({ ...n, hidden: n.type !== 'data' }));
    if (view === 'opportunities') return nodes.map(n => ({ ...n, hidden: n.type !== 'opportunity' }));
    return nodes;
  }, [nodes, view]);

  const filteredEdges = useMemo(() => {
    if (view === 'information') return edges.map(e => ({ ...e, hidden: e.type !== 'data' }));
    if (view === 'opportunities') return edges.map(e => ({ ...e, hidden: true }));
    return edges;
  }, [edges, view]);

  const totalMinutes = useMemo(
    () => decisions.reduce((acc, d) => acc + (d.estimated_duration_min || 0), 0),
    [decisions]
  );

  return (
    <div className="relative m-4 rounded-2xl border" style={{ backgroundColor: '#F5F3EA' }}>
      <CanvasToolbar onAddDecision={() => addNodeAt({x:160,y:120}, 'decision')} view={view} setView={setView} />
      <div ref={flowWrapper} style={{ height: '80vh' }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          onNodeClick={(_e, n) => selectNode(n.id)}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          snapToGrid
          snapGrid={[24,24]}
        >
          <Background gap={24} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      <div className="absolute bottom-2 left-2 text-xs bg-white/80 rounded px-2 py-1 shadow">
        {view === 'process' && <>Process time (sum visible): {totalMinutes} min</>}
        {view === 'information' && <>Information nodes: {decisions.filter(d=>d.kind==='data').length}</>}
        {view === 'opportunities' && <>Opportunities: {decisions.filter(d=>d.kind==='opportunity').length}</>}
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
