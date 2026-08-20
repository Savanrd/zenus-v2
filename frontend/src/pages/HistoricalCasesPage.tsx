import React, { useState, useEffect } from 'react';
import { History, Sparkles, Search, CheckCircle2, Clock, Cpu, ArrowUpRight, BookOpen } from 'lucide-react';

export const HistoricalCasesPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([
    {
      id: 'HIST-2025-0412',
      incident_number: 'INC-HIST-0412',
      title: 'MIMO Beamforming Parameter Configuration Mismatch',
      category: 'CONFIGURATION',
      root_cause: 'Configuration push with erroneous antenna tilt and power profile',
      similarity_percent: 94,
      symptoms: [
        'CPU utilization spike > 90%',
        'Handover failure increase > 40%',
        'RRC connection drop rate surge',
        'Adjacent cell traffic overload'
      ],
      affected_components: ['CELL-A17', 'CELL-B12', 'ROUTER-A'],
      resolution: 'Rollback RAN configuration commit v4.12.2 to stable baseline v4.12.1; re-initialize BBU pool',
      resolution_time_minutes: 18,
      lessons_learned: 'Automated CI/CD schema pre-validation required before pushing active sector RF parameters.',
      occurred_at: '2025-04-12 14:22:00'
    },
    {
      id: 'HIST-2025-0903',
      incident_number: 'INC-HIST-0903',
      title: 'Concert Venue Traffic Surge Buffer Exhaustion',
      category: 'TRAFFIC_SURGE',
      root_cause: 'Flash crowd traffic surge exceeding cell capacity threshold',
      similarity_percent: 91,
      symptoms: [
        'Throughput saturation 98%',
        'Packet latency spike > 180ms',
        'Buffer queue drops',
        'High downlink packet loss'
      ],
      affected_components: ['CELL-E21', 'CELL-D09', 'ROUTER-NORTH-01'],
      resolution: 'Dynamic load balancing activated; carrier aggregation expanded with temporary 40MHz carrier allocation',
      resolution_time_minutes: 25,
      lessons_learned: 'Implement automated admission control and dynamic bandwidth throttling during known metropolitan events.',
      occurred_at: '2025-09-03 20:15:00'
    },
    {
      id: 'HIST-2025-1118',
      incident_number: 'INC-HIST-1118',
      title: 'Core Edge Router Interface BGP Flapping',
      category: 'HARDWARE_FAILURE',
      root_cause: 'BGP keepalive timeout due to optic transceiver degradation on trunk link',
      similarity_percent: 93,
      symptoms: [
        'BGP neighbor state reset',
        'Sub-second traffic reroute cascade',
        'Neighboring router interface overload',
        'Voice handover failure rate surge'
      ],
      affected_components: ['ROUTER-A', 'CORE-NODE-01', 'CELL-A17', 'CELL-B12'],
      resolution: 'Replaced faulty SFP28 25G optical transceiver on Port xe-0/1/4 and stabilized BGP dampening',
      resolution_time_minutes: 32,
      lessons_learned: 'Proactive optical power telemetry monitoring (DOM/DDM) should trigger maintenance before loss of signal.',
      occurred_at: '2025-11-18 09:40:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter((c) => 
    searchTerm === '' ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.root_cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wider">
              Historical Incident Knowledge Base & Playbook Library
            </h2>
            <p className="text-xs text-slate-400">
              Resolved case signatures used for similarity scoring and root cause pattern recognition
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {filteredCases.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl glass-panel border border-slate-800/80 bg-[#0A0E1C] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  {item.category}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {item.occurred_at}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 font-mono">
                {item.title}
              </h3>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 block text-[10px]">HISTORICAL ROOT CAUSE:</span>
                <span className="text-cyan-300 font-bold">{item.root_cause}</span>
              </div>

              {/* Observed Symptoms Checklist */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Observed Symptom Signatures:
                </span>
                <ul className="space-y-1">
                  {item.symptoms.map((s: string, idx: number) => (
                    <li key={idx} className="text-xs font-mono text-slate-300 flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Resolution */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                <span className="text-emerald-400 font-mono font-bold block text-[10px] uppercase mb-1">
                  Verified Playbook Resolution ({item.resolution_time_minutes}m):
                </span>
                <p className="text-slate-200 font-sans leading-relaxed text-xs">
                  {item.resolution}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Post-Mortem: </span>
              <span className="text-slate-300 font-sans">{item.lessons_learned}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
