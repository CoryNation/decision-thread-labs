'use client';
import { useEffect, useState } from 'react';

type Props = {
  edge: any;
  onClose: () => void;
  onChange: (upd: any) => void;
};

export default function EdgeInspector({ edge, onClose, onChange }: Props) {
  const [pattern, setPattern] = useState(edge?.data?.pattern || 'solid');
  const [arrowStart, setArrowStart] = useState(!!edge?.data?.arrowStart);
  const [arrowEnd, setArrowEnd] = useState(edge?.data?.arrowEnd !== false);

  useEffect(() => {
    setPattern(edge?.data?.pattern || 'solid');
    setArrowStart(!!edge?.data?.arrowStart);
    setArrowEnd(edge?.data?.arrowEnd !== false);
  }, [edge?.id]);

  const save = () => {
    onChange({ ...edge, data: { ...(edge.data || {}), pattern, arrowStart, arrowEnd } });
  };

  return (
    <div className="absolute right-4 top-4 z-20 rounded-xl border bg-white p-3 shadow-lg inspector">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Line Properties</div>
        <div className="flex gap-2">
          <button className="fab fab-primary" onClick={save} title="Save">
            <span className="material-symbols-outlined">save</span>
          </button>
          <button className="fab fab-outline-muted" onClick={onClose} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500">Line style</label>
          <select className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={pattern} onChange={(e) => setPattern(e.target.value)}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={arrowStart} onChange={(e) => setArrowStart(e.target.checked)} />
            Arrow at start
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={arrowEnd} onChange={(e) => setArrowEnd(e.target.checked)} />
            Arrow at end
          </label>
        </div>
      </div>
    </div>
  );
}
