'use client';
import React from 'react';
import type { Decision, Kind, Link } from '@/types/canvas';

type View = 'process' | 'information' | 'opportunities';

export default function CanvasToolbar({
  view,
  setView
}: {
  view: View;
  setView: (v: View) => void;
}) {
  const onDragStart = (e: React.DragEvent, kind: 'decision' | 'data' | 'opportunity' | 'choice') => {
    e.dataTransfer.setData('application/dtl-kind', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-4 z-10 w-64 rounded-xl bg-white/95 shadow-lg ring-1 ring-slate-200">
      <div className="border-b px-3 py-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1">View</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as View)}
          className="w-full rounded-md border px-2 py-1 text-sm"
        >
          <option value="process">Decision Process</option>
          <option value="information">Information Flow</option>
          <option value="opportunities">Opportunities</option>
        </select>
      </div>

      <div className="p-3">
        <div className="text-xs font-semibold text-slate-500 mb-2">Tools</div>

        <div className="grid grid-cols-2 gap-3">
          {/* Decision sticky */}
          <div
            className="cursor-move rounded-md border border-slate-300 bg-[#FFF7B3] p-2 text-center text-[11px] shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'decision')}
          >
            Decision
          </div>

          {/* Data sticky (forest green family) */}
          <div
            className="cursor-move rounded-md border border-slate-300 bg-[#DCFCE7] p-2 text-center text-[11px] shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'data')}
          >
            Data
          </div>

          {/* Opportunity sticky (blue) */}
          <div
            className="cursor-move rounded-md border border-slate-300 bg-[#CDE3FF] p-2 text-center text-[11px] shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'opportunity')}
          >
            Opportunity
          </div>

          {/* Choice diamond */}
          <div
            className="cursor-move rounded-md border border-slate-300 bg-[#F6E7B2] p-2 text-center text-[11px] shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'choice')}
          >
            Choice
          </div>
        </div>
      </div>
    </div>
  );
}
