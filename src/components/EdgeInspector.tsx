'use client';
import React, { useState, useEffect } from 'react';

type EdgeLike = any;

type Props = {
  edge: EdgeLike;
  onClose: () => void;
  onChange: (updates: Partial<EdgeLike>) => void;
};

export default function EdgeInspector({ edge, onClose, onChange }: Props) {
  const [pattern, setPattern] = useState<string>(edge?.data?.pattern || 'solid');
  const [arrowStart, setArrowStart] = useState<boolean>(Boolean(edge?.data?.arrowStart));
  const [arrowEnd, setArrowEnd] = useState<boolean>(edge?.data?.arrowEnd !== false); // default true

  useEffect(() => {
    setPattern(edge?.data?.pattern || 'solid');
    setArrowStart(Boolean(edge?.data?.arrowStart));
    setArrowEnd(edge?.data?.arrowEnd !== false);
  }, [edge?.id]);

  function apply() {
    onChange({
      data: { ...(edge.data||{}), pattern, arrowStart, arrowEnd },
    });
  }

  const stopAll = (e: any) => e.stopPropagation();

  return (
    <div
      className="absolute right-0 top-0 h-[80vh] w-full sm:w-[320px] z-50 bg-white border-l shadow-soft"
      style={{ overflow: 'hidden' }}
      onPointerDownCapture={stopAll}
      onMouseDown={stopAll}
      onWheel={stopAll}
    >
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold">Edge Settings</h2>
        <div className="flex gap-2">
          <button onClick={apply} className="px-3 py-1 rounded bg-[#20B2AA] text-white text-sm">Apply</button>
          <button onClick={onClose} className="px-3 py-1 rounded border text-sm">Close</button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(80vh-52px)]">
        <label className="block text-sm">
          <span>Line style</span>
          <select className="w-full border rounded px-2 py-2 mt-1" value={pattern} onChange={e=>setPattern(e.target.value)}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={arrowStart} onChange={e=>setArrowStart(e.target.checked)} />
            Arrow at start
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={arrowEnd} onChange={e=>setArrowEnd(e.target.checked)} />
            Arrow at end
          </label>
        </div>

        <p className="text-xs text-gray-500">Tip: drag an edge endpoint to reroute it to a different sticky.</p>
      </div>
    </div>
  );
}
