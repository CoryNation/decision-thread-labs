'use client';
import { Handle, Position, NodeProps } from 'reactflow';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

type Data = {
  label: string;
  onRename?: (id: string, title: string) => void;
  onTabCreate?: (id: string) => void;
  isEditing?: boolean;
  bg: string;
  textColor: string;
};

export default function StickyNode({ id, data, selected }: NodeProps<Data>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (data.isEditing && inputRef.current) inputRef.current.focus(); }, [data.isEditing]);

  return (
    <div
      className={clsx('relative rounded-xl border shadow', selected ? 'sticky-selected' : 'shadow-sm')}
      style={{ width: 140, height: 140, background: data.bg, color: data.textColor }}
      onKeyDown={(e) => {
        if (e.key === 'Tab' && data.onTabCreate) { e.preventDefault(); data.onTabCreate(id); }
      }}
      title="Double-click to edit"
    >
      {/* folded corner (darker tone) */}
      <div
        className="absolute right-0 bottom-0"
        style={{
          width: 22, height: 22,
          clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
          background: 'rgba(0,0,0,0.12)'
        }}
      />

      <div className="p-2 text-xs">
        {data.isEditing ? (
          <input
            ref={inputRef}
            defaultValue={data.label.replace(/^Choice:\s*/,'')}
            className="w-full rounded border bg-white/80 px-2 py-1"
            onBlur={(e) => data.onRename?.(id, e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
          />
        ) : (
          <div className="font-medium">{data.label}</div>
        )}
      </div>

      {/* Handles centered on each side */}
      <Handle type="source" id="s-top" position={Position.Top}   style={{ left:'50%', transform:'translateX(-50%)' }} />
      <Handle type="target" id="t-top" position={Position.Top}   style={{ left:'50%', transform:'translateX(-50%)' }} />
      <Handle type="source" id="s-right" position={Position.Right} style={{ top:'50%', transform:'translateY(-50%)' }} />
      <Handle type="target" id="t-right" position={Position.Right} style={{ top:'50%', transform:'translateY(-50%)' }} />
      <Handle type="source" id="s-bottom" position={Position.Bottom} style={{ left:'50%', transform:'translateX(-50%)' }} />
      <Handle type="target" id="t-bottom" position={Position.Bottom} style={{ left:'50%', transform:'translateX(-50%)' }} />
      <Handle type="source" id="s-left" position={Position.Left} style={{ top:'50%', transform:'translateY(-50%)' }} />
      <Handle type="target" id="t-left" position={Position.Left} style={{ top:'50%', transform:'translateY(-50%)' }} />
    </div>
  );
}
