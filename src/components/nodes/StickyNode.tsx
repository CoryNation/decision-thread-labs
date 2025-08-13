'use client';
import { memo, useCallback, useMemo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

type Data = {
  label: string;
  onRename: (id: string, title: string) => Promise<void>;
  onTabCreate?: (id: string) => void;
  isEditing?: boolean;
  bg: string;
  textColor: string;
};

function darken(hex: string, amt: number = 15) {
  try {
    const h = hex.replace('#','');
    const num = parseInt(h, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.max(0, Math.min(255, r - Math.round(255*amt/100)));
    g = Math.max(0, Math.min(255, g - Math.round(255*amt/100)));
    b = Math.max(0, Math.min(255, b - Math.round(255*amt/100)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  } catch(e) {
    return hex;
  }
}

export default memo(function StickyNode({ id, data, selected }: NodeProps<Data>) {
  const [editing, setEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(data.label || '');

  const fold = useMemo(() => darken(data.bg || '#FFF7B3', 18), [data.bg]);

  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(async () => {
    setEditing(false);
    if (title !== data.label) {
      await data.onRename(id, title);
    }
  }, [title, data, id]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Tab' && data.onTabCreate) {
      e.preventDefault();
      data.onTabCreate(id);
    }
  }, [id, data]);

  return (
    <div
      className={`relative rounded-xl border shadow ${selected ? 'sticky-selected' : 'shadow-sm'}`}
      style={{
        width: 140, height: 140, background: data.bg, color: data.textColor,
        borderColor: 'rgba(0,0,0,0.08)'
      }}
      onDoubleClick={startEdit}
    >
      {/* folded corner */}
      <div style={{
        position:'absolute', right:0, bottom:0, width: 28, height: 28,
        clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
        background: fold
      }} />

      {/* Title */}
      {!editing ? (
        <div className="p-3 text-sm leading-snug">{title}</div>
      ) : (
        <input
          className="m-3 w-[calc(100%-24px)] rounded border border-slate-300 px-2 py-1 text-sm outline-none"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onBlur={stopEdit}
          onKeyDown={onKeyDown}
        />
      )}

      {/* Handles: center of each side */}
      <Handle id="t-src" type="source" position={Position.Top} style={{ width: 10, height: 10, background: '#5A6C80' }} />
      <Handle id="t-tgt" type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#5A6C80' }} />

      <Handle id="r-src" type="source" position={Position.Right} style={{ width: 10, height: 10, background: '#5A6C80' }} />
      <Handle id="r-tgt" type="target" position={Position.Right} style={{ width: 10, height: 10, background: '#5A6C80' }} />

      <Handle id="b-src" type="source" position={Position.Bottom} style={{ width: 10, height: 10, background: '#5A6C80' }} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} style={{ width: 10, height: 10, background: '#5A6C80' }} />

      <Handle id="l-src" type="source" position={Position.Left} style={{ width: 10, height: 10, background: '#5A6C80' }} />
      <Handle id="l-tgt" type="target" position={Position.Left} style={{ width: 10, height: 10, background: '#5A6C80' }} />
    </div>
  );
});
