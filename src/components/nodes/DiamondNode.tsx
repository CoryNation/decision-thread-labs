'use client';

import { Handle, Position } from 'reactflow';

type Props = {
  data: {
    label: string;
    bg?: string;
    textColor?: string;
    border?: string;
  };
  selected?: boolean;
};

export default function DiamondNode({ data, selected }: Props) {
  const size = 120;
  const bg = data.bg ?? '#FFF7B3';
  const stroke = data.border ?? '#94a3b8';
  const color = data.textColor ?? '#1f2937';

  return (
    <div className={`relative ${selected ? 'ring-2 ring-teal-400 rounded-xl' : ''}`} style={{ width: size, height: size }}>
      {/* Rotated square */}
      <div
        className="absolute inset-0 m-auto rounded-md border shadow-sm"
        style={{
          transform: 'rotate(45deg)',
          background: bg,
          borderColor: stroke,
        }}
      />

      {/* Label (counter-rotated) */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium"
        style={{ color, transform: 'rotate(-45deg)' }}
      >
        {data.label}
      </div>

      {/* 4-side handles on the bounding box so connection feels natural */}
      <Handle id="t-tgt" type="target" position={Position.Top} />
      <Handle id="r-tgt" type="target" position={Position.Right} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} />
      <Handle id="l-tgt" type="target" position={Position.Left} />

      <Handle id="t-src" type="source" position={Position.Top} />
      <Handle id="r-src" type="source" position={Position.Right} />
      <Handle id="b-src" type="source" position={Position.Bottom} />
      <Handle id="l-src" type="source" position={Position.Left} />
    </div>
  );
}
