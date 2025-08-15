'use client';
import { Handle, Position } from 'reactflow';

export default function DataCylinder({ data }: any) {
  const width = 168;
  const height = 72;

  return (
    <div style={{ width, height }} className="rounded-md shadow-soft border bg-white">
      <svg width={width} height={height}>
        <ellipse cx={width/2} cy={18} rx={width/2 - 6} ry={16} fill="#E7F3EA" stroke="#1F7A1F" />
        <rect x="6" y="18" width={width-12} height={height-36} fill="#E7F3EA" stroke="#1F7A1F" />
        <ellipse cx={width/2} cy={height-18} rx={width/2 - 6} ry={16} fill="#E7F3EA" stroke="#1F7A1F" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{fontSize:12, fill:'#1F7A1F'}}>
          {data.label || 'Data'}
        </text>
      </svg>
      <Handle type="source" position={Position.Top} id="t1" style={{ left: 12, background: '#1F7A1F' }} />
      <Handle type="source" position={Position.Right} id="r1" style={{ top: 18, background: '#1F7A1F' }} />
      <Handle type="source" position={Position.Bottom} id="b1" style={{ left: 12, background: '#1F7A1F' }} />
      <Handle type="source" position={Position.Left} id="l1" style={{ top: 18, background: '#1F7A1F' }} />
      <Handle type="target" position={Position.Top} id="tt1" style={{ right: 12 }} />
      <Handle type="target" position={Position.Right} id="tr1" style={{ bottom: 18 }} />
      <Handle type="target" position={Position.Bottom} id="tb1" style={{ right: 12 }} />
      <Handle type="target" position={Position.Left} id="tl1" style={{ bottom: 18 }} />
    </div>
  );
}
