'use client';
type Props = {
  view: 'process'|'information'|'opportunities';
  setView: (v: Props['view']) => void;
};

const tiles = [
  { kind: 'decision', label: 'Decision', bg: '#FFF7B3', text: '#1f2937' },
  { kind: 'data', label: 'Data', bg: '#DCFCE7', text: '#1F7A1F' },
  { kind: 'opportunity', label: 'Opportunity', bg: '#CDE3FF', text: '#1f2937' },
  { kind: 'gateway', label: 'Choice', bg: '#F6E7B2', text: '#1f2937' },
] as const;

export default function CanvasToolbar({ view, setView }: Props) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-56 rounded-xl border bg-white/90 p-3 shadow">
      <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">View</div>
      <select
        className="mb-3 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        value={view}
        onChange={(e) => setView(e.target.value as any)}
      >
        <option value="process">Decision Process</option>
        <option value="information">Information Flow</option>
        <option value="opportunities">Opportunities</option>
      </select>

      <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">Tools</div>
      <div className="flex flex-col gap-2">
        {tiles.map((t) => (
          <div key={t.kind}
            draggable
            onDragStart={(e) => onDragStart(e, t.kind)}
            className="rounded-lg border p-2 hover:bg-slate-50 cursor-grab active:cursor-grabbing"
          >
            <div className="relative rounded-xl border shadow-sm"
              style={{ width: 90, height: 90, background: t.bg, color: t.text, borderColor:'rgba(0,0,0,0.08)' }}>
              <div style={{
                position:'absolute', right:0, bottom:0, width: 22, height:22,
                clipPath:'polygon(100% 0, 0% 100%, 100% 100%)', background:'rgba(0,0,0,0.08)'
              }} />
              <div className="absolute inset-0 flex items-center justify-center px-1 text-[10px] font-medium">{t.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
