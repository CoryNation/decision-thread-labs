'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Decision = {
  id: string;
  project_id: string;
  title: string;
  statement: string | null;
  status: 'queued' | 'in_progress' | 'decided' | 'blocked';
  priority: number | null;
  supplier_who: string | null;
  supplier_storage: string | null;
  supplier_comm: string | null;
  input_what: string | null;
  input_local_storage: string | null;
  input_preprocess: string | null;
  process_to_information: string | null;
  decision_upon_info: string | null;
  decision_comm: string | null;
  output_what: string | null;
  output_storage: string | null;
  output_comm: string | null;
  customer_who: string | null;
  handoff_notes: string | null;
};

type Props = {
  decision: Decision | null;
  onClose: () => void;
  onSaved?: (d: Decision) => void;
  onDelete?: (id: string) => void;
};

export default function SipocInspector({ decision, onClose, onSaved, onDelete }: Props) {
  const [form, setForm] = useState<Decision | null>(decision);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setForm(decision), [decision]);

  if (!form) return null;

  const update = (k: keyof Decision, v: any) => setForm(prev => prev ? { ...prev, [k]: v } : prev);

  async function save() {
    if (!form) return;
    setSaving(true);
    setStatus('Saving...');
    const { data, error } = await supabase
      .from('decisions')
      .update({
        title: form.title,
        statement: form.statement,
        status: form.status,
        priority: form.priority,
        supplier_who: form.supplier_who,
        supplier_storage: form.supplier_storage,
        supplier_comm: form.supplier_comm,
        input_what: form.input_what,
        input_local_storage: form.input_local_storage,
        input_preprocess: form.input_preprocess,
        process_to_information: form.process_to_information,
        decision_upon_info: form.decision_upon_info,
        decision_comm: form.decision_comm,
        output_what: form.output_what,
        output_storage: form.output_storage,
        output_comm: form.output_comm,
        customer_who: form.customer_who,
        handoff_notes: form.handoff_notes,
      })
      .eq('id', form.id)
      .select('*')
      .single();
    setSaving(false);
    if (error) { setStatus(error.message); return; }
    setStatus('Saved');
    onSaved && onSaved(data as any);
  }

  async function remove() {
    if (!form) return;
    if (!confirm('Delete this decision? This will also remove its links.')) return;
    const { error } = await supabase.from('decisions').delete().eq('id', form.id);
    if (error) { setStatus(error.message); return; }
    onDelete && onDelete(form.id);
    onClose();
  }

  const Field = ({ label, children }: any) => (
    <label className="block text-sm">
      <span className="text-dtl-charcoal">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[420px] h-full z-50 bg-white border-l shadow-soft overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">SIPOC Inspector</h2>
        <div className="flex gap-2">
          <button onClick={save} className="btn btn-accent">{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Field label="Title">
          <input className="w-full border rounded-xl px-3 py-2"
            value={form.title} onChange={e=>update('title', e.target.value)} />
        </Field>
        <Field label="Decision Statement">
          <textarea className="w-full border rounded-xl px-3 py-2"
            value={form.statement ?? ''} onChange={e=>update('statement', e.target.value)} />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field label="Status">
            <select className="border rounded-xl px-3 py-2"
              value={form.status}
              onChange={e=>update('status', e.target.value as any)}>
              <option value="queued">Queued</option>
              <option value="in_progress">In Progress</option>
              <option value="decided">Decided</option>
              <option value="blocked">Blocked</option>
            </select>
          </Field>
          <Field label="Priority">
            <input type="number" className="border rounded-xl px-3 py-2"
              value={form.priority ?? 0} onChange={e=>update('priority', Number(e.target.value))} />
          </Field>
          <div className="flex items-end">
            <button onClick={remove} className="btn">Delete</button>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Supplier</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="Who supplies information?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.supplier_who ?? ''} onChange={e=>update('supplier_who', e.target.value)} />
            </Field>
            <Field label="Where is supplier information stored?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.supplier_storage ?? ''} onChange={e=>update('supplier_storage', e.target.value)} />
            </Field>
            <Field label="How is it communicated?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.supplier_comm ?? ''} onChange={e=>update('supplier_comm', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Inputs</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="What inputs are required?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.input_what ?? ''} onChange={e=>update('input_what', e.target.value)} />
            </Field>
            <Field label="Local storage of inputs">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.input_local_storage ?? ''} onChange={e=>update('input_local_storage', e.target.value)} />
            </Field>
            <Field label="Pre-processing needed">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.input_preprocess ?? ''} onChange={e=>update('input_preprocess', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Process → Information</h3>
          <Field label="How are inputs transformed to decision-ready info?">
            <textarea className="w-full border rounded-xl px-3 py-2"
              value={form.process_to_information ?? ''} onChange={e=>update('process_to_information', e.target.value)} />
          </Field>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Decision</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="What is decided upon the information?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.decision_upon_info ?? ''} onChange={e=>update('decision_upon_info', e.target.value)} />
            </Field>
            <Field label="How is the decision communicated?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.decision_comm ?? ''} onChange={e=>update('decision_comm', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Outputs</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="What is the output?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.output_what ?? ''} onChange={e=>update('output_what', e.target.value)} />
            </Field>
            <Field label="Where is it stored?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.output_storage ?? ''} onChange={e=>update('output_storage', e.target.value)} />
            </Field>
            <Field label="How is it communicated?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.output_comm ?? ''} onChange={e=>update('output_comm', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Customer / Handoff</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="Who is the customer/next owner?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.customer_who ?? ''} onChange={e=>update('customer_who', e.target.value)} />
            </Field>
            <Field label="Handoff notes">
              <textarea className="w-full border rounded-xl px-3 py-2"
                value={form.handoff_notes ?? ''} onChange={e=>update('handoff_notes', e.target.value)} />
            </Field>
          </div>
        </div>

        {status && <div className="text-xs text-dtl-charcoal">{status}</div>}
      </div>
    </div>
  );
}
