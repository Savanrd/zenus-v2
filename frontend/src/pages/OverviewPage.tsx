import React from 'react';
import { 
  ShieldAlert, Radio, Activity, Cpu, Network, CheckCircle2, 
  AlertTriangle, Clock, ArrowUpRight, Zap, Sparkles, Server
} from 'lucide-react';
import { Incident, NetworkEvent, SystemStats } from '../types';

interface OverviewPageProps {
  stats: SystemStats;
  incidents: Incident[];
  recentEvents: NetworkEvent[];
  onSelectIncident: (incId: string) => void;
  onNavigateToSim: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  incidents,
  recentEvents,
  onSelectIncident,
  onNavigateToSim,
}) => {
  const activeIncidents = incidents.filter((i) => i.status in { INVESTIGATING: true, CONFIRMED: true });
  const primaryIncident = activeIncidents.length > 0 ? activeIncidents[0] : incidents[0];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Simulation Launch */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#0C1322] via-[#10182E] to-[#160D2A] border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI TELECOM DIGITAL FORENSIC ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Don't just detect the failure. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Reconstruct it.</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Autonomous real-time event correlation, chronological timeline replay, multi-hypothesis causal reasoning, and verified evidence trails for telecom operations.
            </p>
          </div>

          <button
            onClick={onNavigateToSim}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>START LIVE CRISIS SIMULATION</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            label: 'Active Incidents',
            value: stats.active_incidents,
            icon: ShieldAlert,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
          },
          {
            label: 'Critical Priority',
            value: stats.critical_incidents,
            icon: AlertTriangle,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/30',
          },
          {
            label: 'Live Events Correlated',
            value: stats.live_events.toLocaleString(),
            icon: Activity,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/30',
          },
          {
            label: 'Forensic Dossiers',
            value: stats.investigations,
            icon: Cpu,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
          },
          {
            label: 'Affected Components',
            value: stats.components_affected,
            icon: Server,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
          },
          {
            label: 'Avg Resolution Time',
            value: stats.avg_resolution_time,
            icon: Clock,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl glass-panel border ${kpi.border} bg-[#0A0F1D]/80 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-mono font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Primary Active Forensic Investigation + Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Active Forensic Case Highlight */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Active Incident Forensic Breakdown
            </h3>
            {primaryIncident && (
              <span className="text-xs font-mono text-cyan-400">
                Incident #{primaryIncident.incident_number}
              </span>
            )}
          </div>

          {primaryIncident ? (
            <div className="p-6 rounded-2xl glass-panel border border-purple-500/30 bg-[#0C0F1E] space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    primaryIncident.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {primaryIncident.severity} SEVERITY
                  </span>
                  <h4 className="text-base font-bold text-slate-100 mt-2 font-mono">
                    {primaryIncident.title}
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-slate-400">AI CONFIDENCE:</div>
                  <div className="text-lg font-mono font-extrabold text-purple-400">
                    {Math.round((primaryIncident.root_cause_confidence || 0.88) * 100)}% ({primaryIncident.confidence_tier || 'VERY_HIGH'})
                  </div>
                </div>
              </div>

              {/* Root cause callout */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
                <div className="text-purple-300 font-mono font-bold uppercase text-[10px] mb-1">
                  AI Forensic Root Cause Determination:
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {primaryIncident.root_cause || primaryIncident.summary}
                </p>
              </div>

              {/* Five Core Forensic Questions Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WHAT?</span>
                  <span className="text-slate-200 font-bold">RAN QoS Cascade</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WHEN?</span>
                  <span className="text-slate-200 font-bold">{primaryIncident.start_time?.split(' ')[1] || '10:31:04'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WHERE?</span>
                  <span className="text-cyan-400 font-bold">{primaryIncident.origin_component || 'CELL-A17'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">HOW SURE?</span>
                  <span className="text-purple-300 font-bold">{Math.round((primaryIncident.root_cause_confidence || 0.88)*100)}% Proven</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onSelectIncident(primaryIncident.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                >
                  <span>Open Full Investigation Dossier</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 font-mono text-sm">
              No active incidents detected. Start live simulation to trigger crisis scenario.
            </div>
          )}
        </div>

        {/* Right 5 cols: Live Realtime Event Ingestion Ticker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Real-Time Event Stream
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {recentEvents.length} events logged
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] max-h-[460px] overflow-y-auto space-y-2">
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-200">
                      {ev.network_component}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {ev.event_type}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-[11px] line-clamp-2">
                    {ev.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold block mb-1 ${
                    ev.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : ev.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {ev.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {ev.timestamp ? ev.timestamp.split(' ')[1] || ev.timestamp : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
