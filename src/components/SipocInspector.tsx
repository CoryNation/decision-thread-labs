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
  decision: Decision | null;
  onClose: () => void;
  onSaved?: (d: Decision) => void;
  onDelete?: (id: string) => void;
};

const DEFAULTS = ['Email','Verbal','Form','Notification','Other'];

export default function SipocInspector({ decision, onClose, onSaved, onDelete }: Props) {
  const [form, setForm] = useState<Decision | null>(decision);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [commOptions, setCommOptions] = useState<string[]>([]);
  const [otherEntry, setOtherEntry] = useState('');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => { if (!decision) { setForm(null); return; } setForm({ ...decision }); }, [decision?.id]);

  useEffect(() => {
    async function load() {
      if (!decision) return;
      const { data } = await supabase.from('project_comm_options').select('label').eq('project_id', decision.project_id).order('label');
      const labels = (data || []).map((r: any) => r.label);
      setCommOptions(Array.from(new Set([...DEFAULTS, ...labels])));
    }
    load();
  }, [decision?.project_id]);

  useEffect(() => {
    if (!form) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [form?.id]);

  if (!form) return null;

  const update = (k: keyof Decision, v: any) => setForm(prev => prev ? { ...prev, [k]: v } : prev);
  const toggleCommMethod = (label: string) => {
    setForm(prev => {
      if (!prev) return prev;
      const cur = new Set(prev.comm_methods || []);
      cur.has(label) ? cur.delete(label) : cur.add(label);
      return { ...prev, comm_methods: Array.from(cur) };
    });
  };

  async function addOtherOption() {
    const label = otherEntry.trim();
    if (!label || !decision) return;
    const { error } = await supabase.from('project_comm_options').insert({ project_id: decision.project_id, label });
    if (!error) { setCommOptions(prev => Array.from(new Set([...prev, label]))); setOtherEntry(''); } else { setStatus(error.message); }
  }

  async function renameOption(oldLabel: string, newLabelVal: string) {
    if (!decision) return;
    const { error } = await supabase.rpc('rename_comm_option', { p_project_id: decision.project_id, p_old_label: oldLabel, p_new_label: newLabelVal });
    if (!error) {
      setCommOptions(prev => prev.map(l => l === oldLabel ? newLabelVal : l));
      setEditingLabel(null); setNewLabel('');
      setForm(prev => prev ? { ...prev, comm_methods: (prev.comm_methods || []).map(l => l===oldLabel?newLabelVal:l) } : prev);
    } else { setStatus(error.message); }
  }

  async function deleteOption(label: string) {
    if (!decision) return;
    const { error } = await supabase.rpc('delete_comm_option', { p_project_id: decision.project_id, p_label: label });
    if (!error) {
      setCommOptions(prev => prev.filter(l => l !== label));
      setForm(prev => prev ? { ...prev, comm_methods: (prev.comm_methods || []).filter(l => l !== label) } : prev);
    } else { setStatus(error.message); }
  }

  async function save() {
    if (!form) return;
    setSaving(true); setStatus('Saving...');
    const { data, error } = await supabase
      .from('decisions')
      .update({
        title: form.title,
        statement: form.statement,
        kind: form.kind,
        supplier_who: form.supplier_who,
        supplier_storage: form.supplier_storage,
        input_what: form.input_what,
        inputs_format: form.inputs_format,
        inputs_transformed: form.inputs_transformed,
        process_to_information: form.process_to_information,
        process_goal: form.process_goal,
        process_support_needed: form.process_support_needed,
        decision_upon_info: form.decision_upon_info,
        decision_comm: form.decision_comm,
        output_what: form.output_what,
        outputs_format: form.outputs_format,
        output_storage: form.output_storage,
        output_comm: form.output_comm,
        customer_who: form.customer_who,
        handoff_notes: form.handoff_notes,
        comm_methods: form.comm_methods,
        queue_time_min: form.queue_time_min,
        action_time_min: form.action_time_min,
      })
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

  const Field = ({ label, children }: any) => (
    <label className="block text-sm">
      <span className="text-dtl-charcoal">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <div
      className="absolute right-0 top-0 h-[80vh] w-full sm:w-[320px] z-50 bg-white border-l shadow-soft"
      style={{ overflow: 'hidden' }}
      onMouseDown={(e)=>e.stopPropagation()}
      onWheel={(e)=>e.stopPropagation()}
      onKeyDownCapture={(e)=>e.stopPropagation()}
      tabIndex={0}
    >
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold">SIPOC Inspector</h2>
        <div className="flex gap-2">
          <button onClick={save} className="btn btn-accent">{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(80vh-52px)]">
        <Field label="Type">
          <select className="border rounded-xl px-3 py-2" value={form.kind}
            onChange={e=>update('kind', e.target.value as any)}>
            <option value="decision">Decision</option>
            <option value="data">Data/Information</option>
            <option value="opportunity">Opportunity</option>
            <option value="gateway">Gateway (Decision)</option>
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

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Supplier</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="Who supplies the information?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.supplier_who ?? ''} onChange={e=>update('supplier_who', e.target.value)} />
            </Field>
            <Field label="Where is the information stored?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.supplier_storage ?? ''} onChange={e=>update('supplier_storage', e.target.value)} />
            </Field>
            <Field label="How is it communicated?">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(commOptions || []).map(opt => (
                    <label key={opt} className="inline-flex items-center gap-1 text-xs border rounded-full px-2 py-1">
                      <input type="checkbox"
                        checked={(form.comm_methods || []).includes(opt)}
                        onChange={()=>toggleCommMethod(opt)}
                      />
                      <span>{opt}</span>
                      {(!DEFAULTS.includes(opt)) && (
                        <>
                          <button className="text-xs ml-1" title="Edit" onClick={(e)=>{e.preventDefault(); setEditingLabel(opt); setNewLabel(opt);}}>✏️</button>
                          <button className="text-xs text-red-600" title="Delete" onClick={(e)=>{e.preventDefault(); deleteOption(opt);}}>🗑️</button>
                        </>
                      )}
                    </label>
                  ))}
                </div>
                {editingLabel && (
                    <div className="flex gap-2">
                      <input className="flex-1 border rounded-xl px-3 py-2 text-sm" value={newLabel} onChange={e=>setNewLabel(e.target.value)} />
                      <button className="btn" onClick={()=>renameOption(editingLabel!, newLabel)}>Save</button>
                      <button className="btn" onClick={()=>{setEditingLabel(null); setNewLabel('');}}>Cancel</button>
                    </div>
                )}
                <div className="flex gap-2">
                  <input
                    placeholder="other"
                    className="flex-1 border rounded-xl px-3 py-2 text-sm placeholder:text-gray-400"
                    value={otherEntry}
                    onChange={e=>setOtherEntry(e.target.value)}
                  />
                  <button type="button" className="btn" onClick={addOtherOption}>Add</button>
                </div>
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Inputs</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="What information is needed?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.input_what ?? ''} onChange={e=>update('input_what', e.target.value)} />
            </Field>
            <Field label="What format is it in?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.inputs_format ?? ''} onChange={e=>update('inputs_format', e.target.value)} />
            </Field>
            <Field label="Is the information transformed into another format?">
              <select className="border rounded-xl px-3 py-2"
                value={form.inputs_transformed ? 'yes':'no'}
                onChange={e=>update('inputs_transformed', e.target.value === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Process of Decision Making</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="Describe high level decision making process for this step.">
              <textarea className="w-full border rounded-xl px-3 py-2"
                value={form.process_to_information ?? ''} onChange={e=>update('process_to_information', e.target.value)} />
            </Field>
            <Field label="What is the goal?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.process_goal ?? ''} onChange={e=>update('process_goal', e.target.value)} />
            </Field>
            <Field label="Are other people needed to support?">
              <select className="border rounded-xl px-3 py-2"
                value={form.process_support_needed ? 'yes':'no'}
                onChange={e=>update('process_support_needed', e.target.value === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
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
            <Field label="What format is it in?">
              <input className="w-full border rounded-xl px-3 py-2"
                value={form.outputs_format ?? ''} onChange={e=>update('outputs_format', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Customer / Handoff</h3>
          <div className="grid grid-cols-1 gap-2">
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
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Timing</h3>
          <div className="grid grid-cols-1 gap-2">
            <Field label="Queue time (min)">
              <input type="number" className="w-full border rounded-xl px-3 py-2"
                value={form.queue_time_min ?? 0}
                onChange={e=>update('queue_time_min', Number(e.target.value))} />
            </Field>
            <Field label="Action time (min)">
              <input type="number" className="w-full border rounded-xl px-3 py-2"
                value={form.action_time_min ?? 0}
                onChange={e=>update('action_time_min', Number(e.target.value))} />
            </Field>
            <Field label="Total (calculated)">
              <input className="w-full border rounded-xl px-3 py-2 bg-gray-50" value={(form.queue_time_min||0)+(form.action_time_min||0)} readOnly />
            </Field>
          </div>
        </div>

        <div className="pb-16">
          <button onClick={remove} className="btn">Delete</button>
          {status && <span className="ml-3 text-xs text-dtl-charcoal">{status}</span>}
        </div>
      </div>
    </div>
  );
}
