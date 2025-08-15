'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Decision, Kind } from '@/types/canvas';

type Props = {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
};

const KIND_OPTIONS: Kind[] = ['decision', 'data', 'opportunity', 'choice'];

export default function SipocInspector({ decision, onClose, onSaved, onDelete }: Props) {
  // Local editable draft. Use optional chaining defaults so optional fields never break controlled inputs.
  const [draft, setDraft] = useState<Decision>(decision);

  useEffect(() => {
    setDraft(decision);
  }, [decision]);

  const canSave = useMemo(() => {
    // keep this simple for now; title is our minimum
    return (draft.title ?? '').trim().length > 0;
  }, [draft.title]);

  function update<K extends keyof Decision>(key: K, value: Decision[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    const payload: Partial<Decision> = {
      title: draft.title ?? '',
      kind: (draft.kind ?? 'decision') as Kind,
      statement: draft.statement ?? null,
      queue_time_min: draft.queue_time_min ?? null,
      action_time_min: draft.action_time_min ?? null,
      // include any other SIPOC fields you’ve added; leaving them out keeps them unchanged
    };

    const { data, error } = await supabase
      .from('decisions')
      .update(payload)
      .eq('id', decision.id)
      .select('*')
      .single();

    if (error) {
      console.error('Save failed', error);
      return;
    }

    // Cast to Decision since our central type is flexible
    onSaved(data as unknown as Decision);
  }

  async function handleDelete() {
    // delete links first to avoid FK issues if you have them
    await supabase.from('decision_links').delete().or(`from_id.eq.${decision.id},to_id.eq.${decision.id}`);
    await supabase.from('decisions').delete().eq('id', decision.id);
    onDelete(decision.id);
    onClose();
  }

  return (
    <aside
      className="fixed right-0 top-0 h-screen w-[380px] bg-white border-l shadow-xl z-40 flex flex-col"
      role="dialog"
      aria-label="SIPOC Inspector"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with FAB-style actions */}
      <div className="flex items-center justify-between px-3 py-3 border-b bg-white sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-slate-800">SIPOC Inspector</h2>
        <div className="flex items-center gap-2">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-transparent
                       bg-[var(--dtl-primary,#20B2AA)] text-white shadow-sm disabled:opacity-50"
            title="Save"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">save</span>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-red-500
                       bg-white text-red-500 shadow-sm"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">delete</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-300
                       bg-white text-slate-500 shadow-sm"
            title="Close"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">close</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Type */}
        <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
        <select
          value={draft.kind ?? 'decision'}
          onChange={(e) => update('kind', e.target.value as Kind)}
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dtl-teal,#20B2AA)]"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k === 'choice' ? 'Choice' : k.charAt(0).toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>

        {/* Title */}
        <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
        <input
          value={draft.title ?? ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Short title"
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dtl-teal,#20B2AA)]"
        />

        {/* Statement / description */}
        <label className="block text-xs font-medium text-slate-600 mb-1">Statement / Description</label>
        <textarea
          value={draft.statement ?? ''}
          onChange={(e) => update('statement', e.target.value)}
          rows={4}
          placeholder="Describe the decision."
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dtl-teal,#20B2AA)]"
        />

        {/* Timing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Queue time (min)</label>
            <input
              type="number"
              value={draft.queue_time_min ?? 0}
              onChange={(e) => update('queue_time_min', Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dtl-teal,#20B2AA)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action time (min)</label>
            <input
              type="number"
              value={draft.action_time_min ?? 0}
              onChange={(e) => update('action_time_min', Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dtl-teal,#20B2AA)]"
            />
          </div>
        </div>

        {/* You can re-add the full SIPOC fields below later, using the same `update` helper and `?? ''` defaults */}
      </div>
    </aside>
  );
}
