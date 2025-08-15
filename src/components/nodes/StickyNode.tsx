'use client';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

export default function StickyNode({ data, selected }: NodeProps) {
  const bg = data?.bg || '#FFF7B3';
  const fg = data?.textColor || '#1f2937';
  const fold = data?.fold || 'rgba(0,0,0,.16)';

  return (
    <div
      className={clsx('sticky-card', selected && 'sticky-selected')}
      style={{ width: 140, height: 140, ['--note-bg' as any]: bg, ['--note-fg' as any]: fg, ['--note-fold' as any]: fold }}
    >
      <div className="p-3 text-sm font-semibold select-none">{data?.label}</div>

      {/* Top / Right / Bottom / Left — source + target so edges stay on that side */}
      <Handle type="source" id="t-src" position={Position.Top} style={{ left:'50%', transform:'translateX(-50%)' }}/>
      <Handle type="target" id="t-tgt" position={Position.Top} style={{ left:'50%', transform:'translateX(-50%)' }}/>

      <Handle type="source" id="r-src" position={Position.Right} style={{ top:'50%', transform:'translateY(-50%)' }}/>
      <Handle type="target" id="r-tgt" position={Position.Right} style={{ top:'50%', transform:'translateY(-50%)' }}/>

      <Handle type="source" id="b-src" position={Position.Bottom} style={{ left:'50%', transform:'translateX(-50%)' }}/>
      <Handle type="target" id="b-tgt" position={Position.Bottom} style={{ left:'50%', transform:'translateX(-50%)' }}/>

      <Handle type="source" id="l-src" position={Position.Left} style={{ top:'50%', transform:'translateY(-50%)' }}/>
      <Handle type="target" id="l-tgt" position={Position.Left} style={{ top:'50%', transform:'translateY(-50%)' }}/>
    </div>
  );
}
