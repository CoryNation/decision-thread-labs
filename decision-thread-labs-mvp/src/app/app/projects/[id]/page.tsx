'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/lib/supabaseClient';

type Decision = {
  id: string; title: string; x: number; y: number;
  statement: string | null;
};

export default function ProjectCanvas() {
  const params = useParams();
  const projectId = params.id as string;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: decisions } = await supabase.from('decisions').select('id,title,x,y').eq('project_id', projectId);
      const { data: links } = await supabase.from('decision_links').select('*').eq('project_id', projectId);
      setNodes((decisions || []).map(d => ({ id: d.id, position: { x: Number(d.x)||0, y: Number(d.y)||0 }, data: { label: d.title }})))
      setEdges((links || []).map((l:any) => ({ id: l.id, source: l.from_id, target: l.to_id, label: l.kind })))
    };
    load();
  }, [projectId]);

  const onConnect = (c: Connection) => setEdges(eds => addEdge({ ...c, type: 'default' }, eds));

  return (
    <div className="h-[80vh] m-4 rounded-2xl border bg-white">
      <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} fitView>
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  )
}
