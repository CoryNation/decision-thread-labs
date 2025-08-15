'use client';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

export default function DiamondNode({ data, selected }: NodeProps) {
  const bg = '#F6E7B2';
  const fg = '#1f2937';

  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <div
        className={clsx(
          'absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm',
          selected && 'outline outline-2 outline-[var(--dtl-teal)]'
        )}
        style={{
          width: 100,
          height: 100,
          background: bg,
          color: fg,
          transform: 'translate(20px,20px) rotate(45deg)',
        }}
      />
      {/* Unrotated label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="px-2 text-sm font-semibold">{data?.label}</div>
      </div>

      {/* Midpoint handles on all sides */}
      <Handle type="source" id="t-src" position={Position.Top} style={{ left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="target" id="t-tgt" position={Position.Top} style={{ left: '50%', transform: 'translateX(-50%)' }} />

      <Handle type="source" id="r-src" position={Position.Right} style={{ top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" id="r-tgt" position={Position.Right} style={{ top: '50%', transform: 'translateY(-50%)' }} />

      <Handle type="source" id="b-src" position={Position.Bottom} style={{ left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="target" id="b-tgt" position={Position.Bottom} style={{ left: '50%', transform: 'translateX(-50%)' }} />

      <Handle type="source" id="l-src" position={Position.Left} style={{ top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" id="l-tgt" position={Position.Left} style={{ top: '50%', transform: 'translateY(-50%)' }} />
    </div>
  );
}
