'use client';

type Props = {
  view: 'process' | 'information' | 'opportunities';
  setView: (v: Props['view']) => void;
};

const note = (fill: string, fold: string) => (
  <div className="relative h-10 w-10 rounded-md border border-slate-300 shadow-sm" style={{ background: fill }}>
    <div
      className="absolute right-0 bottom-0"
      style={{ width: 16, height: 16, background: 'transparent', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
    />
    <div
      className="absolute right-0 bottom-0"
      style={{ width: 16, height: 16, background: fold, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
    />
  </div>
);

const diamond = (fill: string) => (
  <div className="relative h-10 w-10">
    <div
      className="absolute inset-0 m-auto rounded border border-slate-300 shadow-sm"
      style={{ width: 28, height: 28, background: fill, transform: 'translate(11px,11px) rotate(45deg)' }}
    />
  </div>
);

export default function CanvasToolbar({ view, setView }: Props) {
  const drag = (e: React.DragEvent, kind: 'decision' | 'data' | 'opportunity' | 'choice') => {
    e.dataTransfer.setData('application/reactflow', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-4 z-20 w-56 rounded-xl border bg-white/90 p-3 shadow">
      <div className="text-xs font-medium text-slate-600">View</div>
      <select
        value={view}
        onChange={(e) => setView(e.target.value as any)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      >
        <option value="process">Decision Process</option>
        <option value="information">Information Flow</option>
        <option value="opportunities">Opportunities</option>
      </select>

      <div className="mt-3 text-xs font-medium text-slate-600">Tools</div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <button className="group flex flex-col items-center gap-1" draggable onDragStart={(e) => drag(e, 'decision')}>
          {note('#FFF7B3', 'rgba(0,0,0,.14)')}
          <span className="text-xs text-slate-600 group-hover:text-slate-900">Decision</span>
        </button>

        <button className="group flex flex-col items-center gap-1" draggable onDragStart={(e) => drag(e, 'data')}>
          {note('#DCFCE7', 'rgba(31,122,31,.22)')}
          <span className="text-xs text-slate-600 group-hover:text-slate-900">Data</span>
        </button>

        <button className="group flex flex-col items-center gap-1" draggable onDragStart={(e) => drag(e, 'opportunity')}>
          {note('#CDE3FF', 'rgba(30,64,175,.18)')}
          <span className="text-xs text-slate-600 group-hover:text-slate-900">Opportunity</span>
        </button>

        <button className="group flex flex-col items-center gap-1" draggable onDragStart={(e) => drag(e, 'choice')}>
          {diamond('#F6E7B2')}
          <span className="text-xs text-slate-600 group-hover:text-slate-900">Choice</span>
        </button>
      </div>
    </div>
  );
}
