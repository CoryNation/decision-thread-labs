// src/types/canvas.ts
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

  // SIPOC + any new fields — keep flexible to avoid compile breaks
  [key: string]: any;
};

export type Link = {
  id: string;
  project_id: string;
  from_id: string;
  to_id: string;
  kind: string;
  source_handle?: string | null;
  target_handle?: string | null;
  curve?: string | null;
  pattern?: string | null;
  arrow_start?: boolean | null;
  arrow_end?: boolean | null;
};
