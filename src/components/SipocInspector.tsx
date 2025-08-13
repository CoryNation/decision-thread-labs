'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Decision = {
  id: string;
  project_id: string;
  kind: 'decision'|'data'|'opportunity'|'gateway';
  title: string;
  statement: string | null;
  supplier_who: string | null;
  supplier_storage: string | null;
  input_what: string | null;
  inputs_format: string | null;
  inputs_transformed: boolean | null;
  process_to_information: string | null;
  process_goal: string | null;
  process_support_needed: boolean | null;
  decision_upon_info: string | null;
  decision_comm: string | null;
  output_what: string | null;
  outputs_format: string | null;
  output_storage: string | null;
  output_comm: string | null;
  customer_who: string | null;
  handoff_notes: string | null;
  comm_methods: string[] | null;
  queue_time_min: number | null;
  action_time_min: number | null;
};

type Props = {
  decision: any;
  onClose: () => void;
  onSaved?: (d: Decision) => void;
  onDelete?: (id: string) => void;
};

export default function SipocInspector({ decision, onClose, onSaved, onDelete }: Props) {
  const [form, setForm] = useState<Decision | null>(decision);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!decision) { setForm(null); return; }
    setForm({ ...(decision as Decision) });
  }, [decision?.id]);

  useEffect(() => {
    if (!form) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = (document.documentElement as HTMLElement).style.overflow;
    document.body.style.overflow = 'hidden';
    (document.documentElement as HTMLElement).style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      (document.documentElement as HTMLElement).style.overflow = prevHtml;
    };
  }, [form?.id]);

  if (!form) return null;

  const stopAll = (e: any) => { e.stopPropagation(); };
  const update = (k: keyof Decision, v: any) => setForm(prev => prev ? { ...prev, [k]: v } : prev);

  async function save() {
    if (!form) return;
    setSaving(true); setStatus('Saving...');
    const { data, error } = await supabase
      .from('decisions')
      .update({ ...form })
      .eq('id', form.id).select('*').single();
    setSaving(false);
    if (error) { setStatus(error.message); return; }
    setStatus('Saved'); onSaved && onSaved(data as any);
  }

  async function remove() {
    if (!form) return;
    if (!confirm('Delete this item? This will also remove its links.')) return;
    const { error } = await supabase.from('decisions').delete().eq('id', form.id);
    if (error) { setStatus(error.message); return; }
    onDelete && onDelete(form.id); onClose();
  }

  const IconBtn = ({ title, onClick, kind='default' } : any) => (
    <button
      title={title}
      onClick={onClick}
      className={
        kind==='primary' ? 'w-8 h-8 rounded-full bg-[#20B2AA] text-white flex items-center justify-center shadow'
        : kind==='danger' ? 'w-8 h-8 rounded-full border border-red-500 text-red-600 flex items-center justify-center'
        : 'w-8 h-8 rounded-full bg-white border flex items-center justify-center'
      }
    >
      {title==='Save' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
      )}
      {title==='Close' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
      )}
      {title==='Delete' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12M9 7V5h6v2m-7 4v7m4-7v7m4-7v7M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/></svg>
      )}
    </button>
  );

  const Field = ({ label, children }: any) => (
    <label className="block text-sm" onPointerDownCapture={stopAll} onMouseDown={stopAll} onClick={stopAll}>
      <span className="text-dtl-charcoal">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <div
      className="absolute right-0 top-0 h-[80vh] w-full sm:w-[320px] z-50 bg-white border-l shadow-soft"
      style={{ overflow: 'hidden' }}
      onPointerDownCapture={stopAll}
      onMouseDown={stopAll}
      onWheel={stopAll}
    >
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold">SIPOC Inspector</h2>
        <div className="flex gap-2">
          <IconBtn title="Save" kind="primary" onClick={save} />
          <IconBtn title="Delete" kind="danger" onClick={remove} />
          <IconBtn title="Close" onClick={onClose} />
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(80vh-52px)]">
        <Field label="Type">
          <select className="border rounded-xl px-3 py-2" value={form.kind}
            onChange={e=>update('kind', e.target.value as any)}>
            <option value="decision">Decision</option>
            <option value="data">Data/Information</option>
            <option value="opportunity">Opportunity</option>
            <option value="gateway">Choice</option>
          </select>
        </Field>

        <Field label="Title">
          <input className="w-full border rounded-xl px-3 py-2"
            value={form.title || ''} onChange={e=>update('title', e.target.value)} />
        </Field>

        {/* other fields remain unchanged in your DB */}
      </div>
    </div>
  );
}
