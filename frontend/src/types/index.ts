export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type IncidentStatus = 'INVESTIGATING' | 'CONFIRMED' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
export type ConfidenceTier = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface NetworkEvent {
  id: string;
  event_type: string;
  severity: Severity;
  timestamp: string;
  site_id?: string;
  cell_id?: string;
  network_component: string;
  description: string;
  metric_name?: string;
  metric_value?: number;
  metric_unit?: string;
  source: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface IncidentEventRel {
  id: string;
  incident_id: string;
  event_id: string;
  relationship_type: string;
  correlation_score: number;
  sequence_order: number;
  causal_explanation?: string;
  event?: NetworkEvent;
}

export interface Hypothesis {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  confidence: number;
  confidence_tier: ConfidenceTier;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  status: 'PRIMARY_CANDIDATE' | 'PLAUSIBLE_ALTERNATIVE' | 'RULED_OUT';
  reasoning?: string;
}

export interface Evidence {
  id: string;
  incident_id: string;
  event_id?: string;
  evidence_type: string;
  description: string;
  strength: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  strength_score: number;
  direction: 'SUPPORTING' | 'CONTRADICTING';
  source_component?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface PropagationStep {
  step_number: number;
  component: string;
  component_type: string;
  event_type: string;
  timestamp: string;
  description: string;
  impact_level: string;
  correlation_score: number;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  start_time: string;
  end_time?: string;
  region: string;
  origin_component?: string;
  root_cause?: string;
  root_cause_confidence: number;
  confidence_tier: ConfidenceTier;
  summary?: string;
  propagation_path: PropagationStep[];
  created_at?: string;
  updated_at?: string;
  events?: NetworkEvent[];
  incident_events?: IncidentEventRel[];
  hypotheses?: Hypothesis[];
  evidence?: Evidence[];
}

export interface NetworkSite {
  id: string;
  site_name: string;
  region: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface NetworkCell {
  id: string;
  site_id: string;
  cell_name: string;
  technology: string;
  frequency_band: string;
  azimuth: number;
  status: string;
  latitude: number;
  longitude: number;
  neighbor_cell_ids: string[];
}

export interface NetworkNode {
  id: string;
  site_id?: string;
  node_name: string;
  node_type: string;
  ip_address: string;
  status: string;
  connected_node_ids: string[];
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  link_type: string;
  bandwidth_gbps: number;
  status: string;
}

export interface NetworkTopology {
  sites: NetworkSite[];
  cells: NetworkCell[];
  nodes: NetworkNode[];
  links: TopologyLink[];
  active_alarms_by_component: Record<string, { critical: number; high: number; medium: number; total: number }>;
}

export interface SystemStats {
  active_incidents: number;
  critical_incidents: number;
  live_events: number;
  investigations: number;
  components_affected: number;
  avg_resolution_time: string;
}

export interface HistoricalMatch {
  id: string;
  incident_number: string;
  title: string;
  similarity_score: number;
  similarity_percent: number;
  category: string;
  root_cause: string;
  shared_symptoms: string[];
  previous_resolution: string;
  occurred_at: string;
}

export interface InvestigationReport {
  report_id: string;
  incident_number: string;
  title: string;
  generated_at: string;
  generated_by: string;
  executive_summary: string;
  severity: string;
  status: string;
  duration_str: string;
  start_time: string;
  end_time?: string;
  region: string;
  origin_component: string;
  affected_components: string[];
  root_cause: string;
  confidence: number;
  confidence_tier: string;
  reasoning: string;
  supporting_evidence: Evidence[];
  contradicting_evidence: Evidence[];
  hypotheses: Hypothesis[];
  propagation_path: PropagationStep[];
  timeline_events: NetworkEvent[];
  recommended_actions: string[];
  historical_matches: HistoricalMatch[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  citations?: any[];
}
