'use client';

import { useEffect, useState } from 'react';

export default function EdgeInspector({
  edge,
  onClose,
  onChange,
}: {
  edge: any;
  onClose: () => void;
  onChange: (partial: any) => void;
}) {
  const [local, setLocal] = useState<any>(edge || {});
  useEffect(() => setLocal(edge), [edge?.id]);

  const setData = (k: string, v: any) =>
    setLocal((e: any) => ({ ...e, data: { ...(e.data || {}), [k]: v } }));

  const save = () => onChange(local);

  return (
    <aside className="absolute right-4 top-4 bottom-4 w-[340px] card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
        <h3 className="text-sm font-semibold text-slate-700">Line Properties</h3>
        <div className="flex items-center gap-2">
          <button className="btn btn-teal !h-14 !w-14 rounded-full" onClick={save} title="Save">
            <span className="icon">save</span>
          </button>
          <button className="btn !h-14 !w-14 rounded-full" onClick={onClose} title="Close">
            <span className="icon">close</span>
          </button>
        </div>
      </div>

      <div className="card-pad space-y-5 overflow-y-auto h-[calc(100%-64px)]">
        <div>
          <label className="form-label">Curve Style</label>
          <select
            className="input"
            value={local.type || 'step'}
            onChange={(e) => setLocal((cur: any) => ({ ...cur, type: e.target.value }))}
          >
            <option value="smoothstep">Smooth Curve</option>
            <option value="step">Right Angles</option>
            <option value="straight">Straight</option>
          </select>
        </div>

        <div>
          <label className="form-label">Pattern</label>
          <select
            className="input"
            value={local.data?.pattern || 'solid'}
            onChange={(e) => setData('pattern', e.target.value)}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox"
              checked={!!local.data?.arrowStart}
              onChange={(e) => setData('arrowStart', e.target.checked)} />
            Arrow at start
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox"
              checked={!!local.data?.arrowEnd}
              onChange={(e) => setData('arrowEnd', e.target.checked)} />
            Arrow at end
          </label>
        </div>
      </div>
    </aside>
  );
}
