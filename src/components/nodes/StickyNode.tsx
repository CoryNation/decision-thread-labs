'use client';
import { Handle, Position } from 'reactflow';
import { useState } from 'react';

type Props = any;

export default function StickyNode({ id, data, selected }: Props) {
  const size = 120;
  const bg = data.bg || '#fff7b3';
  const textColor = data.textColor || '#1f2937';

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label || '');

  function startEdit() {
    setEditing(true);
    setTimeout(() => {
      const el = document.getElementById(`title-edit-${id}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  function commit() {
    setEditing(false);
    if (value !== data.label && data.onRename) data.onRename(id, value);
  }

  return (
    <div
      style={{ width: size, height: size, cursor: editing ? 'text' : 'grab' }}
      className={`relative rounded-md border ${selected ? 'shadow-2xl ring-2 ring-[#20B2AA]' : 'shadow-soft'} bg-white`}
      onDoubleClick={startEdit}
    >
      <div className="w-full h-full rounded-md relative" style={{ background: bg }}>
        <div
          className="absolute bottom-0 right-0 w-0 h-0"
          style={{ borderTop: '18px solid rgba(0,0,0,0.10)', borderLeft: '18px solid transparent' }}
        />
        {!editing && (
          <div className="px-3 py-2 text-sm font-medium select-none" style={{ color: textColor }}>
            {data.label || 'Note'}
          </div>
        )}
        {editing && (
          <input
            id={`title-edit-${id}`}
            className="absolute left-2 right-2 top-2 border rounded px-2 py-1 text-sm bg-white/80"
            value={value}
            onChange={e=>setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={e=>{ if(e.key==='Enter') commit(); if(e.key==='Escape'){ setEditing(false); setValue(data.label||''); } }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Top}    id="top"    style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="source" position={Position.Right}  id="right"  style={{ top: '50%', transform:'translateY(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="source" position={Position.Left}   id="left"   style={{ top: '50%', transform:'translateY(-50%)' }} />

      <Handle type="target" position={Position.Top}    id="ttop"    style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="target" position={Position.Right}  id="tright"  style={{ top: '50%', transform:'translateY(-50%)' }} />
      <Handle type="target" position={Position.Bottom} id="tbottom" style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="target" position={Position.Left}   id="tleft"   style={{ top: '50%', transform:'translateY(-50%)' }} />
    </div>
  );
}
