import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  AlertTriangle, Cpu, Radio, ShieldAlert, ArrowDownRight, 
  Activity, Sparkles, CheckCircle2, Zap
} from 'lucide-react';

export const ForensicEventNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const {
    eventType,
    severity,
    timestamp,
    component,
    description,
    metricName,
    metricValue,
    metricUnit,
    isRootCauseCandidate,
    sequenceOrder
  } = data as any;

  const getSeverityColors = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: 'border-rose-500/80',
          bg: 'bg-rose-950/40',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          glow: 'shadow-rose-500/30'
        };
      case 'HIGH':
        return {
          border: 'border-amber-500/80',
          bg: 'bg-amber-950/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'shadow-amber-500/30'
        };
      case 'MEDIUM':
        return {
          border: 'border-cyan-500/60',
          bg: 'bg-cyan-950/30',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'shadow-cyan-500/20'
        };
      default:
        return {
          border: 'border-slate-600',
          bg: 'bg-slate-900/60',
          text: 'text-slate-400',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          glow: 'shadow-slate-500/10'
        };
    }
  };

  const colors = getSeverityColors(severity);

  return (
    <div
      className={`relative w-72 rounded-xl p-3.5 border transition-all duration-300 backdrop-blur-md ${
        isRootCauseCandidate
          ? 'border-purple-500 bg-[#120D24]/90 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/50'
          : selected
          ? 'border-cyan-400 bg-slate-900/90 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/50'
          : `${colors.border} ${colors.bg} shadow-md ${colors.glow}`
      }`}
    >
      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-cyan-400 border-2 border-slate-950 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 border-2 border-slate-950 rounded-full"
      />

      {/* Root Cause Candidate Banner */}
      {isRootCauseCandidate && (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold text-white shadow-md shadow-purple-500/40 uppercase tracking-wider font-mono">
          <Sparkles className="w-3 h-3" />
          <span>LIKELY ROOT CAUSE</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mt-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 text-[11px] font-mono font-bold text-slate-300 border border-slate-700">
            #{sequenceOrder}
          </span>
          <span className="text-xs font-mono font-bold text-slate-200 tracking-wide">
            {component}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${colors.badge}`}>
          {severity}
        </span>
      </div>

      {/* Timestamp & Type */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
        <span className="text-cyan-400 font-medium">{eventType}</span>
        <span>{timestamp ? timestamp.split(' ')[1] || timestamp : ''}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
        {description}
      </p>

      {/* Metric Pill if present */}
      {metricName && (
        <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono">
          <span className="text-slate-400 truncate max-w-[120px]">{metricName}:</span>
          <span className="text-cyan-300 font-bold">
            {metricValue} {metricUnit || ''}
          </span>
        </div>
      )}
    </div>
  );
});
