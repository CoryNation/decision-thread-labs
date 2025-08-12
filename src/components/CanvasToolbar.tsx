'use client';
import React from 'react';

type Props = {
  onAddDecision: () => void;
  view: 'process'|'information'|'opportunities';
  setView: (v: 'process'|'information'|'opportunities') => void;
};

export default function CanvasToolbar({ onAddDecision, view, setView }: Props) {
  function onDragStart(e: React.DragEvent, nodeType: string) {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="card p-3 flex flex-col gap-3">
        <div className="flex gap-2">
          <button onClick={onAddDecision} className="btn btn-accent">+ Decision</button>
        </div>
        <div className="text-xs text-dtl-charcoal">Drag onto Canvas:</div>
        <div className="flex gap-2">
          <div draggable onDragStart={(e)=>onDragStart(e,'decision')} className="px-2 py-1 rounded-md border bg-yellow-100 cursor-grab">Decision</div>
          <div draggable onDragStart={(e)=>onDragStart(e,'data')} className="px-2 py-1 rounded-md border bg-green-100 cursor-grab">Data</div>
          <div draggable onDragStart={(e)=>onDragStart(e,'opportunity')} className="px-2 py-1 rounded-md border bg-blue-100 cursor-grab">Opportunity</div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setView('process')} className={`btn ${view==='process'?'btn-primary':'btn'}`}>Decision Process</button>
          <button onClick={()=>setView('information')} className={`btn ${view==='information'?'btn-primary':'btn'}`}>Information Flow</button>
          <button onClick={()=>setView('opportunities')} className={`btn ${view==='opportunities'?'btn-primary':'btn'}`}>Opportunities</button>
        </div>
      </div>
    </div>
  );
}
