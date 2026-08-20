import { NetworkEvent, Incident, NetworkTopology, SystemStats, InvestigationReport, AIChatMessage } from '../types';

const API_BASE = '/api';

export const api = {
  // Events
  async getEvents(limit: number = 100, severity?: string, component?: string): Promise<NetworkEvent[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (severity) params.append('severity', severity);
    if (component) params.append('component', component);
    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async ingestEvent(event: Partial<NetworkEvent>): Promise<any> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to ingest event');
    return res.json();
  },

  // Incidents
  async getIncidents(severity?: string, status?: string, region?: string): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    if (region) params.append('region', region);
    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async triggerInvestigation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${id}/investigate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run investigation');
    return res.json();
  },

  async getIncidentGraph(id: string): Promise<{ nodes: any[]; edges: any[] }> {
    const res = await fetch(`${API_BASE}/incidents/${id}/graph`);
    if (!res.ok) throw new Error('Failed to fetch graph');
    return res.json();
  },

  // Network Topology
  async getTopology(): Promise<NetworkTopology> {
    const res = await fetch(`${API_BASE}/network/topology`);
    if (!res.ok) throw new Error('Failed to fetch topology');
    return res.json();
  },

  // Stats
  async getStats(): Promise<SystemStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Simulation Controls
  async startSimulation(scenarioId: string = 'config_failure', speed: number = 1.0): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId, speed }),
    });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async stopSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/stop`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to stop simulation');
    return res.json();
  },

  async resetSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async getSimulationStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/status`);
    if (!res.ok) throw new Error('Failed to get simulation status');
    return res.json();
  },

  // AI Chat
  async chatWithAI(query: string, incidentId?: string, history: AIChatMessage[] = []): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, incident_id: incidentId, history }),
    });
    if (!res.ok) throw new Error('Failed to communicate with AI investigator');
    return res.json();
  },

  // Sunny RAG Project Guide
  async chatWithSunny(query: string): Promise<{ answer: string; citations: string[]; is_project_related: boolean }> {
    const res = await fetch(`${API_BASE}/ai/sunny`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to communicate with Sunny AI');
    return res.json();
  },

  // Reports
  async generateReport(incidentId: string): Promise<InvestigationReport> {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId }),
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  // Data Sources
  async getDataSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/data/sources`);
    if (!res.ok) throw new Error('Failed to fetch data sources');
    return res.json();
  },

  async uploadData(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  },
};
