'use client';
import React from 'react';

type Props = {
  view: 'process'|'information'|'opportunities';
  setView: (v: 'process'|'information'|'opportunities') => void;
};

export default function CanvasToolbar({ view, setView }: Props) {
  function onDragStart(e: React.DragEvent, nodeType: string) {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="card p-3 flex flex-col gap-3 min-w-[180px]">
        <h3 className="font-semibold">Tools</h3>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-dtl-charcoal">View</label>
          <select className="border rounded-xl px-2 py-1 text-sm"
            value={view} onChange={e=>setView(e.target.value as any)}>
            <option value="process">Decision Process</option>
            <option value="information">Information Flow</option>
            <option value="opportunities">Opportunities</option>
          </select>
        </div>

        <div className="mt-2 text-xs text-dtl-charcoal">Drag onto Canvas</div>
        <div className="flex flex-col gap-2">
          <div draggable onDragStart={(e)=>onDragStart(e,'decision')}
               className="px-2 py-1 rounded-md border bg-yellow-100 cursor-grab">Decision</div>
          <div draggable onDragStart={(e)=>onDragStart(e,'data')}
               className="px-2 py-1 rounded-md border bg-green-100 cursor-grab">Data / Information</div>
          <div draggable onDragStart={(e)=>onDragStart(e,'opportunity')}
               className="px-2 py-1 rounded-md border bg-blue-100 cursor-grab">Opportunity</div>
        </div>
      </div>
    </div>
  );
}
