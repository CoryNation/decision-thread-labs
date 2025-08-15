'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Decision = {
  id: string; project_id: string; kind: 'decision'|'data'|'opportunity'|'gateway';
  title: string; statement: string | null;
  supplier_who?: string|null;
  supplier_storage?: string|null;
  supplier_comm_email?: boolean|null;
  supplier_comm_verbal?: boolean|null;
  supplier_comm_form?: boolean|null;
  supplier_comm_notification?: boolean|null;
  supplier_comm_other?: boolean|null;
  supplier_comm_other_text?: string|null;

  inputs_what?: string|null;
  inputs_format?: string|null;
  inputs_transformed?: boolean|null;

  process_desc?: string|null;
  process_goal?: string|null;
  process_people?: boolean|null;

  outputs_what?: string|null;
  outputs_format?: string|null;

  customer_who?: string|null;
  customer_comm?: string|null;

  queue_time_min?: number|null;
  action_time_min?: number|null;
};

export default function SipocInspector({
  decision,
  onClose,
  onSaved,
  onDelete,
}: {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
}) {
  // Local copy prevents the “single character” overwrite problem
  const [form, setForm] = useState<Decision>(decision);
  useEffect(() => { setForm(decision); }, [decision?.id]);

  const update = (k: keyof Decision, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const { data } = await supabase.from('decisions').update(form).eq('id', form.id).select('*').single();
    if (data) onSaved(data as Decision);
  };

  const del = async () => {
    await supabase.from('decision_links').delete().or(`from_id.eq.${form.id},to_id.eq.${form.id}`);
    await supabase.from('decisions').delete().eq('id', form.id);
    onDelete(form.id);
    onClose();
  };

  const commOtherEnabled = !!form.supplier_comm_other;

  return (
    <aside className="absolute right-4 top-4 bottom-4 w-[380px] card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
        <h3 className="text-sm font-semibold text-slate-700">SIPOC Inspector</h3>
        <div className="flex items-center gap-2">
          <button className="btn btn-teal !h-14 !w-14 rounded-full" onClick={save} title="Save">
            <span className="icon">save</span>
          </button>
          <button className="btn btn-danger !h-14 !w-14 rounded-full" onClick={del} title="Delete">
            <span className="icon">delete</span>
          </button>
          <button className="btn !h-14 !w-14 rounded-full" onClick={onClose} title="Close">
            <span className="icon">close</span>
          </button>
        </div>
      </div>

      <div className="card-pad space-y-5 overflow-y-auto h-[calc(100%-64px)]">
        <div>
          <label className="form-label">Type</label>
          <select
            className="input"
            value={form.kind}
            onChange={(e) => update('kind', e.target.value as any)}
          >
            <option value="decision">Decision</option>
            <option value="data">Data</option>
            <option value="opportunity">Opportunity</option>
            <option value="gateway">Choice</option>
          </select>
        </div>

        <div>
          <label className="form-label">Title</label>
          <input className="input" value={form.title || ''} onChange={(e)=>update('title', e.target.value)} />
        </div>

        {/* Supplier */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Supplier</div>
          <label className="form-label">Who supplies the information?</label>
          <input className="input" value={form.supplier_who || ''} onChange={e=>update('supplier_who', e.target.value)} />

          <label className="form-label mt-3">Where is the information stored?</label>
          <input className="input" value={form.supplier_storage || ''} onChange={e=>update('supplier_storage', e.target.value)} />

          <label className="form-label mt-3">How is it communicated?</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox" checked={!!form.supplier_comm_email} onChange={e=>update('supplier_comm_email', e.target.checked)} /> Email
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox" checked={!!form.supplier_comm_verbal} onChange={e=>update('supplier_comm_verbal', e.target.checked)} /> Verbal
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox" checked={!!form.supplier_comm_form} onChange={e=>update('supplier_comm_form', e.target.checked)} /> Form
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox" checked={!!form.supplier_comm_notification} onChange={e=>update('supplier_comm_notification', e.target.checked)} /> Notification
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox" checked={!!form.supplier_comm_other} onChange={e=>update('supplier_comm_other', e.target.checked)} /> Other
            </label>
          </div>

          {commOtherEnabled && (
            <input className="input mt-2" placeholder="other" value={form.supplier_comm_other_text || ''} onChange={e=>update('supplier_comm_other_text', e.target.value)} />
          )}
        </div>

        {/* Inputs */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Inputs</div>
          <label className="form-label">What information is needed?</label>
          <input className="input" value={form.inputs_what || ''} onChange={e=>update('inputs_what', e.target.value)} />
          <label className="form-label mt-3">What format is it in?</label>
          <input className="input" value={form.inputs_format || ''} onChange={e=>update('inputs_format', e.target.value)} />
        </div>

        {/* Process of Decision Making */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Process of decision making</div>
          <label className="form-label">Describe high level decision making process for this step.</label>
          <textarea className="input" rows={3} value={form.process_desc || ''} onChange={e=>update('process_desc', e.target.value)} />
          <label className="form-label mt-3">What is the goal?</label>
          <input className="input" value={form.process_goal || ''} onChange={e=>update('process_goal', e.target.value)} />
          <label className="form-label mt-3">Are other people needed to support?</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox" checked={!!form.process_people} onChange={e=>update('process_people', e.target.checked)} /> Yes
          </label>
        </div>

        {/* Outputs */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Outputs</div>
          <label className="form-label">What is the output?</label>
          <input className="input" value={form.outputs_what || ''} onChange={e=>update('outputs_what', e.target.value)} />
          <label className="form-label mt-3">What format is it in?</label>
          <input className="input" value={form.outputs_format || ''} onChange={e=>update('outputs_format', e.target.value)} />
        </div>

        {/* Timing */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <label className="form-label">Queue (min)</label>
            <input className="input" type="number" value={form.queue_time_min ?? 0}
              onChange={e=>update('queue_time_min', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Action (min)</label>
            <input className="input" type="number" value={form.action_time_min ?? 0}
              onChange={e=>update('action_time_min', Number(e.target.value))} />
          </div>
        </div>
      </div>
    </aside>
  );
}
