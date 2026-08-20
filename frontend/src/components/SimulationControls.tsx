import React, { useState } from 'react';
import { 
  Play, Square, RotateCcw, Zap, PlusCircle, 
  Settings2, Activity, Radio, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

interface SimulationControlsProps {
  isSimulating: boolean;
  currentScenario: string;
  onSimulationChange?: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  currentScenario,
  onSimulationChange,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>(currentScenario || 'config_failure');
  const [speed, setSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState(false);
  const [showInjectModal, setShowInjectModal] = useState(false);

  // Manual event injector state
  const [customEventType, setCustomEventType] = useState('CPU_SPIKE');
  const [customComponent, setCustomComponent] = useState('CELL-A17');
  const [customSeverity, setCustomSeverity] = useState('HIGH');
  const [customDesc, setCustomDesc] = useState('Manual telemetry anomaly injected by operator');
  const [customMetricName, setCustomMetricName] = useState('CPU_UTILIZATION');
  const [customMetricVal, setCustomMetricVal] = useState(94.2);

  const scenarios = [
    {
      id: 'config_failure',
      title: 'Incident 1: Configuration Failure (Cell A17)',
      desc: 'MIMO antenna tilt & power push -> CPU spike -> packet loss -> handover drops',
      trigger: 'CONFIG_CHANGE on CELL-A17',
      severity: 'CRITICAL',
    },
    {
      id: 'traffic_surge',
      title: 'Incident 2: Traffic Surge & Congestion (Market St)',
      desc: 'Flash crowd event -> 380% throughput -> BBU queue saturation -> packet drop',
      trigger: 'TRAFFIC_SURGE on CELL-E21',
      severity: 'HIGH',
    },
    {
      id: 'router_failure',
      title: 'Incident 3: Core Router Trunk Failure (Router-A)',
      desc: 'Optical loss of signal -> BGP flap -> failover overload -> voice drops',
      trigger: 'ROUTER_FAIL on ROUTER-A',
      severity: 'CRITICAL',
    },
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulation(selectedScenario, speed);
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopSimulation();
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetSimulation();
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectManualEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.ingestEvent({
        event_type: customEventType,
        network_component: customComponent,
        severity: customSeverity as any,
        description: customDesc,
        metric_name: customMetricName,
        metric_value: customMetricVal,
        source: 'OPERATOR_MANUAL_INJECT',
      });
      setShowInjectModal(false);
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-[#0A0F1D]/90 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
              Live Network Crisis Simulator & Ingestion
            </h3>
            <p className="text-xs text-slate-400">
              Real-time asynchronous event generator writing directly to PostgreSQL / SQLite
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isSimulating ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <Square className="w-4 h-4 fill-slate-950" />
              <span>STOP SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all animate-pulse"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START LIVE SIMULATION</span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset Events & Incidents"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-mono text-xs transition-all shadow-md shadow-purple-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inject Custom Event</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => !isSimulating && setSelectedScenario(sc.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
              } ${isSimulating ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs text-slate-200">
                  {sc.title}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {sc.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2 font-sans">
                {sc.desc}
              </p>
              <div className="text-[10px] font-mono text-cyan-400">
                Trigger: {sc.trigger}
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed Multiplier & Live Feed Hint */}
      <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Simulation Ingestion Speed:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                disabled={isSimulating}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  speed === s
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Realtime DB events will trigger AI correlation automatically</span>
        </div>
      </div>

      {/* Manual Event Injection Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-cyan-500/40 bg-[#090D18] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                Inject Custom Telemetry Event
              </h4>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInjectManualEvent} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Event Type:</label>
                <select
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                >
                  <option value="CONFIG_CHANGE">CONFIG_CHANGE (RF Push)</option>
                  <option value="CPU_SPIKE">CPU_SPIKE (Processor Spike)</option>
                  <option value="PACKET_LOSS">PACKET_LOSS (PDCP Discard)</option>
                  <option value="LATENCY_INCREASE">LATENCY_INCREASE (RTT Spike)</option>
                  <option value="HANDOVER_FAILURE">HANDOVER_FAILURE (X2/Xn Drop)</option>
                  <option value="CALL_DROP_SURGE">CALL_DROP_SURGE (Call Drops)</option>
                  <option value="ROUTER_FAIL">ROUTER_FAIL (Optic LOS)</option>
                  <option value="TRAFFIC_SURGE">TRAFFIC_SURGE (Flash Crowd)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Component ID:</label>
                  <input
                    type="text"
                    value={customComponent}
                    onChange={(e) => setCustomComponent(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Severity:</label>
                  <select
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description:</label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Metric Name:</label>
                  <input
                    type="text"
                    value={customMetricName}
                    onChange={(e) => setCustomMetricName(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Metric Value:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customMetricVal}
                    onChange={(e) => setCustomMetricVal(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Inject Event Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
