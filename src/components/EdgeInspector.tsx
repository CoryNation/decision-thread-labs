'use client';
import { useEffect, useState } from 'react';

export default function EdgeInspector({
  edge, onClose, onChange,
}: {
  edge: any;
  onClose: () => void;
  onChange: (update: any) => void;
}) {
  const [draft, setDraft] = useState<any>(edge);
  useEffect(() => setDraft(edge), [edge]);

  return (
    <div className="inspector absolute right-4 top-4 z-20 rounded-2xl bg-white p-4 shadow">
      <div className="flex justify-end gap-3 mb-2">
        <button className="fab fab-primary" aria-label="Save" onClick={() => onChange(draft)}>
          <span className="material-symbols-outlined">save</span>
        </button>
        <button className="fab fab-outline-muted" aria-label="Close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-3 pr-1">
        <div className="text-sm font-semibold">Line Properties</div>

        <label className="block text-xs">Line style</label>
        <select
          className="w-full rounded border px-2 py-1 text-sm"
          value={draft?.data?.pattern || 'solid'}
          onChange={(e) =>
            setDraft({ ...draft, data: { ...(draft.data||{}), pattern: e.target.value } })
          }
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>

        <div className="flex items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={!!draft?.data?.arrowStart}
              onChange={(e) => setDraft({ ...draft, data: { ...(draft.data||{}), arrowStart: e.target.checked } })}
            />
            Arrow at start
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={!!draft?.data?.arrowEnd}
              onChange={(e) => setDraft({ ...draft, data: { ...(draft.data||{}), arrowEnd: e.target.checked } })}
            />
            Arrow at end
          </label>
        </div>
      </div>
    </div>
  );
}
