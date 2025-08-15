'use client';

import clsx from 'clsx';
import { Handle, Position } from 'reactflow';

type Props = {
  id: string;
  data: {
    label: string;
    bg: string;
    textColor: string;
    fold: string; // darker shade for the fold triangle
  };
  selected?: boolean;
};

const CORNER = 16;

export default function StickyNode({ data, selected }: Props) {
  return (
    <div className={clsx('relative', selected && 'ring-2 ring-teal-400 rounded-xl')}>
      {/* Base square with the bottom-right corner clipped out */}
      <div
        className="rounded-xl border shadow-sm"
        style={{
          width: 140,
          height: 140,
          background: data.bg,
          color: data.textColor,
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${CORNER}px), calc(100% - ${CORNER}px) 100%, 0 100%)`,
        }}
      />

      {/* Fold triangle that mirrors the missing corner */}
      <div
        className="absolute"
        style={{
          right: 0,
          bottom: 0,
          width: CORNER,
          height: CORNER,
          background: data.fold,
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          borderBottomRightRadius: 10,
        }}
      />

      {/* Label */}
      <div className="absolute inset-0 p-3 text-sm font-medium pointer-events-none">
        {data.label}
      </div>

      {/* Handles (targets) */}
      <Handle id="t-tgt" type="target" position={Position.Top} />
      <Handle id="r-tgt" type="target" position={Position.Right} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} />
      <Handle id="l-tgt" type="target" position={Position.Left} />

      {/* Handles (sources) */}
      <Handle id="t-src" type="source" position={Position.Top} />
      <Handle id="r-src" type="source" position={Position.Right} />
      <Handle id="b-src" type="source" position={Position.Bottom} />
      <Handle id="l-src" type="source" position={Position.Left} />
    </div>
  );
}
