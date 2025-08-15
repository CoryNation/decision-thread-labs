'use client';
import React from 'react';

type Kind = 'decision' | 'data' | 'opportunity' | 'choice';

export default function CanvasToolbar() {
  const onDragStart = (e: React.DragEvent, kind: Kind) => {
    e.dataTransfer.setData('application/dtl-kind', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-56 select-none">
      <div className="mb-2 text-sm font-semibold text-slate-600">View</div>
      {/* your view dropdown lives above; omitted here for brevity */}

      <div className="mb-2 text-sm font-semibold text-slate-600">Tools</div>

      <div className="grid gap-3">
        {/* Decision (yellow sticky) */}
        <div
          className="tool-tile"
          draggable
          onDragStart={(e) => onDragStart(e, 'decision')}
          title="Decision"
        >
          <div className="relative" style={{ width: 56, height: 56 }}>
            <div
              className="absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm"
              style={{ background: '#F9E69B' }} /* yellow */
            />
            {/* folded corner */}
            <div
              className="absolute bottom-0 right-0"
              style={{
                width: 18,
                height: 18,
                background: 'transparent',
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
              }}
            />
            <div
              className="absolute bottom-[2px] right-[2px]"
              style={{
                width: 18,
                height: 18,
                background: '#DDBF5A',
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
              }}
            />
          </div>
          <div className="text-sm">Decision</div>
        </div>

        {/* Data (green sticky) */}
        <div
          className="tool-tile"
          draggable
          onDragStart={(e) => onDragStart(e, 'data')}
          title="Data / Information"
        >
          <div className="relative" style={{ width: 56, height: 56 }}>
            <div
              className="absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm"
              style={{ background: '#DCFCE7' }} /* forest-green family */
            />
            <div
              className="absolute bottom-[2px] right-[2px]"
              style={{
                width: 18,
                height: 18,
                background: '#B7E3CB',
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
              }}
            />
          </div>
          <div className="text-sm">Data</div>
        </div>

        {/* Opportunity (blue sticky) */}
        <div
          className="tool-tile"
          draggable
          onDragStart={(e) => onDragStart(e, 'opportunity')}
          title="Opportunity"
        >
          <div className="relative" style={{ width: 56, height: 56 }}>
            <div
              className="absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm"
              style={{ background: '#DCEBFF' }} /* blue */
            />
            <div
              className="absolute bottom-[2px] right-[2px]"
              style={{
                width: 18,
                height: 18,
                background: '#BFD4F6',
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
              }}
            />
          </div>
          <div className="text-sm">Opportunity</div>
        </div>

        {/* Choice (diamond) — replaces legacy "gateway" */}
        <div
          className="tool-tile"
          draggable
          onDragStart={(e) => onDragStart(e, 'choice')}
          title="Choice (Diamond)"
        >
          <div className="relative" style={{ width: 56, height: 56 }}>
            <div
              className="absolute inset-0 m-auto w-8 h-8 rotate-45 rounded-sm border border-slate-300 shadow-sm"
              style={{ background: '#F6E7B2' }}
            />
          </div>
          <div className="text-sm">Choice</div>
        </div>
      </div>
    </aside>
  );
}

/* Tailwind helper class used above (put this in your globals.css if you haven’t):
.tool-tile {
  @apply flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:shadow cursor-grab active:cursor-grabbing;
}
*/
