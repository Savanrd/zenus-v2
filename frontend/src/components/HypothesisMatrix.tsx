import React from 'react';
import { Sparkles, HelpCircle, Check, X, ShieldAlert, Cpu, ChevronRight } from 'lucide-react';
import { Hypothesis } from '../types';

interface HypothesisMatrixProps {
  hypotheses: Hypothesis[];
}

export const HypothesisMatrix: React.FC<HypothesisMatrixProps> = ({ hypotheses }) => {
  const getConfidenceColors = (confidence: number) => {
    if (confidence >= 0.85) {
      return {
        bar: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        glow: 'border-purple-500/50 bg-purple-950/20'
      };
    } else if (confidence >= 0.70) {
      return {
        bar: 'bg-cyan-500',
        text: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        glow: 'border-cyan-500/40 bg-cyan-950/20'
      };
    } else if (confidence >= 0.40) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        glow: 'border-amber-500/40 bg-amber-950/20'
      };
    } else {
      return {
        bar: 'bg-slate-600',
        text: 'text-slate-400',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        glow: 'border-slate-800 bg-slate-950/40 opacity-70'
      };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
            Multi-Hypothesis Reasoning Arena ({hypotheses.length})
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Ranked by Probabilistic Causal Weight
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hypotheses.map((h, idx) => {
          const colors = getConfidenceColors(h.confidence);
          const percent = Math.round(h.confidence * 100);
          const isPrimary = h.status === 'PRIMARY_CANDIDATE';

          return (
            <div
              key={h.id || idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${colors.glow} ${
                isPrimary ? 'ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' : ''
              }`}
            >
              <div>
                {/* Hypothesis Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${colors.badge}`}>
                    {h.status.replace('_', ' ')}
                  </span>
                  <span className={`text-sm font-mono font-extrabold ${colors.text}`}>
                    {percent}% Likelihood
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-2 font-mono">
                  {h.title}
                </h4>

                {/* Likelihood Meter */}
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-3">
                  <div
                    className={`h-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Reasoning description */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                  {h.description || h.reasoning}
                </p>

                {/* Supporting points checklist */}
                {h.supporting_evidence && h.supporting_evidence.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Supporting Telemetry:
                    </span>
                    <ul className="space-y-1 pl-1">
                      {h.supporting_evidence.map((point, pIdx) => (
                        <li key={pIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 font-mono">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contradicting points checklist */}
                {h.contradicting_evidence && h.contradicting_evidence.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1">
                      <X className="w-3 h-3" /> Contradicting Telemetry:
                    </span>
                    <ul className="space-y-1 pl-1">
                      {h.contradicting_evidence.map((point, pIdx) => (
                        <li key={pIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5 font-mono">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Tier Tag */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Confidence Tier:</span>
                <span className={`font-bold ${colors.text}`}>{h.confidence_tier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
