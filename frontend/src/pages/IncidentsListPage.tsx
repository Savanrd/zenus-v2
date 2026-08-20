import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Search, Filter, Clock, ArrowUpRight, 
  CheckCircle2, AlertTriangle, Cpu, Sparkles, RefreshCw
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentsListPageProps {
  incidents: Incident[];
  onSelectIncident: (incidentId: string) => void;
}

export const IncidentsListPage: React.FC<IncidentsListPageProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const regions = useMemo(() => {
    const set = new Set(incidents.map((i) => i.region).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        searchTerm === '' ||
        inc.incident_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inc.root_cause && inc.root_cause.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inc.origin_component && inc.origin_component.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSev = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchReg = regionFilter === 'ALL' || inc.region === regionFilter;

      return matchSearch && matchSev && matchStatus && matchReg;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter, regionFilter]);

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
              Telecom Incident Registry ({filteredIncidents.length})
            </h3>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search incident, root cause..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Region */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All Regions' : r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Incident Number</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3">Origin Component</th>
                <th className="py-3 px-3">Root Cause Diagnosis</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3">Start Time</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((inc) => {
                const confPercent = Math.round((inc.root_cause_confidence || 0.85) * 100);

                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-slate-900/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-bold text-cyan-400 whitespace-nowrap">
                      {inc.incident_number}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {inc.region}
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-300 whitespace-nowrap">
                      {inc.origin_component || 'CELL-A17'}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200 min-w-[260px]">
                      {inc.root_cause || inc.title}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-purple-400">
                        {confPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({inc.confidence_tier || 'VERY_HIGH'})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {inc.start_time?.split(' ')[1] || inc.start_time}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-400 border border-slate-800 transition-all"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
