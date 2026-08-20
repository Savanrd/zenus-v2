import React, { useState, useMemo } from 'react';
import { 
  Radio, Filter, Search, ShieldAlert, Cpu, 
  Activity, ArrowDownRight, Sparkles, RefreshCw
} from 'lucide-react';
import { NetworkEvent } from '../types';
import { SimulationControls } from '../components/SimulationControls';

interface LiveNetworkPageProps {
  events: NetworkEvent[];
  isSimulating: boolean;
  currentScenario: string;
  onSimulationChange?: () => void;
}

export const LiveNetworkPage: React.FC<LiveNetworkPageProps> = ({
  events,
  isSimulating,
  currentScenario,
  onSimulationChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [componentFilter, setComponentFilter] = useState('ALL');

  const componentsList = useMemo(() => {
    const set = new Set(events.map((e) => e.network_component).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        searchTerm === '' ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.network_component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.event_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSev = severityFilter === 'ALL' || ev.severity === severityFilter;
      const matchComp = componentFilter === 'ALL' || ev.network_component === componentFilter;

      return matchSearch && matchSev && matchComp;
    });
  }, [events, searchTerm, severityFilter, componentFilter]);

  return (
    <div className="space-y-6">
      {/* Simulation Master Control Console */}
      <SimulationControls
        isSimulating={isSimulating}
        currentScenario={currentScenario}
        onSimulationChange={onSimulationChange}
      />

      {/* Live Event Stream Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
              Live Network Event Telemetry Ingestion ({filteredEvents.length})
            </h3>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search event, comp, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="INFO">Info</option>
            </select>

            {/* Component Filter */}
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              {componentsList.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Components' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Metric Value</th>
                <th className="py-2.5 px-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-slate-900/60 transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : ev.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400 whitespace-nowrap">
                    {ev.network_component}
                  </td>
                  <td className="py-2.5 px-3 text-purple-300 whitespace-nowrap">
                    {ev.event_type}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 min-w-[280px]">
                    {ev.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                    {ev.metric_name ? (
                      <span className="text-cyan-300 font-bold">
                        {ev.metric_value} {ev.metric_unit || ''}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px] whitespace-nowrap">
                    {ev.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
