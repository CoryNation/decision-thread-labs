'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Decision = {
  id: string;
  project_id: string;
  kind: 'decision'|'data'|'opportunity'|'gateway';
  title: string;
  statement: string | null;
  supplier_who?: string | null;
  supplier_storage?: string | null;
  comm_methods?: string[] | null;
  input_what?: string | null;
  inputs_format?: string | null;
  process_desc?: string | null;
  process_goal?: string | null;
  process_support?: boolean | null;
  output_what?: string | null;
  outputs_format?: string | null;
  customer_who?: string | null;
  customer_comm?: string[] | null;
  handoff_notes?: string | null;
  queue_time_min?: number | null;
  action_time_min?: number | null;
};

type Props = {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
};

const COMM_CHOICES = ['Email','Verbal','Form','Notification','Other'];

export default function SipocInspector({ decision, onClose, onSaved, onDelete }: Props) {
  const [form, setForm] = useState<Decision>(decision);
  const [customMethods, setCustomMethods] = useState<string[]>([]);

  useEffect(() => { setForm(decision); }, [decision?.id]);

  const toggleArr = (field: keyof Decision, value: string) => {
    const arr = (form[field] as string[] | null) || [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    setForm({ ...form, [field]: next });
  };

  const save = async () => {
    const { data, error } = await supabase.from('decisions')
      .update({
        title: form.title,
        statement: form.statement,
        supplier_who: form.supplier_who,
        supplier_storage: form.supplier_storage,
        comm_methods: form.comm_methods || [],
        input_what: form.input_what,
        inputs_format: form.inputs_format,
        process_desc: form.process_desc,
        process_goal: form.process_goal,
        process_support: form.process_support,
        output_what: form.output_what,
        outputs_format: form.outputs_format,
        customer_who: form.customer_who,
        customer_comm: form.customer_comm || [],
        handoff_notes: form.handoff_notes,
        queue_time_min: form.queue_time_min,
        action_time_min: form.action_time_min,
        kind: form.kind
      })
      .eq('id', decision.id)
      .select('*')
      .single();
    if (!error && data) onSaved(data as any);
  };

  const remove = async () => {
    await supabase.from('decisions').delete().eq('id', decision.id);
    onDelete(decision.id);
    onClose();
  };

  const addCustomMethod = (value: string) => {
    if (!value) return;
    if (!customMethods.includes(value)) setCustomMethods([...customMethods, value]);
    setForm({ ...form, comm_methods: [ ...(form.comm_methods||[]), value ] });
  };

  const allMethods = useMemo(() => [...COMM_CHOICES, ...customMethods], [customMethods]);

  return (
    <div className="absolute right-4 top-4 z-20 rounded-xl border bg-white p-3 shadow-lg inspector">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">SIPOC Inspector</div>
        <div className="flex gap-2">
          <button className="fab fab-primary" onClick={save} title="Save">
            <span className="material-symbols-outlined">save</span>
          </button>
          <button className="fab fab-outline-red" onClick={remove} title="Delete">
            <span className="material-symbols-outlined">delete</span>
          </button>
          <button className="fab fab-outline-muted" onClick={onClose} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500">Type</label>
          <select className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as any })}>
            <option value="decision">Decision</option>
            <option value="data">Data</option>
            <option value="opportunity">Opportunity</option>
            <option value="gateway">Choice</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500">Title</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mt-2">Supplier</label>
          <label className="block text-xs text-slate-500">Who supplies the information?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.supplier_who || ''}
            onChange={(e) => setForm({ ...form, supplier_who: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">Where is the information stored?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.supplier_storage || ''}
            onChange={(e) => setForm({ ...form, supplier_storage: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">How is it communicated?</label>
          <div className="flex flex-wrap gap-2">
            {allMethods.map((m) => (
              <label key={m} className="flex items-center gap-1 text-xs">
                <input type="checkbox"
                  checked={(form.comm_methods||[]).includes(m)}
                  onChange={() => toggleArr('comm_methods', m)} />
                <span>{m}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input placeholder="other" className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') { addCustomMethod((e.target as HTMLInputElement).value.trim()); (e.target as HTMLInputElement).value=''; }
              }} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mt-2">Inputs</label>
          <label className="block text-xs text-slate-500">What information is needed?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.input_what || ''}
            onChange={(e) => setForm({ ...form, input_what: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">What format is it in?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.inputs_format || ''}
            onChange={(e) => setForm({ ...form, inputs_format: e.target.value })} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mt-2">Process of Decision Making</label>
          <label className="block text-xs text-slate-500">Describe high level decision making process for this step.</label>
          <textarea className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            rows={3}
            value={form.process_desc || ''}
            onChange={(e) => setForm({ ...form, process_desc: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">What is the goal?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.process_goal || ''}
            onChange={(e) => setForm({ ...form, process_goal: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">Are other people needed to support?</label>
          <input type="checkbox"
            checked={!!form.process_support}
            onChange={(e) => setForm({ ...form, process_support: e.target.checked })} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mt-2">Outputs</label>
          <label className="block text-xs text-slate-500">What is the output?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.output_what || ''}
            onChange={(e) => setForm({ ...form, output_what: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">What format is it in?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.outputs_format || ''}
            onChange={(e) => setForm({ ...form, outputs_format: e.target.value })} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mt-2">Customer</label>
          <label className="block text-xs text-slate-500">Who is the customer (next owner)?</label>
          <input className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={form.customer_who || ''}
            onChange={(e) => setForm({ ...form, customer_who: e.target.value })} />

          <label className="mt-2 block text-xs text-slate-500">How is it communicated?</label>
          <div className="flex flex-wrap gap-2">
            {allMethods.map((m) => (
              <label key={m} className="flex items-center gap-1 text-xs">
                <input type="checkbox"
                  checked={(form.customer_comm||[]).includes(m)}
                  onChange={() => toggleArr('customer_comm', m)} />
                <span>{m}</span>
              </label>
            ))}
          </div>

          <label className="mt-2 block text-xs text-slate-500">Handoff notes</label>
          <textarea className="w-full rounded border border-slate-300 px-2 py-1 text-sm" rows={2}
            value={form.handoff_notes || ''}
            onChange={(e) => setForm({ ...form, handoff_notes: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Queue time (min)</label>
            <input type="number" className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={form.queue_time_min || 0}
              onChange={(e) => setForm({ ...form, queue_time_min: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Action time (min)</label>
            <input type="number" className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={form.action_time_min || 0}
              onChange={(e) => setForm({ ...form, action_time_min: Number(e.target.value) })} />
          </div>
        </div>
      </div>
    </div>
  );
}
