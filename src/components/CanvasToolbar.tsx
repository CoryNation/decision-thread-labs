'use client';
import React from 'react';

export default function CanvasToolbar({
  view, setView,
}: {
  view: 'process'|'information'|'opportunities';
  setView: (v: 'process'|'information'|'opportunities') => void;
}) {
  const tools = [
    { type: 'decision', label: 'Decision', bg: '#FFF7B3' },
    { type: 'data', label: 'Data', bg: '#DCFCE7' },
    { type: 'opportunity', label: 'Opportunity', bg: '#CDE3FF' },
    { type: 'gateway', label: 'Choice', bg: '#F6E7B2' },
  ];

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="absolute left-4 top-4 z-10 w-56 rounded-2xl bg-white p-4 shadow">
      <label className="block text-xs text-slate-500 mb-1">View</label>
      <select
        className="mb-3 w-full rounded border px-2 py-1 text-sm"
        value={view}
        onChange={(e) => setView(e.target.value as any)}
      >
        <option value="process">Decision Process</option>
        <option value="information">Information Flow</option>
        <option value="opportunities">Opportunities</option>
      </select>

      <div className="text-sm font-semibold mb-2">Tools</div>
      <div className="space-y-3">
        {tools.map((t) => (
          <div key={t.type} className="rounded-xl border p-3">
            <div
              draggable
              onDragStart={(e) => onDragStart(e, t.type)}
              className="relative mx-auto grid h-14 w-14 place-items-center rounded-xl border shadow-sm"
              style={{ background: t.bg }}
              title={`Drag to canvas: ${t.label}`}
            >
              {/* folded corner */}
              <div
                className="absolute right-0 bottom-0"
                style={{
                  width: 16, height: 16,
                  clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
                  background: 'rgba(0,0,0,0.1)'
                }}
              />
              <div className="text-[10px]">{t.label}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
