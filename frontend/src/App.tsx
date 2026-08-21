import React, { useState, useEffect, useCallback } from 'react';
import { useRealtime } from './realtime/useRealtime';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { LiveNetworkPage } from './pages/LiveNetworkPage';
import { IncidentsListPage } from './pages/IncidentsListPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { NetworkMapPage } from './pages/NetworkMapPage';
import { HistoricalCasesPage } from './pages/HistoricalCasesPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { ReportPage } from './pages/ReportPage';
import { SunnyAIWidget } from './components/SunnyAIWidget';
import { Incident, NetworkEvent, NetworkTopology, SystemStats, InvestigationReport } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [activeReport, setActiveReport] = useState<InvestigationReport | null>(null);

  // Core App State
  const [stats, setStats] = useState<SystemStats>({
    active_incidents: 0,
    critical_incidents: 0,
    live_events: 0,
    investigations: 0,
    components_affected: 0,
    avg_resolution_time: '18m',
  });

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recentEvents, setRecentEvents] = useState<NetworkEvent[]>([]);
  const [topology, setTopology] = useState<NetworkTopology>({
    sites: [],
    cells: [],
    nodes: [],
    links: [],
    active_alarms_by_component: {},
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentScenario, setCurrentScenario] = useState<string>('config_failure');

  // Real-Time WebSocket Hook
  const { status: connectionStatus, subscribe } = useRealtime();

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    try {
      const [statsData, incidentsData, eventsData, topologyData, simStatus] = await Promise.all([
        api.getStats(),
        api.getIncidents(),
        api.getEvents(100),
        api.getTopology(),
        api.getSimulationStatus(),
      ]);

      setStats(statsData);
      setIncidents(incidentsData);
      setRecentEvents(eventsData);
      setTopology(topologyData);
      setIsSimulating(simStatus.is_running);
      setCurrentScenario(simStatus.current_scenario);

      if (incidentsData.length > 0 && !selectedIncidentId) {
        setSelectedIncidentId(incidentsData[0].id);
      }
    } catch (err) {
      console.error('[App] Failed to load initial data:', err);
    }
  }, [selectedIncidentId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (connectionStatus === 'CONNECTED') return;
    const intervalId = window.setInterval(loadInitialData, 3000);
    return () => window.clearInterval(intervalId);
  }, [connectionStatus, loadInitialData]);

  // Subscribe to Live Real-Time Database Broadcasts
  useEffect(() => {
    // 1. Live Event Inserted
    const unsubEvent = subscribe('EVENT_INSERTED', (eventData: NetworkEvent) => {
      setRecentEvents((prev) => [eventData, ...prev.slice(0, 199)]);
      setStats((prev) => ({
        ...prev,
        live_events: prev.live_events + 1,
      }));
    });

    // 2. Incident Created or Updated by Correlation Engine
    const unsubIncident = subscribe('INCIDENT_UPDATED', (payload: any) => {
      const { incident } = payload;
      setIncidents((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === incident.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = incident;
          return updated;
        } else {
          return [incident, ...prev];
        }
      });

      // Update KPIs
      api.getStats().then(setStats).catch(console.error);

      // Auto select newly triggered incident if none selected
      if (!selectedIncidentId) {
        setSelectedIncidentId(incident.id);
      }
    });

    // 3. Simulation Status Updated
    const unsubSim = subscribe('SIMULATION_STATUS', (data: any) => {
      setIsSimulating(data.is_running);
      if (data.scenario) setCurrentScenario(data.scenario);
      if (data.completed) {
        loadInitialData();
      }
    });

    // 4. Simulation Reset
    const unsubReset = subscribe('SIMULATION_RESET', () => {
      setIsSimulating(false);
      setRecentEvents([]);
      setIncidents([]);
      loadInitialData();
    });

    return () => {
      unsubEvent();
      unsubIncident();
      unsubSim();
      unsubReset();
    };
  }, [subscribe, loadInitialData, selectedIncidentId]);

  const handleSelectIncident = (incId: string) => {
    setSelectedIncidentId(incId);
    setActiveTab('investigation');
  };

  const handleNavigateToReport = (report: InvestigationReport) => {
    setActiveReport(report);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Command Center Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        isSimulating={isSimulating}
        activeIncidentCount={incidents.filter((i) => i.status === 'INVESTIGATING').length}
        liveEventCount={recentEvents.length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <OverviewPage
            stats={stats}
            incidents={incidents}
            recentEvents={recentEvents}
            onSelectIncident={handleSelectIncident}
            onNavigateToSim={() => setActiveTab('live-network')}
          />
        )}

        {activeTab === 'live-network' && (
          <LiveNetworkPage
            events={recentEvents}
            isSimulating={isSimulating}
            currentScenario={currentScenario}
            onSimulationChange={loadInitialData}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsListPage
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
          />
        )}

        {activeTab === 'investigation' && (
          <InvestigationPage
            incidentId={selectedIncidentId || (incidents[0]?.id || '')}
            topology={topology}
            onBack={() => setActiveTab('incidents')}
            onNavigateToReport={handleNavigateToReport}
          />
        )}

        {activeTab === 'network-map' && (
          <NetworkMapPage topology={topology} />
        )}

        {activeTab === 'historical' && (
          <HistoricalCasesPage />
        )}

        {activeTab === 'data-sources' && (
          <DataSourcesPage />
        )}

        {activeTab === 'reports' && (
          <ReportPage
            report={activeReport}
            onBack={() => setActiveTab('investigation')}
          />
        )}
      </main>

      {/* Footer System Diagnostics */}
      <footer className="border-t border-slate-800/80 bg-[#070B14] py-3 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>NETWORK INVESTIGATOR • AI Digital Forensic Command Center</span>
          <div className="flex items-center gap-4">
            <span>FastAPI Core: <strong className="text-emerald-400">ONLINE</strong></span>
            <span>Real-time Engine: <strong className="text-cyan-400">ACTIVE</strong></span>
            <span>PostgreSQL / SQLite: <strong className="text-purple-400">SYNCHRONIZED</strong></span>
          </div>
        </div>
      </footer>

      {/* Floating Sunny AI Project Assistant Widget */}
      <SunnyAIWidget />
    </div>
  );
}

export default App;
