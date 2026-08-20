-- ============================================================================
-- NETWORK INVESTIGATOR: AI-POWERED TELECOM INCIDENT INVESTIGATION SCHEMA
-- Compatible with PostgreSQL (Supabase) and SQLite
-- ============================================================================

-- Drop tables if re-initializing
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS hypotheses;
DROP TABLE IF EXISTS incident_events;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS network_events;
DROP TABLE IF EXISTS network_nodes;
DROP TABLE IF EXISTS network_cells;
DROP TABLE IF EXISTS network_sites;
DROP TABLE IF EXISTS historical_incidents;
DROP TABLE IF EXISTS users;

-- 1. Users / Operators
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(64) DEFAULT 'FORENSIC_ENGINEER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Network Sites (Physical Towers / Datacenters)
CREATE TABLE network_sites (
    id VARCHAR(64) PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    region VARCHAR(128) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    status VARCHAR(64) DEFAULT 'HEALTHY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Network Cells (5G gNodeB / 4G eNodeB Antennas / Sectors)
CREATE TABLE network_cells (
    id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL,
    cell_name VARCHAR(255) NOT NULL,
    technology VARCHAR(64) DEFAULT '5G NR',
    frequency_band VARCHAR(64) DEFAULT 'n78 (3.5GHz)',
    azimuth INT DEFAULT 0,
    status VARCHAR(64) DEFAULT 'HEALTHY',
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    neighbor_cell_ids TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES network_sites(id) ON DELETE CASCADE
);

-- 4. Network Nodes & Core Infrastructure (Edge Routers, Core Switches, UPF/AMF)
CREATE TABLE network_nodes (
    id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64),
    node_name VARCHAR(255) NOT NULL,
    node_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    status VARCHAR(64) DEFAULT 'HEALTHY',
    connected_node_ids TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES network_sites(id) ON DELETE SET NULL
);

-- 5. Network Events (Alarms, Telemetry Spikes, Logs, Protocol Traps)
CREATE TABLE network_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(128) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    site_id VARCHAR(64),
    cell_id VARCHAR(64),
    network_component VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    metric_name VARCHAR(128),
    metric_value FLOAT,
    metric_unit VARCHAR(32),
    source VARCHAR(128) DEFAULT 'TELECOM_TELEMETRY_BUS',
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Incidents (Correlated Anomaly Clusters)
CREATE TABLE incidents (
    id VARCHAR(64) PRIMARY KEY,
    incident_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'INVESTIGATING',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    region VARCHAR(128) NOT NULL,
    origin_component VARCHAR(128),
    root_cause TEXT,
    root_cause_confidence FLOAT DEFAULT 0.0,
    confidence_tier VARCHAR(32) DEFAULT 'MODERATE',
    summary TEXT,
    propagation_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Incident Events (Join Table with Correlation Metadata)
CREATE TABLE incident_events (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    event_id VARCHAR(64) NOT NULL,
    relationship_type VARCHAR(64) DEFAULT 'CORRELATED',
    correlation_score FLOAT DEFAULT 0.5,
    sequence_order INT DEFAULT 1,
    causal_explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES network_events(id) ON DELETE CASCADE
);

-- 8. Hypotheses (Competing Root-Cause Explanations)
CREATE TABLE hypotheses (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    confidence_tier VARCHAR(32) NOT NULL,
    supporting_evidence TEXT,
    contradicting_evidence TEXT,
    status VARCHAR(32) DEFAULT 'PRIMARY_CANDIDATE',
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- 9. Evidence (Ranked Atomic Evidence Items)
CREATE TABLE evidence (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    event_id VARCHAR(64),
    evidence_type VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    strength VARCHAR(32) DEFAULT 'HIGH',
    strength_score FLOAT DEFAULT 0.8,
    direction VARCHAR(32) DEFAULT 'SUPPORTING',
    source_component VARCHAR(128),
    timestamp TIMESTAMP,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES network_events(id) ON DELETE SET NULL
);

-- 10. Historical Incidents (Knowledge Base for Pattern Matching)
CREATE TABLE historical_incidents (
    id VARCHAR(64) PRIMARY KEY,
    incident_number VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    root_cause VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    symptoms TEXT NOT NULL,
    affected_components TEXT NOT NULL,
    resolution TEXT NOT NULL,
    resolution_time_minutes INT DEFAULT 25,
    lessons_learned TEXT,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
