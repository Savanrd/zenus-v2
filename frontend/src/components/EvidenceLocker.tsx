import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldX, Clock, Cpu, FileCheck, 
  ExternalLink, Sparkles, Filter, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Evidence } from '../types';

interface EvidenceLockerProps {
  evidenceList: Evidence[];
  onSelectEvidence?: (evidence: Evidence) => void;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  evidenceList,
  onSelectEvidence,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SUPPORTING' | 'CONTRADICTING'>('ALL');

  const filteredEvidence = evidenceList.filter((e) => {
    if (filter === 'ALL') return true;
    return e.direction === filter;
  });

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'VERY_HIGH':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'HIGH':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
            Forensic Evidence Locker ({evidenceList.length})
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-0.5 rounded transition-all ${
              filter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            All ({evidenceList.length})
          </button>
          <button
            onClick={() => setFilter('SUPPORTING')}
            className={`px-2.5 py-0.5 rounded transition-all ${
              filter === 'SUPPORTING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
            }`}
          >
            Supporting ({evidenceList.filter((e) => e.direction === 'SUPPORTING').length})
          </button>
          <button
            onClick={() => setFilter('CONTRADICTING')}
            className={`px-2.5 py-0.5 rounded transition-all ${
              filter === 'CONTRADICTING' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
            }`}
          >
            Contradicting ({evidenceList.filter((e) => e.direction === 'CONTRADICTING').length})
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredEvidence.map((item) => {
          const isSupporting = item.direction === 'SUPPORTING';

          return (
            <div
              key={item.id}
              onClick={() => onSelectEvidence && onSelectEvidence(item)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSupporting
                  ? 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/90'
                  : 'border-rose-950/60 bg-rose-950/20 hover:border-rose-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isSupporting ? (
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <ShieldX className="w-4 h-4" />
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {item.evidence_type.replace('_', ' ')}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStrengthBadge(item.strength)}`}>
                    STRENGTH: {item.strength} ({Math.round(item.strength_score * 100)}%)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                  {item.description}
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {item.source_component && (
                    <span className="text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.source_component}
                    </span>
                  )}
                  {item.timestamp && (
                    <span>{item.timestamp.split(' ')[1] || item.timestamp}</span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                  <span>Inspect</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
