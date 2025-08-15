'use client';
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

type Data = {
  label: string;
};

export default function DiamondNode({ data, selected }: NodeProps<Data>) {
  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      {/* diamond */}
      <div
        className={clsx(
          'absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm',
          selected ? 'ring-2 ring-dtl-teal' : ''
        )}
        style={{
          width: 98,
          height: 98,
          transform: 'rotate(45deg)',
          background: '#F6E7B2'
        }}
      />

      {/* label (counter-rotate) */}
      <div
        className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-slate-700"
        style={{ transform: 'rotate(-45deg)' }}
      >
        {data.label}
      </div>

      {/* handles (sources) */}
      <Handle id="t-src" type="source" position={Position.Top}    style={{ left: 70 }} />
      <Handle id="r-src" type="source" position={Position.Right}  style={{ top: 70 }} />
      <Handle id="b-src" type="source" position={Position.Bottom} style={{ left: 70 }} />
      <Handle id="l-src" type="source" position={Position.Left}   style={{ top: 70 }} />

      {/* handles (targets) */}
      <Handle id="t-tgt" type="target" position={Position.Top}    style={{ left: 70 }} />
      <Handle id="r-tgt" type="target" position={Position.Right}  style={{ top: 70 }} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} style={{ left: 70 }} />
      <Handle id="l-tgt" type="target" position={Position.Left}   style={{ top: 70 }} />
    </div>
  );
}
