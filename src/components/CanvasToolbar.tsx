'use client';

export default function CanvasToolbar({
  view,
  setView,
}: {
  view: 'process' | 'information' | 'opportunities';
  setView: (v: 'process' | 'information' | 'opportunities') => void;
}) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-4 z-20 w-[220px] card">
      <div className="card-pad space-y-4">
        <div>
          <label className="form-label">View</label>
          <select className="input" value={view} onChange={(e)=>setView(e.target.value as any)}>
            <option value="process">Decision Process</option>
            <option value="information">Information Flow</option>
            <option value="opportunities">Opportunities</option>
          </select>
        </div>

        <div className="text-sm font-semibold text-slate-700">Tools</div>

        <div className="flex flex-col gap-2">
          <div className="tool-tile" draggable onDragStart={(e)=>onDragStart(e,'decision')}>
            <div className="sticky-card" style={{ width: 56, height: 56, ['--note-bg' as any]:'#FFF7B3' }} />
            <div className="text-sm">Decision</div>
          </div>
          <div className="tool-tile" draggable onDragStart={(e)=>onDragStart(e,'data')}>
            <div className="sticky-card" style={{ width: 56, height: 56, ['--note-bg' as any]:'#DCFCE7' }} />
            <div className="text-sm">Data</div>
          </div>
          <div className="tool-tile" draggable onDragStart={(e)=>onDragStart(e,'opportunity')}>
            <div className="sticky-card" style={{ width: 56, height: 56, ['--note-bg' as any]:'#CDE3FF' }} />
            <div className="text-sm">Opportunity</div>
          </div>
          {/* Diamond icon for Choice */}
          <div className="tool-tile" draggable onDragStart={(e)=>onDragStart(e,'gateway')}>
            <div className="relative" style={{ width: 56, height: 56 }}>
              <div className="absolute inset-0 m-auto w-8 h-8 rotate-45 rounded-sm border border-slate-300 shadow-sm" style={{ background:'#F6E7B2' }} />
            </div>
            <div className="text-sm">Choice</div>
          </div>
        </div>
      </div>
    </div>
  );
}
