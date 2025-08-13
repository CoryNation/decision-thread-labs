import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';

export default function OrthEdge(props: any) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, markerEnd, markerStart, style
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    borderRadius: 8, offset: 10,
  });

  const stroke = data?.edgeColor || (style?.stroke as string) || '#64748b';
  const dash = data?.pattern === 'dotted' ? '2 6' : data?.pattern === 'dashed' ? '8 6' : style?.strokeDasharray;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ ...(style||{}), stroke, strokeWidth: 2, strokeDasharray: dash }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              fontSize: 10,
              padding: '2px 4px',
              borderRadius: 4,
              border: '1px solid #e5e7eb',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
