'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

type Props = {
  id: string;
  data: {
    label: string;
    bg: string;
    textColor: string;
    fold: string;
    isEditing?: boolean;
    onRename?: (id: string, title: string) => void;
  };
  selected?: boolean;
};

export default function StickyNode({ id, data, selected }: Props) {
  const { label, bg, textColor, fold } = data;

  return (
    <div
      className={clsx(
        'relative rounded-lg border shadow-sm',
        selected ? 'ring-2 ring-teal-500' : 'border-slate-300'
      )}
      style={{ width: 140, height: 140, background: bg, color: textColor }}
    >
      {/* cut corner */}
      <div
        className="absolute right-0 bottom-0"
        style={{
          width: 28,
          height: 28,
          background: 'transparent',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }}
      />
      {/* folded flap */}
      <div
        className="absolute right-0 bottom-0"
        style={{
          width: 28,
          height: 28,
          background: fold,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />

      <div className="px-3 pt-3 text-sm font-medium leading-snug line-clamp-3">{label}</div>

      {/* 4 side handles (midpoints) */}
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
