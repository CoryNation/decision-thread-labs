'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type K = 'decision'|'data'|'opportunity'|'gateway';
type Decision = {
  id: string; project_id: string; kind: K; title: string;
  supplier_who?: string|null; supplier_storage?: string|null; supplier_comm?: string[]|null;
  inputs_what?: string|null; inputs_format?: string|null; inputs_transformed?: boolean|null;
  process_desc?: string|null; process_goal?: string|null; process_support?: boolean|null;
  outputs_what?: string|null; outputs_format?: string|null;
  customer_who?: string|null; customer_comm?: string[]|null; handoff_notes?: string|null;
  queue_time_min?: number|null; action_time_min?: number|null;
};

export default function SipocInspector({
  decision, onClose, onSaved, onDelete,
}: {
  decision: Decision;
  onClose: () => void;
  onSaved: (d: Decision) => void;
  onDelete: (id: string) => void;
}) {
  // keep a local draft so inputs remain focused while typing
  const [draft, setDraft] = useState<Decision>(decision);
  useEffect(() => setDraft(decision), [decision]);

  const commOptionsKey = useMemo(() => `dtl-comm-options-${decision.project_id}`, [decision.project_id]);
  const [commOptions, setCommOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(commOptionsKey);
      setCommOptions(raw ? JSON.parse(raw) : ['Email','Verbal','Form','Notification','Other']);
    } catch { setCommOptions(['Email','Verbal','Form','Notification','Other']); }
  }, [commOptionsKey]);

  function persistOptions(next: string[]) {
    setCommOptions(next);
    try { localStorage.setItem(commOptionsKey, JSON.stringify(next)); } catch {}
  }

  const toggleComm = (field: 'supplier_comm'|'customer_comm', value: string) => {
    setDraft(prev => {
      const cur = new Set(prev[field] ?? []);
      cur.has(value) ? cur.delete(value) : cur.add(value);
      return { ...prev, [field]: Array.from(cur) as string[] };
    });
  };

  async function save() {
    const { data } = await supabase.from('decisions').update({
      kind: draft.kind, title: draft.title,
      supplier_who: draft.supplier_who, supplier_storage: draft.supplier_storage, supplier_comm: draft.supplier_comm ?? [],
      inputs_what: draft.inputs_what, inputs_format: draft.inputs_format, inputs_transformed: draft.inputs_transformed ?? null,
      process_desc: draft.process_desc, process_goal: draft.process_goal, process_support: draft.process_support ?? null,
      outputs_what: draft.outputs_what, outputs_format: draft.outputs_format,
      customer_who: draft.customer_who, customer_comm: draft.customer_comm ?? [], handoff_notes: draft.handoff_notes,
      queue_time_min: draft.queue_time_min ?? null, action_time_min: draft.action_time_min ?? null,
    }).eq('id', decision.id).select('*').single();
    onSaved((data as any) || draft);
  }

  async function remove() {
    await supabase.from('decision_links').delete().or(`from_id.eq.${decision.id},to_id.eq.${decision.id}`);
    await supabase.from('decisions').delete().eq('id', decision.id);
    onDelete(decision.id);
  }

  return (
    <div className="inspector absolute right-4 top-4 z-20 rounded-2xl bg-white p-4 shadow">
      {/* FAB icon buttons */}
      <div className="flex justify-end gap-3 mb-2">
        <button className="fab fab-primary" aria-label="Save" onClick={save}>
          <span className="material-symbols-outlined">save</span>
        </button>
        <button className="fab fab-outline-red" aria-label="Delete" onClick={remove}>
          <span className="material-symbols-outlined">delete</span>
        </button>
        <button className="fab fab-outline-muted" aria-label="Close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-3 pr-1">
        <div className="text-sm font-semibold">SIPOC Inspector</div>

        <label className="block text-xs font-medium">Type</label>
        <select className="w-full rounded border px-2 py-1 text-sm"
          value={draft.kind}
          onChange={(e) => setDraft({ ...draft, kind: e.target.value as K })}
        >
          <option value="decision">Decision</option>
          <option value="data">Data</option>
          <option value="opportunity">Opportunity</option>
          <option value="gateway">Choice</option>
        </select>

        <label className="block text-xs font-medium">Title</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <div className="mt-2 h-px bg-slate-200" />

        <div className="text-xs font-semibold text-slate-600">Supplier</div>
        <label className="block text-xs">Who supplies the information?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.supplier_who||''} onChange={(e)=>setDraft({...draft, supplier_who:e.target.value})}
        />
        <label className="block text-xs">Where is the information stored?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.supplier_storage||''} onChange={(e)=>setDraft({...draft, supplier_storage:e.target.value})}
        />
        <div className="text-xs">How is it communicated?</div>
        <div className="flex flex-wrap gap-3 items-center">
          {commOptions.map((opt) => (
            <label key={opt} className="inline-flex items-center gap-1 text-xs">
              <input type="checkbox"
                checked={(draft.supplier_comm||[]).includes(opt)}
                onChange={() => toggleComm('supplier_comm', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input id="customComm" placeholder="other" className="flex-1 rounded border px-2 py-1 text-sm placeholder-slate-400" />
          <button className="rounded border px-2 text-xs" onClick={() => {
            const el = document.getElementById('customComm') as HTMLInputElement | null;
            const t = (el?.value || '').trim(); if (!t) return;
            const next = Array.from(new Set([...commOptions, t])); persistOptions(next); if (el) el.value='';
          }}>
            <span className="material-symbols-outlined align-middle">edit</span>
          </button>
        </div>

        <div className="mt-2 h-px bg-slate-200" />

        <div className="text-xs font-semibold text-slate-600">Inputs</div>
        <label className="block text-xs">What information is needed?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.inputs_what||''} onChange={(e)=>setDraft({...draft, inputs_what:e.target.value})}
        />
        <label className="block text-xs">What format is it in?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.inputs_format||''} onChange={(e)=>setDraft({...draft, inputs_format:e.target.value})}
        />
        <label className="inline-flex items-center gap-2 text-xs">
          <input type="checkbox" checked={!!draft.inputs_transformed}
            onChange={(e)=>setDraft({...draft, inputs_transformed:e.target.checked})}
          />
          Is the information transformed into another format?
        </label>

        <div className="mt-2 h-px bg-slate-200" />

        <div className="text-xs font-semibold text-slate-600">Process of Decision Making</div>
        <label className="block text-xs">Describe high level decision making process for this step.</label>
        <textarea className="w-full rounded border px-2 py-1 text-sm min-h-[72px]"
          value={draft.process_desc||''} onChange={(e)=>setDraft({...draft, process_desc:e.target.value})}
        />
        <label className="block text-xs">What is the goal?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.process_goal||''} onChange={(e)=>setDraft({...draft, process_goal:e.target.value})}
        />
        <label className="inline-flex items-center gap-2 text-xs">
          <input type="checkbox" checked={!!draft.process_support}
            onChange={(e)=>setDraft({...draft, process_support:e.target.checked})}
          />
          Are other people needed to support?
        </label>

        <div className="mt-2 h-px bg-slate-200" />

        <div className="text-xs font-semibold text-slate-600">Outputs</div>
        <label className="block text-xs">What is the output?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.outputs_what||''} onChange={(e)=>setDraft({...draft, outputs_what:e.target.value})}
        />
        <label className="block text-xs">What format is it in?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.outputs_format||''} onChange={(e)=>setDraft({...draft, outputs_format:e.target.value})}
        />

        <div className="mt-2 h-px bg-slate-200" />

        <div className="text-xs font-semibold text-slate-600">Customer</div>
        <label className="block text-xs">Who is the customer (next owner)?</label>
        <input className="w-full rounded border px-2 py-1 text-sm"
          value={draft.customer_who||''} onChange={(e)=>setDraft({...draft, customer_who:e.target.value})}
        />
        <div className="text-xs">How is it communicated?</div>
        <div className="flex flex-wrap gap-3 items-center">
          {commOptions.map((opt) => (
            <label key={opt} className="inline-flex items-center gap-1 text-xs">
              <input type="checkbox"
                checked={(draft.customer_comm||[]).includes(opt)}
                onChange={() => toggleComm('customer_comm', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <label className="block text-xs">Handoff notes</label>
        <textarea className="w-full rounded border px-2 py-1 text-sm min-h-[56px]"
          value={draft.handoff_notes||''} onChange={(e)=>setDraft({...draft, handoff_notes:e.target.value})}
        />

        <div className="mt-2 h-px bg-slate-200" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="block">Queue time (min)</label>
          <input className="rounded border px-2 py-1 text-sm" type="number"
            value={draft.queue_time_min ?? 0} onChange={(e)=>setDraft({...draft, queue_time_min:Number(e.target.value)})}
          />
          <label className="block">Action time (min)</label>
          <input className="rounded border px-2 py-1 text-sm" type="number"
            value={draft.action_time_min ?? 0} onChange={(e)=>setDraft({...draft, action_time_min:Number(e.target.value)})}
          />
        </div>
      </div>
    </div>
  );
}
