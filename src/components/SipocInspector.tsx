'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Decision, Kind } from '@/types/canvas';

type Props = {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
};

export default function SipocInspector({ decision, onClose, onSaved, onDelete, style }: Props) {
  const [draft, setDraft] = useState<Decision>(decision);

  useEffect(() => setDraft(decision), [decision]);

  const set = (k: keyof Decision, v: any) => setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    const { data } = await supabase.from('decisions').update({
      title: draft.title,
      statement: draft.statement,
      kind: draft.kind as Kind,
      queue_time_min: draft.queue_time_min ?? 0,
      action_time_min: draft.action_time_min ?? 0,
    }).eq('id', draft.id).select('*').single();
    if (data) onSaved(data as any);
  }

  async function destroy() {
    await supabase.from('decision_links').delete().or(`from_id.eq.${draft.id},to_id.eq.${draft.id}`);
    await supabase.from('decisions').delete().eq('id', draft.id);
    onDelete(draft.id);
    onClose();
  }

  return (
    <aside
      className="absolute right-4 top-4 z-30 flex h-[calc(80vh-2rem)] w-[420px] flex-col overflow-auto rounded-xl border bg-white p-4 shadow"
      style={style}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">SIPOC Inspector</div>
        <div className="flex gap-2">
          <button
            title="Save"
            onClick={save}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow"
          >
            <span className="material-symbols-rounded">save</span>
          </button>
          <button
            title="Delete"
            onClick={destroy}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-red-300 text-red-600"
          >
            <span className="material-symbols-rounded">delete</span>
          </button>
          <button
            title="Close"
            onClick={onClose}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 text-slate-500"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
      </div>

      <label className="mt-2 text-xs font-medium text-slate-600">Type</label>
      <select
        value={draft.kind}
        onChange={(e) => set('kind', e.target.value as Kind)}
        className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="decision">Decision</option>
        <option value="data">Data</option>
        <option value="opportunity">Opportunity</option>
        <option value="choice">Choice</option>
      </select>

      <label className="mt-3 text-xs font-medium text-slate-600">Title</label>
      <input
        value={draft.title ?? ''}
        onChange={(e) => set('title', e.target.value)}
        className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        placeholder="New item"
      />

      <label className="mt-3 text-xs font-medium text-slate-600">Statement / Description</label>
      <textarea
        value={draft.statement ?? ''}
        onChange={(e) => set('statement', e.target.value)}
        className="mt-1 h-24 rounded-md border border-slate-300 p-2 text-sm"
        placeholder="Describe the decision."
      />

      {/* Supplier */}
      <div className="mt-4 text-sm font-semibold text-slate-700">Supplier</div>
      <label className="mt-1 text-xs text-slate-600">Who supplies the information?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />

      <label className="mt-3 text-xs text-slate-600">Where is the information stored?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />

      <label className="mt-3 text-xs text-slate-600">How is it communicated?</label>
      <div className="mt-1 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" /> Email</label>
        <label className="flex items-center gap-1"><input type="checkbox" /> Verbal</label>
        <label className="flex items-center gap-1"><input type="checkbox" /> Form</label>
        <label className="flex items-center gap-1"><input type="checkbox" /> Notification</label>
        <label className="flex items-center gap-1"><input type="checkbox" /> Other</label>
      </div>

      {/* Inputs */}
      <div className="mt-5 text-sm font-semibold text-slate-700">Inputs</div>
      <label className="mt-1 text-xs text-slate-600">What information is needed?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />

      <label className="mt-3 text-xs text-slate-600">What format is it in?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />

      {/* Process of Decision Making */}
      <div className="mt-5 text-sm font-semibold text-slate-700">Process of Decision Making</div>
      <label className="mt-1 text-xs text-slate-600">Describe high level decision making process for this step.</label>
      <textarea className="mt-1 h-20 rounded-md border border-slate-300 p-2 text-sm" />
      <label className="mt-3 text-xs text-slate-600">What is the goal?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      <label className="mt-3 text-xs text-slate-600">Are other people needed to support?</label>
      <input className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />

      {/* Time */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Queue time (min)</label>
          <input
            type="number"
            min={0}
            value={draft.queue_time_min ?? 0}
            onChange={(e) => set('queue_time_min', Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Action time (min)</label>
          <input
            type="number"
            min={0}
            value={draft.action_time_min ?? 0}
            onChange={(e) => set('action_time_min', Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}
