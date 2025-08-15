'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

type Props = {
  id: string;
  data: {
    label: string;
    bg: string;
    textColor: string;
    fold?: string; // not used on diamond
  };
  selected?: boolean;
};

export default function DiamondNode({ data, selected }: Props) {
  const { label, bg, textColor } = data;

  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <div
        className={clsx(
          'absolute inset-0 m-auto rounded-md border shadow-sm',
          selected ? 'ring-2 ring-teal-500' : 'border-slate-300'
        )}
        style={{
          width: 90,
          height: 90,
          background: bg,
          transform: 'translate(25px,25px) rotate(45deg)',
        }}
      />
      {/* horizontal label overlaid */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium"
        style={{ color: textColor }}
      >
        {label}
      </div>

      {/* handles at cardinal points of the diamond */}
      <Handle id="t-src" type="source" position={Position.Top} className="!w-2 !h-2" />
      <Handle id="b-src" type="source" position={Position.Bottom} className="!w-2 !h-2" />
      <Handle id="l-src" type="source" position={Position.Left} className="!w-2 !h-2" />
      <Handle id="r-src" type="source" position={Position.Right} className="!w-2 !h-2" />

      <Handle id="t-tgt" type="target" position={Position.Top} className="!w-2 !h-2" />
      <Handle id="b-tgt" type="target" position={Position.Bottom} className="!w-2 !h-2" />
      <Handle id="l-tgt" type="target" position={Position.Left} className="!w-2 !h-2" />
      <Handle id="r-tgt" type="target" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}
