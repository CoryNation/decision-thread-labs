'use client';
import { Handle, Position } from 'reactflow';

export default function OpportunitySticky({ data }: any) {
  const width = 168;
  const height = 48;
  return (
    <div style={{ width, height }} className="rounded-md shadow-soft border">
      <div className="w-full h-full rounded-md" style={{ background: '#CDE3FF' }}>
        <div className="px-3 py-2 text-sm font-medium text-slate-800 select-none">
          {data.label || 'Opportunity'}
        </div>
      </div>
      <Handle type="source" position={Position.Top}   id="t1" style={{ left: 12 }} />
      <Handle type="source" position={Position.Top}   id="t2" style={{ right: 12 }} />
      <Handle type="source" position={Position.Right} id="r1" style={{ top: 8 }} />
      <Handle type="source" position={Position.Right} id="r2" style={{ bottom: 8 }} />
      <Handle type="source" position={Position.Bottom} id="b1" style={{ left: 12 }} />
      <Handle type="source" position={Position.Bottom} id="b2" style={{ right: 12 }} />
      <Handle type="source" position={Position.Left} id="l1" style={{ top: 8 }} />
      <Handle type="source" position={Position.Left} id="l2" style={{ bottom: 8 }} />

      <Handle type="target" position={Position.Top}   id="tt1" style={{ left: 36 }} />
      <Handle type="target" position={Position.Top}   id="tt2" style={{ right: 36 }} />
      <Handle type="target" position={Position.Right} id="tr1" style={{ top: 18 }} />
      <Handle type="target" position={Position.Right} id="tr2" style={{ bottom: 18 }} />
      <Handle type="target" position={Position.Bottom} id="tb1" style={{ left: 36 }} />
      <Handle type="target" position={Position.Bottom} id="tb2" style={{ right: 36 }} />
      <Handle type="target" position={Position.Left} id="tl1" style={{ top: 18 }} />
      <Handle type="target" position={Position.Left} id="tl2" style={{ bottom: 18 }} />
    </div>
  );
}
