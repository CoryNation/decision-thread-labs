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

  output_what: string | null;
  outputs_format: string | null;
  output_storage: string | null;
  output_comm: string | null;

  customer_who: string | null;
  handoff_notes: string | null;

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
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!decision) { setForm(null); return; }
    setForm({ ...(decision as Decision) });
  }, [decision?.id]);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = (document.documentElement as HTMLElement).style.overflow;
    document.body.style.overflow = 'hidden';
    (document.documentElement as HTMLElement).style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevBody; (document.documentElement as HTMLElement).style.overflow = prevHtml; };
  }, []);

  if (!form) return null;

  const stopAll = (e: any) => { e.stopPropagation(); };
  const update = (k: keyof Decision, v: any) => setForm(prev => prev ? { ...prev, [k]: v } : prev);

  async function save() {
    if (!form) return;
    const { data, error } = await supabase
      .from('decisions')
      .update({ ...form })
      .eq('id', form.id).select('*').single();
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

  const Fab = ({ title, onClick, kind='default' } : any) => (
    <button
      title={title}
      onClick={onClick}
      className={
        kind==='primary' ? 'w-14 h-14 rounded-full bg-[#20B2AA] text-white flex items-center justify-center shadow'
        : kind==='danger' ? 'w-14 h-14 rounded-full bg-white border border-red-500 text-red-600 flex items-center justify-center'
        : 'w-14 h-14 rounded-full bg-white border border-gray-300 text-gray-500 flex items-center justify-center'
      }
    >
      {title==='Save' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
      )}
      {title==='Close' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
      )}
      {title==='Delete' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12M9 7V5h6v2m-7 4v7m4-7v7m4-7v7M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/></svg>
      )}
    </button>
  );

  const Section = ({ title, children } : any) => (
    <div className="mt-3">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-1 gap-2">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, children }: any) => (
    <label className="block text-sm" onPointerDownCapture={stopAll} onMouseDown={stopAll} onClick={stopAll}>
      <span className="text-dtl-charcoal">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <div
      className="absolute right-0 top-0 h-[80vh] w-full sm:w-[360px] z-50 bg-white border-l shadow-soft"
      style={{ overflow: 'hidden' }}
      onPointerDownCapture={stopAll}
      onMouseDown={stopAll}
      onWheel={stopAll}
    >
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold">SIPOC Inspector</h2>
        <div className="flex gap-2">
          <Fab title="Save" kind="primary" onClick={save} />
          <Fab title="Delete" kind="danger" onClick={remove} />
          <Fab title="Close" onClick={onClose} />
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(80vh-72px)]">
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

        <Field label="Decision Statement">
          <textarea className="w-full border rounded-xl px-3 py-2"
            value={form.statement ?? ''} onChange={e=>update('statement', e.target.value)} />
        </Field>

        <Section title="Supplier">
          <Field label="Who supplies the information?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.supplier_who ?? ''} onChange={e=>update('supplier_who', e.target.value)} />
          </Field>
          <Field label="Where is the information stored?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.supplier_storage ?? ''} onChange={e=>update('supplier_storage', e.target.value)} />
          </Field>
        </Section>

        <Section title="Inputs">
          <Field label="What information is needed?">
            <textarea className="w-full border rounded-xl px-3 py-2"
              value={form.input_what ?? ''} onChange={e=>update('input_what', e.target.value)} />
          </Field>
          <Field label="What format is it in?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.inputs_format ?? ''} onChange={e=>update('inputs_format', e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.inputs_transformed)} onChange={e=>update('inputs_transformed', e.target.checked)} />
            Is the information transformed into another format?
          </label>
        </Section>

        <Section title="Process of Decision Making">
          <Field label="Describe high level decision making process for this step.">
            <textarea className="w-full border rounded-xl px-3 py-2"
              value={form.process_to_information ?? ''} onChange={e=>update('process_to_information', e.target.value)} />
          </Field>
          <Field label="What is the goal?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.process_goal ?? ''} onChange={e=>update('process_goal', e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.process_support_needed)} onChange={e=>update('process_support_needed', e.target.checked)} />
            Are other people needed to support?
          </label>
        </Section>

        <Section title="Outputs">
          <Field label="What is the output?">
            <textarea className="w-full border rounded-xl px-3 py-2"
              value={form.output_what ?? ''} onChange={e=>update('output_what', e.target.value)} />
          </Field>
          <Field label="What format is it in?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.outputs_format ?? ''} onChange={e=>update('outputs_format', e.target.value)} />
          </Field>
        </Section>

        <Section title="Customer">
          <Field label="Who is the customer (next owner)?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.customer_who ?? ''} onChange={e=>update('customer_who', e.target.value)} />
          </Field>
          <Field label="How is it communicated?">
            <input className="w-full border rounded-xl px-3 py-2"
              value={form.output_comm ?? ''} onChange={e=>update('output_comm', e.target.value)} />
          </Field>
          <Field label="Handoff notes">
            <textarea className="w-full border rounded-xl px-3 py-2"
              value={form.handoff_notes ?? ''} onChange={e=>update('handoff_notes', e.target.value)} />
          </Field>
        </Section>

        <Section title="Timing">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Queue time (min)">
              <input type="number" className="w-full border rounded-xl px-3 py-2"
                value={form.queue_time_min ?? 0} onChange={e=>update('queue_time_min', Number(e.target.value))} />
            </Field>
            <Field label="Action time (min)">
              <input type="number" className="w-full border rounded-xl px-3 py-2"
                value={form.action_time_min ?? 0} onChange={e=>update('action_time_min', Number(e.target.value))} />
            </Field>
          </div>
        </Section>

        <div className="pb-16">{status && <span className="text-xs text-gray-600">{status}</span>}</div>
      </div>
    </div>
  );
}
