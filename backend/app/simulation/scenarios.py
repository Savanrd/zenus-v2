import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

def get_scenario_events(scenario_id: str, base_time: datetime = None) -> List[Dict[str, Any]]:
    if base_time is None:
        base_time = datetime.utcnow() - timedelta(minutes=3)
        
    if scenario_id == "config_failure":
        return [
            {
                "id": str(uuid.uuid4()),
                "event_type": "CONFIG_CHANGE",
                "severity": "INFO",
                "timestamp": base_time + timedelta(seconds=0),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Radio parameter push: Massive MIMO beam tilt set to -8.5 deg, TxPower modified to 46dBm (v4.12.3)",
                "metric_name": "Config Commit ID",
                "metric_value": 4123.0,
                "metric_unit": "rev",
                "source": "RAN_ORCHESTRATOR",
                "metadata": {"user": "noc_admin_3", "commit_hash": "a8f9c2d"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "CPU_SPIKE",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=5),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Baseband Unit (BBU) CPU utilization surged past threshold (93.4%)",
                "metric_name": "CPU_UTILIZATION",
                "metric_value": 93.4,
                "metric_unit": "%",
                "source": "PERFORMANCE_COLLECTOR",
                "metadata": {"threshold": 80.0}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "PACKET_LOSS",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=10),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Downlink PDCP packet loss increased sharply to 14.8%",
                "metric_name": "PACKET_LOSS_RATE",
                "metric_value": 14.8,
                "metric_unit": "%",
                "source": "QOS_PROBE",
                "metadata": {"baseline": 0.2}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "HANDOVER_FAILURE",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=17),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Handover execution failure rate to neighbor sector CELL-B12 exceeded 48.2%",
                "metric_name": "HANDOVER_FAILURE_RATE",
                "metric_value": 48.2,
                "metric_unit": "%",
                "source": "RAN_TELEMETRY",
                "metadata": {"target_cell": "CELL-B12"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "CALL_DROP_SURGE",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=24),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "RRC connection drop rate surged to 6.8% across Sector Alpha and Beta",
                "metric_name": "CALL_DROP_RATE",
                "metric_value": 6.8,
                "metric_unit": "%",
                "source": "BILLING_CDR_ENGINE",
                "metadata": {"dropped_sessions": 248}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "USER_COMPLAINT",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=31),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Customer care CRM ticket spike: 42 simultaneous complaints in Metro Central zone",
                "metric_name": "COMPLAINT_VOLUME",
                "metric_value": 42.0,
                "metric_unit": "tickets/min",
                "source": "CRM_INTEGRATION",
                "metadata": {"region": "Metro Central"}
            }
        ]

    elif scenario_id == "traffic_surge":
        return [
            {
                "id": str(uuid.uuid4()),
                "event_type": "TRAFFIC_SURGE",
                "severity": "MEDIUM",
                "timestamp": base_time + timedelta(seconds=0),
                "site_id": "SITE-NORTH-02",
                "cell_id": "CELL-E21",
                "network_component": "CELL-E21",
                "description": "Flash crowd event: Downlink aggregate throughput spiked by 380% (4.2 Gbps)",
                "metric_name": "DOWNLINK_THROUGHPUT",
                "metric_value": 4.2,
                "metric_unit": "Gbps",
                "source": "UPF_COLLECTOR",
                "metadata": {"active_ues": 1840}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "CPU_SPIKE",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=6),
                "site_id": "SITE-NORTH-02",
                "cell_id": "CELL-E21",
                "network_component": "CELL-E21",
                "description": "BBU scheduler CPU load reached 96.1% due to high scheduling grant density",
                "metric_name": "CPU_UTILIZATION",
                "metric_value": 96.1,
                "metric_unit": "%",
                "source": "PERFORMANCE_COLLECTOR",
                "metadata": {"scheduler_delay": "8.4ms"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "LATENCY_INCREASE",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=12),
                "site_id": "SITE-NORTH-02",
                "cell_id": "CELL-E21",
                "network_component": "CELL-E21",
                "description": "End-to-end user plane RTT latency amplified from 12ms to 215ms",
                "metric_name": "RTT_LATENCY",
                "metric_value": 215.0,
                "metric_unit": "ms",
                "source": "ACTIVE_PROBING",
                "metadata": {"baseline_rtt": 12.0}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "BUFFER_OVERFLOW",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=18),
                "site_id": "SITE-NORTH-02",
                "cell_id": "CELL-E21",
                "network_component": "ROUTER-NORTH-01",
                "description": "Ingress buffer queue overflow on Router North-01 interface ge-0/0/2",
                "metric_name": "BUFFER_DROPS",
                "metric_value": 18500.0,
                "metric_unit": "pkts/sec",
                "source": "SNMP_AGENT",
                "metadata": {"interface": "ge-0/0/2"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "CALL_DROP_SURGE",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=25),
                "site_id": "SITE-NORTH-02",
                "cell_id": "CELL-D09",
                "network_component": "CELL-D09",
                "description": "Traffic spillover to neighbor cell CELL-D09 triggered admission rejection & call drops",
                "metric_name": "ADMISSION_REJECTION_RATE",
                "metric_value": 31.4,
                "metric_unit": "%",
                "source": "RAN_ORCHESTRATOR",
                "metadata": {"spillover_volume": "1.8 Gbps"}
            }
        ]

    elif scenario_id == "router_failure":
        return [
            {
                "id": str(uuid.uuid4()),
                "event_type": "ROUTER_FAIL",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=0),
                "site_id": "SITE-METRO-01",
                "cell_id": None,
                "network_component": "ROUTER-A",
                "description": "Optical SFP28 25G Loss of Signal on Port xe-0/1/4; link state down",
                "metric_name": "OPTICAL_RX_POWER",
                "metric_value": -32.5,
                "metric_unit": "dBm",
                "source": "DOM_MONITOR",
                "metadata": {"port": "xe-0/1/4", "error": "LOS_ALARM"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "BGP_FLAP",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=5),
                "site_id": "SITE-METRO-01",
                "cell_id": None,
                "network_component": "CORE-NODE-01",
                "description": "BGP neighbor 10.240.12.1 (Router-A) transitioned from ESTABLISHED to IDLE (HoldTimer Expired)",
                "metric_name": "BGP_PEER_STATE",
                "metric_value": 0.0,
                "metric_unit": "state",
                "source": "SYSLOG_DAEMON",
                "metadata": {"peer": "10.240.12.1"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "LATENCY_INCREASE",
                "severity": "HIGH",
                "timestamp": base_time + timedelta(seconds=12),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-A17",
                "network_component": "CELL-A17",
                "description": "Failover detour route added 140ms latency and 8.5% packet jitter",
                "metric_name": "RTT_LATENCY",
                "metric_value": 152.0,
                "metric_unit": "ms",
                "source": "PROBE_NODE",
                "metadata": {"detour_hops": 4}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "HANDOVER_FAILURE",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=19),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-B12",
                "network_component": "CELL-B12",
                "description": "X2/Xn interface signaling timeout resulted in widespread handover drops across sectors",
                "metric_name": "XN_TIMEOUT_RATE",
                "metric_value": 54.0,
                "metric_unit": "%",
                "source": "RAN_CONTROLLER",
                "metadata": {"interface": "Xn-AP"}
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "CALL_DROP_SURGE",
                "severity": "CRITICAL",
                "timestamp": base_time + timedelta(seconds=27),
                "site_id": "SITE-METRO-01",
                "cell_id": "CELL-C04",
                "network_component": "CELL-C04",
                "description": "Subscribers experienced call drops and voice bearer teardown during failover transition",
                "metric_name": "CALL_DROP_RATE",
                "metric_value": 9.2,
                "metric_unit": "%",
                "source": "IMS_TELEMETRY",
                "metadata": {"voice_drops": 312}
            }
        ]

    return []
