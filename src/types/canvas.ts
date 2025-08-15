// src/types/canvas.ts
import type { Node, Edge } from 'reactflow';

export type Kind = 'decision' | 'data' | 'opportunity' | 'choice';

export type Decision = {
  id: string;
  project_id: string;
  kind: Kind;
  title: string;
  statement?: string | null;
  x?: number | null;
  y?: number | null;
  queue_time_min?: number | null;
  action_time_min?: number | null;
};

export type Link = {
  id: string;
  project_id: string;
  from_id: string;
  to_id: string;
  kind: 'precedes' | 'data';
  source_handle?: string | null;
  target_handle?: string | null;
  curve?: 'step' | 'bezier';
  pattern?: 'solid' | 'dotted' | 'dashed';
  arrow_start?: boolean | null;
  arrow_end?: boolean | null;
};

// --- React Flow data carried by each node/edge ---
export type NodeData = {
  label: string;
  onRename: (id: string, title: string) => Promise<void>;
  isEditing: boolean;
  bg: string;
  textColor: string;
  fold: string;
};

export type EdgeData = {
  edgeColor: string;
  pattern: 'solid' | 'dotted' | 'dashed';
  arrowStart: boolean;
  arrowEnd: boolean;
};

// The actual React Flow types your canvas uses
export type RFNode = Node<NodeData, Kind>;
export type RFEdge = Edge<EdgeData>;
