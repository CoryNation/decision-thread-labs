'use client';
import { Handle, Position } from 'reactflow';

export default function GatewayNode({ data, selected }: any) {
  const size = 120;
  const color = '#D4AF37';
  return (
    <div style={{ width: size, height: size }} className={selected ? 'ring-2 ring-[#20B2AA] rounded-md' : 'rounded-md'}>
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="absolute"
          style={{ width: size * 0.8, height: size * 0.8, background: color, transform: 'rotate(45deg)',
                   boxShadow: selected ? '0 10px 18px rgba(0,0,0,0.25)' : '0 4px 10px rgba(0,0,0,0.12)' }}
        />
        <div className="relative text-sm font-medium select-none">{data.label || 'Gateway'}</div>
      </div>
      <Handle type="source" position={Position.Top}    id="top"    style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="source" position={Position.Right}  id="right"  style={{ top: '50%', transform:'translateY(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="source" position={Position.Left}   id="left"   style={{ top: '50%', transform:'translateY(-50%)' }} />
      <Handle type="target" position={Position.Top}    id="ttop"    style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="target" position={Position.Right}  id="tright"  style={{ top: '50%', transform:'translateY(-50%)' }} />
      <Handle type="target" position={Position.Bottom} id="tbottom" style={{ left: '50%', transform:'translateX(-50%)' }} />
      <Handle type="target" position={Position.Left}   id="tleft"   style={{ top: '50%', transform:'translateY(-50%)' }} />
    </div>
  );
}
