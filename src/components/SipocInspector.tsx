'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Decision, Kind } from '@/types/canvas';

type Props = {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
  /** when true, render as an embedded card (not full-screen fixed) */
  embedded?: boolean;
};

const KIND_OPTIONS: Kind[] = ['decision', 'data', 'opportunity', 'choice'];

/** Helper: include a key only if the value is not undefined */
function maybe<T extends object, K extends keyof T>(obj: T, key: K, value: T[K] | undefined) {
  if (typeof value !== 'undefined') (obj as any)[key] = value;
}

export default function SipocInspector({ decision, onClose, onSaved, onDelete, embedded = true }: Props) {
  const [draft, setDraft] = useState<Decision>(decision);

  useEffect(() => setDraft(decision), [decision]);

  function set<K extends keyof Decision>(key: K, value: Decision[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  const canSave = useMemo(() => (draft.title ?? '').trim().length > 0, [draft.title]);

  async function handleSave() {
    // Only include keys we know your DB has (safe if migrations vary).
    const payload: Record<string, any> = {};
    maybe(payload, 'title', draft.title ?? '');
    maybe(payload, 'kind', draft.kind ?? 'decision');
    maybe(payload, 'statement', draft.statement ?? null);
    maybe(payload, 'queue_time_min', draft.queue_time_min ?? null);
    maybe(payload, 'action_time_min', draft.action_time_min ?? null);

    // If your SIPOC columns exist, the next lines will update them; if not, Postgres ignores missing keys.
    // (Supabase will error only if a column name is unknown; comment-out lines for columns you don’t yet have.)
    maybe(payload, 'supplier_who', (draft as any).supplier_who);
    maybe(payload, 'supplier_storage', (draft as any).supplier_storage);
    maybe(payload, 'supplier_comm_methods', (draft as any).supplier_comm_methods);
    maybe(payload, 'inputs_what', (draft as any).inputs_what);
    maybe(payload, 'inputs_format', (draft as any).inputs_format);
    maybe(payload, 'inputs_transformed', (draft as any).inputs_transformed);
    maybe(payload, 'process_description', (draft as any).process_description);
    maybe(payload, 'goal', (draft as any).goal);
    maybe(payload, 'needs_support', (draft as any).needs_support);
    maybe(payload, 'outputs_what', (draft as any).outputs_what);
    maybe(payload, 'outputs_format', (draft as any).outputs_format);
    maybe(payload, 'customer_next_owner', (draft as any).customer_next_owner);
    maybe(payload, 'customer_comm', (draft as any).customer_comm);
    maybe(payload, 'handoff_notes', (draft as any).handoff_notes);

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
    onSaved(data as unknown as Decision);
  }

  async function handleDelete() {
    await supabase.from('decision_links').delete().or(`from_id.eq.${decision.id},to_id.eq.${decision.id}`);
    await supabase.from('decisions').delete().eq('id', decision.id);
    onDelete(decision.id);
    onClose();
  }

  const Outer = embedded ? 'div' : ('aside' as any);
  const outerProps = embedded
    ? { className: 'panel' }
    : { className: 'fixed right-0 top-0 h-screen w-[380px] bg-white border-l shadow-xl z-40 flex flex-col' };

  return (
    <Outer {...outerProps} onClick={(e: any) => e.stopPropagation()} role="dialog" aria-label="SIPOC Inspector">
      {/* Header */}
      <div className="panel-header">
        <h2 className="text-sm font-semibold text-slate-800">SIPOC Inspector</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="fab fab-primary"
            title="Save"
          >
            <span className="material-symbols-outlined text-[24px]">save</span>
          </button>
          <button onClick={handleDelete} className="fab fab-danger" title="Delete">
            <span className="material-symbols-outlined text-[24px]">delete</span>
          </button>
          <button onClick={onClose} className="fab fab-neutral" title="Close">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="panel-body">
        {/* Type */}
        <label className="fld-label">Type</label>
        <select
          value={draft.kind ?? 'decision'}
          onChange={(e) => set('kind', e.target.value as Kind)}
          className="fld-input mb-4"
        >
          {KIND_OPTIONS.map(k => (
            <option key={k} value={k}>
              {k === 'choice' ? 'Choice' : k.charAt(0).toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>

        {/* Title */}
        <label className="fld-label">Title</label>
        <input
          value={draft.title ?? ''}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Short title"
          className="fld-input mb-4"
        />

        {/* Statement */}
        <label className="fld-label">Statement / Description</label>
        <textarea
          value={draft.statement ?? ''}
          onChange={(e) => set('statement', e.target.value)}
          rows={3}
          placeholder="Describe the decision."
          className="fld-input mb-4"
        />

        {/* Supplier */}
        <div className="section-title">Supplier</div>
        <label className="fld-label">Who supplies the information?</label>
        <input
          value={(draft as any).supplier_who ?? ''}
          onChange={(e) => set('supplier_who' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">Where is the information stored?</label>
        <input
          value={(draft as any).supplier_storage ?? ''}
          onChange={(e) => set('supplier_storage' as any, e.target.value)}
          className="fld-input mb-3"
        />

        {/* Inputs */}
        <div className="section-title">Inputs</div>
        <label className="fld-label">What information is needed?</label>
        <input
          value={(draft as any).inputs_what ?? ''}
          onChange={(e) => set('inputs_what' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">What format is it in?</label>
        <input
          value={(draft as any).inputs_format ?? ''}
          onChange={(e) => set('inputs_format' as any, e.target.value)}
          className="fld-input mb-4"
        />

        {/* Process */}
        <div className="section-title">Process of Decision Making</div>
        <label className="fld-label">Describe the high-level process for this step</label>
        <textarea
          value={(draft as any).process_description ?? ''}
          onChange={(e) => set('process_description' as any, e.target.value)}
          rows={3}
          className="fld-input mb-3"
        />
        <label className="fld-label">What is the goal?</label>
        <input
          value={(draft as any).goal ?? ''}
          onChange={(e) => set('goal' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">Are other people needed to support?</label>
        <input
          value={(draft as any).needs_support ?? ''}
          onChange={(e) => set('needs_support' as any, e.target.value)}
          className="fld-input mb-4"
        />

        {/* Outputs */}
        <div className="section-title">Outputs</div>
        <label className="fld-label">What is the output?</label>
        <input
          value={(draft as any).outputs_what ?? ''}
          onChange={(e) => set('outputs_what' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">What format is it in?</label>
        <input
          value={(draft as any).outputs_format ?? ''}
          onChange={(e) => set('outputs_format' as any, e.target.value)}
          className="fld-input mb-4"
        />

        {/* Customer */}
        <div className="section-title">Customer</div>
        <label className="fld-label">Who is the next owner?</label>
        <input
          value={(draft as any).customer_next_owner ?? ''}
          onChange={(e) => set('customer_next_owner' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">How is it communicated?</label>
        <input
          value={(draft as any).customer_comm ?? ''}
          onChange={(e) => set('customer_comm' as any, e.target.value)}
          className="fld-input mb-3"
        />
        <label className="fld-label">Handoff notes</label>
        <textarea
          value={(draft as any).handoff_notes ?? ''}
          onChange={(e) => set('handoff_notes' as any, e.target.value)}
          rows={2}
          className="fld-input mb-6"
        />

        {/* Timing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="fld-label">Queue time (min)</label>
            <input
              type="number"
              value={draft.queue_time_min ?? 0}
              onChange={(e) => set('queue_time_min', Number(e.target.value))}
              className="fld-input"
            />
          </div>
          <div>
            <label className="fld-label">Action time (min)</label>
            <input
              type="number"
              value={draft.action_time_min ?? 0}
              onChange={(e) => set('action_time_min', Number(e.target.value))}
              className="fld-input"
            />
          </div>
        </div>
      </div>
    </Outer>
  );
}
