'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  addEdge, Connection, Edge, Node, OnConnect, OnEdgesDelete, OnNodesDelete
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import CanvasToolbar from '@/components/CanvasToolbar';
import SipocInspector from '@/components/SipocInspector';

type Decision = {
  id: string;
  project_id: string;
  title: string;
  statement: string | null;
  status: 'queued'|'in_progress'|'decided'|'blocked';
  priority: number | null;
  x: number | null;
  y: number | null;
  supplier_who: string | null;
  supplier_storage: string | null;
  supplier_comm: string | null;
  input_what: string | null;
  input_local_storage: string | null;
  input_preprocess: string | null;
  process_to_information: string | null;
  decision_upon_info: string | null;
  decision_comm: string | null;
  output_what: string | null;
  output_storage: string | null;
  output_comm: string | null;
  customer_who: string | null;
  handoff_notes: string | null;
};

type Link = { id: string; from_id: string; to_id: string; kind: string };

export default function ProjectCanvas() {
  const params = useParams();
  const projectId = params.id as string;

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<Decision | null>(null);

  const load = useCallback(async () => {
    const { data: decisions } = await supabase
      .from('decisions')
      .select('*')
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
      position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
      data: { label: d.title || 'Decision' }
    })));

    setEdges(ls.map((l) => ({
      id: l.id,
      source: l.from_id,
      target: l.to_id,
      label: l.kind
    })));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const onConnect: OnConnect = useCallback(async (c: Connection) => {
    if (!c.source || !c.target) return;
    const { data, error } = await supabase
      .from('decision_links').insert({
        project_id: projectId,
        from_id: c.source,
        to_id: c.target,
        kind: 'precedes'
      }).select('*').single();
    if (!error && data) {
      setEdges((eds) => addEdge({ id: data.id, source: data.from_id, target: data.to_id, label: data.kind }, eds));
    }
  }, [projectId]);

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

  function addDecision() {
    const x = 120 + (decisions.length % 5) * 140;
    const y = 120 + Math.floor(decisions.length / 5) * 120;
    supabase.from('decisions').insert({
      project_id: projectId,
      title: 'New decision',
      statement: '',
      x, y
    }).select('*').single().then(({ data, error }) => {
      if (!error && data) {
        const d = data as Decision;
        setDecisions(prev => [...prev, d]);
        setNodes(prev => [...prev, {
          id: d.id,
          position: { x: Number(d.x) || 100, y: Number(d.y) || 100 },
          data: { label: d.title }
        }]);
      }
    });
  }

  function selectNode(nodeId: string) {
    const d = decisions.find(d => d.id === nodeId) || null;
    setSelected(d);
  }

  function onSaved(updated: Decision) {
    setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
    setNodes(prev => prev.map(n => n.id === updated.id ? { ...n, data: { label: updated.title || 'Decision' } } : n));
  }

  function onDelete(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setDecisions(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="relative h-[80vh] m-4 rounded-2xl border bg-white">
      <CanvasToolbar onAddDecision={addDecision} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onNodeClick={(_e, n) => selectNode(n.id)}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <SipocInspector
        decision={selected}
        onClose={() => setSelected(null)}
        onSaved={onSaved}
        onDelete={onDelete}
      />
    </div>
  );
}
