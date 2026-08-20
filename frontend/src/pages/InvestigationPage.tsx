import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, Route, FileText, Bot, 
  Layers, CheckSquare, Clock, ArrowLeft, RefreshCw, 
  ExternalLink, Zap, Network, Radio, HelpCircle, Activity
} from 'lucide-react';
import { Incident, NetworkTopology, InvestigationReport } from '../types';
import { api } from '../services/api';
import { ForensicIncidentGraph } from '../graph/ForensicIncidentGraph';
import { ReplayTimeline } from '../timeline/ReplayTimeline';
import { EvidenceLocker } from '../components/EvidenceLocker';
import { HypothesisMatrix } from '../components/HypothesisMatrix';
import { TopologyMap } from '../network-map/TopologyMap';
import { AIInvestigatorChat } from '../components/AIInvestigatorChat';

interface InvestigationPageProps {
  incidentId: string;
  topology: NetworkTopology;
  onBack: () => void;
  onNavigateToReport: (report: InvestigationReport) => void;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  incidentId,
  topology,
  onBack,
  onNavigateToReport,
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'evidence' | 'hypotheses' | 'propagation' | 'chat' | 'remediation'>('graph');
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [highlightedComponent, setHighlightedComponent] = useState<string>('CELL-A17');

  const fetchIncidentData = async () => {
    try {
      setLoading(true);
      const incData = await api.getIncident(incidentId);
      setIncident(incData);
      if (incData.origin_component) {
        setHighlightedComponent(incData.origin_component);
      }

      const graph = await api.getIncidentGraph(incidentId);
      setGraphData(graph);
    } catch (err) {
      console.error('Failed to load incident investigation details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      fetchIncidentData();
    }
  }, [incidentId]);

  const handleReAnalyze = async () => {
    try {
      setAnalyzing(true);
      await api.triggerInvestigation(incidentId);
      await fetchIncidentData();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await api.generateReport(incidentId);
      onNavigateToReport(report);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !incident) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-sm space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
        <p>Reconstructing incident forensic graph and telemetry records...</p>
      </div>
    );
  }

  const confPercent = Math.round((incident.root_cause_confidence || 0.88) * 100);
  const events = incident.events || [];
  const hypotheses = incident.hypotheses || [];
  const evidence = incident.evidence || [];
  const propagationPath = incident.propagation_path || [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-mono transition-all shadow-md shadow-purple-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>Re-run AI Forensic Engine</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Investigation Report</span>
          </button>
        </div>
      </div>

      {/* Incident Forensic Overview Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 bg-[#090D1A] shadow-2xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {incident.incident_number}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                incident.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {incident.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                {incident.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono">
              {incident.title}
            </h2>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">AI CONFIDENCE LEVEL:</div>
            <div className="text-2xl font-mono font-black text-purple-400">
              {confPercent}%
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
              {incident.confidence_tier || 'VERY_HIGH'}
            </span>
          </div>
        </div>

        {/* Primary Forensic Answer Box */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-xs uppercase">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Most Likely Root Cause Diagnosis:</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-sans">
            {incident.root_cause || incident.summary}
          </p>
        </div>

        {/* 5 Core Forensic Pillars Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">1. WHAT?</span>
            <span className="text-slate-200 font-bold truncate block">{incident.title}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">2. WHEN?</span>
            <span className="text-slate-200 font-bold">{incident.start_time?.split(' ')[1] || '10:31:04'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">3. WHERE?</span>
            <span className="text-cyan-400 font-bold">{incident.origin_component || 'CELL-A17'} ({incident.region})</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">4. WHY?</span>
            <span className="text-purple-300 font-bold truncate block">{incident.root_cause?.slice(0, 35)}...</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">5. HOW SURE?</span>
            <span className="text-emerald-400 font-bold">{confPercent}% ({evidence.length} Evidences)</span>
          </div>
        </div>
      </div>

      {/* Forensic Investigation Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] text-xs font-mono">
        {[
          { id: 'graph', label: 'Incident Graph (React Flow)', icon: Layers, count: events.length },
          { id: 'timeline', label: 'Timeline Replay (Scrubber)', icon: Clock, count: events.length },
          { id: 'evidence', label: 'Evidence Locker', icon: FileText, count: evidence.length },
          { id: 'hypotheses', label: 'Multi-Hypothesis Arena', icon: Sparkles, count: hypotheses.length },
          { id: 'propagation', label: 'Topology & Blast Radius', icon: Network },
          { id: 'chat', label: 'AI Investigator Chat', icon: Bot },
          { id: 'remediation', label: 'Actionable Playbook', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Viewport */}
      <div>
        {activeTab === 'graph' && (
          <ForensicIncidentGraph
            initialNodes={graphData.nodes}
            initialEdges={graphData.edges}
          />
        )}

        {activeTab === 'timeline' && (
          <ReplayTimeline events={events} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLocker evidenceList={evidence} />
        )}

        {activeTab === 'hypotheses' && (
          <HypothesisMatrix hypotheses={hypotheses} />
        )}

        {activeTab === 'propagation' && (
          <div className="space-y-4">
            <TopologyMap
              topology={topology}
              highlightComponent={incident.origin_component || 'CELL-A17'}
              propagationPath={propagationPath}
              investigationMode={true}
            />

            {/* Propagation Steps Table */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Route className="w-4 h-4 text-cyan-400" />
                Verified Propagation Path Sequence
              </h4>
              <div className="space-y-2">
                {propagationPath.map((step) => (
                  <div
                    key={step.step_number}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold">
                        {step.step_number}
                      </span>
                      <span className="font-bold text-slate-100">{step.component}</span>
                      <span className="text-purple-300 text-[11px]">{step.event_type}</span>
                    </div>
                    <span className="text-slate-300 font-sans">{step.description}</span>
                    <span className="text-cyan-400">{step.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <AIInvestigatorChat
            incidentId={incident.id}
            incidentNumber={incident.incident_number}
          />
        )}

        {activeTab === 'remediation' && (
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                  Recommended Engineer Remediation Actions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                AI-Generated Recommendations — Engineer Validation Required
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                `1. Immediate Rollback: Revert configuration change on ${incident.origin_component || 'CELL-A17'} to baseline rev v4.12.1.`,
                `2. Monitor Telemetry: Check Baseband CPU utilization and confirm drop below 20%.`,
                `3. Handover Rate Validation: Audit neighboring sectors (CELL-B12, CELL-C04) for handover recovery >98.5%.`,
                `4. Customer QoS Verification: Verify RRC call drop rate normalizes below 0.5%.`,
                `5. Automated CI/CD Safeguard: Enforce static RF parameter linting schema in RAN orchestrator before future pushes.`
              ].map((act, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 text-slate-200"
                >
                  <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-relaxed font-sans text-xs">{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
