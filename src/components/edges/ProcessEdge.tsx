'use client';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

export default function ProcessEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: any) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }} className="nodrag nopan text-xs bg-white/70 rounded px-1">
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
