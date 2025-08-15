'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

type StickyData = {
  label: string;
  onRename?: (id: string, title: string) => Promise<void> | void;
  onTabCreate?: (id: string) => Promise<void> | void;
  isEditing?: boolean;
  bg: string;
  textColor: string;
  fold: string; // darker fold color
};

export default function StickyNode({ id, data, selected }: NodeProps<StickyData>) {
  const [editing, setEditing] = useState(!!data.isEditing);
  const [value, setValue] = useState(data.label ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setEditing(!!data.isEditing), [data.isEditing]);
  useEffect(() => setValue(data.label ?? ''), [data.label]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = async () => {
    setEditing(false);
    if (data.onRename) await data.onRename(id, value.trim() || 'New item');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key === 'Enter') await commit();
    if (e.key === 'Escape') { setEditing(false); setValue(data.label ?? ''); }
    if (e.key === 'Tab' && data.onTabCreate) {
      e.preventDefault();
      await commit();
      await data.onTabCreate(id);
    }
  };

  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      {/* sticky base */}
      <div
        className={clsx(
          'absolute inset-0 rounded-xl border shadow transition',
          selected ? 'ring-2 ring-dtl-teal' : 'shadow-sm'
        )}
        style={{ background: data.bg, color: data.textColor }}
      />

      {/* folded corner (bottom-right): a triangular overlay matching the cutout */}
      <div
        className="absolute"
        style={{
          right: 0, bottom: 0,
          width: 26, height: 26,
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          background: data.fold
        }}
      />

      {/* text area */}
      <div className="absolute inset-0 p-3 flex items-start justify-start">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full rounded border border-slate-300 bg-white/95 px-2 py-1 text-sm outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
          />
        ) : (
          <div
            className="text-sm font-medium cursor-text select-none"
            onDoubleClick={() => setEditing(true)}
          >
            {value}
          </div>
        )}
      </div>

      {/* source handles */}
      <Handle id="t-src" type="source" position={Position.Top}    style={{ left: 70 }} />
      <Handle id="r-src" type="source" position={Position.Right}  style={{ top: 70 }} />
      <Handle id="b-src" type="source" position={Position.Bottom} style={{ left: 70 }} />
      <Handle id="l-src" type="source" position={Position.Left}   style={{ top: 70 }} />

      {/* target handles */}
      <Handle id="t-tgt" type="target" position={Position.Top}    style={{ left: 70 }} />
      <Handle id="r-tgt" type="target" position={Position.Right}  style={{ top: 70 }} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} style={{ left: 70 }} />
      <Handle id="l-tgt" type="target" position={Position.Left}   style={{ top: 70 }} />
    </div>
  );
}
