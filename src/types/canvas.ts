// src/types/canvas.ts
export type Kind = 'decision' | 'data' | 'opportunity' | 'choice';

export interface Decision {
  id: string;
  project_id: string;
  kind: Kind;
  title: string;
  statement: string | null;
  x: number | null;
  y: number | null;
  queue_time_min: number | null;
  action_time_min: number | null;
}

export type Curve = 'step' | 'smoothstep';
export type Pattern = 'solid' | 'dashed' | 'dotted';

export interface Link {
  id: string;
  from_id: string;
  to_id: string;
  project_id?: string;
  kind: 'precedes' | 'data';
  source_handle?: string | null;
  target_handle?: string | null;
  curve?: Curve | null;
  pattern?: Pattern | null;
  arrow_start?: boolean | null;
  arrow_end?: boolean | null;
}
