-- ============================================================================
-- NETWORK INVESTIGATOR: SEED DATA FOR TOPOLOGY & HISTORICAL CASES
-- ============================================================================

-- Sites
INSERT INTO network_sites (id, site_name, region, latitude, longitude, status) VALUES
('SITE-METRO-01', 'Metro Central Tower', 'Metro Central', 37.7749, -122.4194, 'HEALTHY'),
('SITE-NORTH-02', 'North Financial Hub', 'North Metro', 37.7885, -122.4012, 'HEALTHY'),
('SITE-WEST-03', 'West Suburb Exchange', 'West County', 37.7610, -122.4450, 'HEALTHY'),
('SITE-SOUTH-04', 'South Industrial Park', 'South Bay', 37.7320, -122.3900, 'HEALTHY'),
('SITE-EAST-05', 'East Bay Gateway', 'East Metro', 37.7950, -122.3780, 'HEALTHY');

-- Network Cells
INSERT INTO network_cells (id, site_id, cell_name, technology, frequency_band, azimuth, status, latitude, longitude, neighbor_cell_ids) VALUES
('CELL-A17', 'SITE-METRO-01', 'Cell-A17 (Sector Alpha)', '5G NR', 'n78 (3.5GHz)', 0, 'HEALTHY', 37.7755, -122.4185, '["CELL-B12", "CELL-C04", "CELL-D09"]'),
('CELL-B12', 'SITE-METRO-01', 'Cell-B12 (Sector Beta)', '5G NR', 'n78 (3.5GHz)', 120, 'HEALTHY', 37.7742, -122.4190, '["CELL-A17", "CELL-C04", "CELL-E21"]'),
('CELL-C04', 'SITE-METRO-01', 'Cell-C04 (Sector Gamma)', '4G LTE', 'Band 7 (2.6GHz)', 240, 'HEALTHY', 37.7745, -122.4205, '["CELL-A17", "CELL-B12", "CELL-F08"]'),
('CELL-D09', 'SITE-NORTH-02', 'Cell-D09 (Financial Center)', '5G NR', 'n78 (3.5GHz)', 45, 'HEALTHY', 37.7890, -122.4005, '["CELL-A17", "CELL-E21"]'),
('CELL-E21', 'SITE-NORTH-02', 'Cell-E21 (Market St High Density)', '5G NR', 'n258 (28GHz mmWave)', 180, 'HEALTHY', 37.7875, -122.4020, '["CELL-D09", "CELL-B12"]'),
('CELL-F08', 'SITE-WEST-03', 'Cell-F08 (Sunset District)', '4G LTE', 'Band 3 (1.8GHz)', 270, 'HEALTHY', 37.7605, -122.4460, '["CELL-C04", "CELL-G15"]'),
('CELL-G15', 'SITE-WEST-03', 'Cell-G15 (Twin Peaks Tower)', '5G NR', 'n77 (3.7GHz)', 90, 'HEALTHY', 37.7620, -122.4435, '["CELL-F08", "CELL-A17"]'),
('CELL-H33', 'SITE-SOUTH-04', 'Cell-H33 (Harbor Zone)', '5G NR', 'n78 (3.5GHz)', 135, 'HEALTHY', 37.7315, -122.3895, '["CELL-B12", "CELL-I02"]'),
('CELL-I02', 'SITE-EAST-05', 'Cell-I02 (Bay Bridge East)', '5G NR', 'n78 (3.5GHz)', 315, 'HEALTHY', 37.7945, -122.3790, '["CELL-D09", "CELL-E21"]');

-- Network Nodes (Edge Routers, Core Switches, UPF Gateways)
INSERT INTO network_nodes (id, site_id, node_name, node_type, ip_address, status, connected_node_ids) VALUES
('ROUTER-A', 'SITE-METRO-01', 'Edge Router Metro-01', 'EDGE_ROUTER', '10.240.12.1', 'HEALTHY', '["CORE-NODE-01", "CELL-A17", "CELL-B12", "CELL-C04"]'),
('ROUTER-NORTH-01', 'SITE-NORTH-02', 'Edge Router North-01', 'EDGE_ROUTER', '10.240.14.1', 'HEALTHY', '["CORE-NODE-01", "CELL-D09", "CELL-E21"]'),
('ROUTER-WEST-01', 'SITE-WEST-03', 'Edge Router West-01', 'EDGE_ROUTER', '10.240.16.1', 'HEALTHY', '["CORE-NODE-01", "CELL-F08", "CELL-G15"]'),
('CORE-NODE-01', 'SITE-METRO-01', 'Core Aggregation Switch 01', 'CORE_SWITCH', '10.254.0.1', 'HEALTHY', '["ROUTER-A", "ROUTER-NORTH-01", "ROUTER-WEST-01", "UPF-GATEWAY-01"]'),
('UPF-GATEWAY-01', 'SITE-METRO-01', '5G User Plane Function (UPF-01)', 'UPF_GATEWAY', '10.254.100.1', 'HEALTHY', '["CORE-NODE-01"]');

-- Historical Incidents (for AI pattern matching)
INSERT INTO historical_incidents (id, incident_number, title, root_cause, category, symptoms, affected_components, resolution, resolution_time_minutes, lessons_learned, occurred_at) VALUES
('HIST-2025-0412', 'INC-HIST-0412', 'MIMO Beamforming Parameter Configuration Mismatch', 'Configuration push with erroneous antenna tilt and power profile', 'CONFIGURATION', '["CPU utilization spike > 90%", "Handover failure increase > 40%", "RRC connection drop rate surge", "Adjacent cell traffic overload"]', '["CELL-A17", "CELL-B12", "ROUTER-A"]', 'Rollback RAN configuration commit v4.12.2 to stable baseline v4.12.1; re-initialize BBU pool', 18, 'Automated CI/CD schema pre-validation required before pushing active sector RF parameters.', '2025-04-12 14:22:00'),
('HIST-2025-0903', 'INC-HIST-0903', 'Concert Venue Traffic Surge Buffer Exhaustion', 'Flash crowd traffic surge exceeding cell capacity threshold', 'TRAFFIC_SURGE', '["Throughput saturation 98%", "Packet latency spike > 180ms", "Buffer queue drops", "High downlink packet loss"]', '["CELL-E21", "CELL-D09", "ROUTER-NORTH-01"]', 'Dynamic load balancing activated; carrier aggregation expanded with temporary 40MHz carrier allocation', 25, 'Implement automated admission control and dynamic bandwidth throttling during known metropolitan events.', '2025-09-03 20:15:00'),
('HIST-2025-1118', 'INC-HIST-1118', 'Core Edge Router Interface BGP Flapping', 'BGP keepalive timeout due to optic transceiver degradation on trunk link', 'HARDWARE_FAILURE', '["BGP neighbor state reset", "Sub-second traffic reroute cascade", "Neighboring router interface overload", "Voice handover failure rate surge"]', '["ROUTER-A", "CORE-NODE-01", "CELL-A17", "CELL-B12"]', 'Replaced faulty SFP28 25G optical transceiver on Port xe-0/1/4 and stabilized BGP dampening', 32, 'Proactive optical power telemetry monitoring (DOM/DDM) should trigger maintenance before loss of signal.', '2025-11-18 09:40:00');
