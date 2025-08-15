'use client';

type Props = {
  view: 'process' | 'information' | 'opportunities';
  setView: (v: Props['view']) => void;
};

function ToolTile({
  label,
  onDragStart,
  kind,
}: {
  label: string;
  kind: 'decision' | 'data' | 'opportunity' | 'choice';
  onDragStart: (e: React.DragEvent, kind: string) => void;
}) {
  const size = 56;

  if (kind === 'choice') {
    // diamond preview
    return (
      <button
        className="tool-tile"
        draggable
        onDragStart={(e) => onDragStart(e, 'choice')}
        title="Choice"
      >
        <div className="relative" style={{ width: size, height: size }}>
          <div
            className="absolute inset-0 m-auto rounded-md border border-slate-300 shadow-sm bg-[#F6E7B2]"
            style={{ transform: 'rotate(45deg)' }}
          />
        </div>
        <div className="text-xs">Choice</div>
      </button>
    );
  }

  const bg =
    kind === 'data' ? '#DCFCE7' : kind === 'opportunity' ? '#CDE3FF' : '#FFF7B3';
  const fold =
    kind === 'data'
      ? 'rgba(31,122,31,.22)'
      : kind === 'opportunity'
      ? 'rgba(30,64,175,.18)'
      : 'rgba(0,0,0,.14)';

  return (
    <button
      className="tool-tile"
      draggable
      onDragStart={(e) => onDragStart(e, kind)}
      title={label}
    >
      <div
        className="relative rounded-md border border-slate-300 shadow-sm"
        style={{
          width: size,
          height: size,
          background: bg,
          clipPath: 'polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: 12,
          height: 12,
          right: 6,
          bottom: 18,
          background: fold,
          clipPath: 'polygon(100% 0,0 100%,100% 100%)',
          borderBottomRightRadius: 4,
        }}
      />
      <div className="text-xs">{label}</div>
    </button>
  );
}

export default function CanvasToolbar({ view, setView }: Props) {
  const onDragStart = (e: React.DragEvent, kind: string) => {
    e.dataTransfer.setData('application/reactflow', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-3 top-3 z-20">
      <div className="rounded-xl bg-white border shadow p-3 w-[220px]">
        <div className="mb-2 text-xs text-slate-500">View</div>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as Props['view'])}
          className="w-full mb-3 rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="process">Decision Process</option>
          <option value="information">Information Flow</option>
          <option value="opportunities">Opportunities</option>
        </select>

        <div className="mb-2 text-xs text-slate-500">Tools</div>
        <div className="grid grid-cols-2 gap-3">
          <ToolTile label="Decision" kind="decision" onDragStart={onDragStart} />
          <ToolTile label="Data" kind="data" onDragStart={onDragStart} />
          <ToolTile label="Opportunity" kind="opportunity" onDragStart={onDragStart} />
          <ToolTile label="Choice" kind="choice" onDragStart={onDragStart} />
        </div>
      </div>
    </div>
  );
}
