'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

type Data = {
  label: string;
  bg: string;
  textColor: string;
  onRename: (id: string, title: string) => Promise<void> | void;
  onTabCreate?: (id: string) => void;
  isEditing?: boolean;
};

export default function StickyNode({ id, data, selected }: NodeProps<Data>) {
  const [editing, setEditing] = useState<boolean>(Boolean(data.isEditing));
  const [value, setValue] = useState<string>(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.isEditing) setEditing(true);
  }, [data.isEditing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function onDouble() {
    setEditing(true);
  }

  async function commit() {
    setEditing(false);
    if (value !== data.label) await data.onRename(id, value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); setEditing(false); setValue(data.label); }
    if (e.key === 'Tab') {
      e.preventDefault();
      commit();
      data.onTabCreate && data.onTabCreate(id);
    }
  }

  return (
    <div
      className={clsx(
        'rounded-xl relative shadow-md border',
        selected ? 'ring-2 ring-[#20B2AA] shadow-xl' : 'shadow',
      )}
      style={{ width: 120, height: 120, background: data.bg, color: data.textColor }}
      onDoubleClick={onDouble}
    >
      {/* folded corner, flush to edges */}
      <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[14px] border-l-[14px] border-t-white/70 border-l-transparent rotate-[-90deg]" />

      <div className="p-2 text-[12px] leading-snug">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full bg-white/70 rounded px-1 py-0.5 outline-none"
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
          />
        ) : (
          <div>{data.label || 'Note'}</div>
        )}
      </div>

      {/* Handles center of each side */}
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Left} id="l" />

      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="target" position={Position.Right} id="rr" />
      <Handle type="target" position={Position.Bottom} id="bb" />
      <Handle type="target" position={Position.Left} id="ll" />
    </div>
  );
}
