'use client';
import React from 'react';

type Props = {
  view: 'process'|'information'|'opportunities';
  setView: (v: any) => void;
};

const tools = [
  { type: 'decision', label: 'Decision', color: '#FFF7B3', text: '#1f2937' },
  { type: 'data', label: 'Data', color: '#DCFCE7', text: '#1f2937' },
  { type: 'opportunity', label: 'Opportunity', color: '#CDE3FF', text: '#1f2937' },
  { type: 'gateway', label: 'Choice', color: '#F6E7B2', text: '#1f2937' },
];

export default function CanvasToolbar({ view, setView }: Props) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="absolute left-4 top-4 z-50 bg-white/95 backdrop-blur rounded-xl shadow-soft p-3 w-[160px]">
      <div className="text-xs font-semibold text-gray-700 mb-2">View</div>
      <select
        className="w-full text-sm border rounded-lg px-2 py-1 mb-3"
        value={view}
        onChange={(e)=>setView(e.target.value as any)}
      >
        <option value="process">Decision Process</option>
        <option value="information">Information Flow</option>
        <option value="opportunities">Opportunities</option>
      </select>

      <div className="text-xs font-semibold text-gray-700 mb-2">Tools</div>
      <div className="grid grid-cols-2 gap-2">
        {tools.map(t => (
          <div key={t.type}
            onDragStart={(e)=>onDragStart(e, t.type)}
            draggable
            className="cursor-grab active:cursor-grabbing select-none rounded-lg border p-2 flex items-center justify-center"
            style={{ background: t.color }}
            title={t.label}
          >
            <div className="relative w-10 h-10">
              <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-white/70 border-l-transparent rotate-[-90deg]" />
              <div className="text-[10px] leading-tight" style={{color: t.text}}>{t.label}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
