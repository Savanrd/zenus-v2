import asyncio
import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
import aiosqlite
from datetime import datetime

from app.config import settings, BASE_DIR, DATA_DIR

DB_FILE = DATA_DIR / "network_investigator.db"
SCHEMA_FILE = BASE_DIR.parent / "database" / "schema.sql"
SEED_FILE = BASE_DIR.parent / "database" / "seed.sql"

@asynccontextmanager
async def get_db():
    """Async context manager for sqlite database connection"""
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")
        yield db

async def init_db():
    """Initializes the database schema and seeds initial data if empty"""
    SCHEMA_FILE_PATH = SCHEMA_FILE if SCHEMA_FILE.exists() else BASE_DIR / "schema.sql"
    SEED_FILE_PATH = SEED_FILE if SEED_FILE.exists() else BASE_DIR / "seed.sql"
    
    async with get_db() as db:
        cursor = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='incidents';")
        table_exists = await cursor.fetchone()
        
        if not table_exists:
            print("[Database] Initializing schema from schema.sql...")
            if SCHEMA_FILE_PATH.exists():
                schema_sql = SCHEMA_FILE_PATH.read_text(encoding="utf-8")
                await db.executescript(schema_sql)
            
            print("[Database] Seeding initial network topology and historical cases...")
            if SEED_FILE_PATH.exists():
                seed_sql = SEED_FILE_PATH.read_text(encoding="utf-8")
                await db.executescript(seed_sql)
            
            await db.commit()
            print("[Database] Initialization complete.")
        else:
            print("[Database] Database already initialized.")

async def insert_event(event_dict: Dict[str, Any]) -> str:
    """Inserts a new network event into the database"""
    async with get_db() as db:
        metadata_str = json.dumps(event_dict.get("metadata")) if event_dict.get("metadata") else None
        ts = event_dict.get("timestamp")
        if isinstance(ts, datetime):
            ts = ts.strftime("%Y-%m-%d %H:%M:%S")
            
        await db.execute(
            """
            INSERT INTO network_events (
                id, event_type, severity, timestamp, site_id, cell_id,
                network_component, description, metric_name, metric_value,
                metric_unit, source, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_dict["id"],
                event_dict["event_type"],
                event_dict["severity"],
                ts,
                event_dict.get("site_id"),
                event_dict.get("cell_id"),
                event_dict["network_component"],
                event_dict["description"],
                event_dict.get("metric_name"),
                event_dict.get("metric_value"),
                event_dict.get("metric_unit"),
                event_dict.get("source", "TELECOM_TELEMETRY_BUS"),
                metadata_str
            )
        )
        await db.commit()
        return event_dict["id"]

async def fetch_recent_events(limit: int = 100) -> List[Dict[str, Any]]:
    """Fetches most recent network events"""
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT id, event_type, severity, timestamp, site_id, cell_id,
                   network_component, description, metric_name, metric_value,
                   metric_unit, source, metadata, created_at
            FROM network_events
            ORDER BY timestamp DESC, created_at DESC
            LIMIT ?
            """,
            (limit,)
        )
        rows = await cursor.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            if d.get("metadata"):
                try:
                    d["metadata"] = json.loads(d["metadata"])
                except Exception:
                    pass
            result.append(d)
        return result

async def fetch_all_incidents() -> List[Dict[str, Any]]:
    """Fetches all incidents with their metadata"""
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT id, incident_number, title, severity, status, start_time, end_time,
                   region, origin_component, root_cause, root_cause_confidence,
                   confidence_tier, summary, propagation_path, created_at, updated_at
            FROM incidents
            ORDER BY start_time DESC
            """
        )
        rows = await cursor.fetchall()
        incidents = []
        for row in rows:
            inc = dict(row)
            if inc.get("propagation_path"):
                try:
                    inc["propagation_path"] = json.loads(inc["propagation_path"])
                except Exception:
                    inc["propagation_path"] = []
            else:
                inc["propagation_path"] = []
            incidents.append(inc)
        return incidents

async def fetch_incident_details(incident_id: str) -> Optional[Dict[str, Any]]:
    """Fetches full incident details with events, hypotheses, and evidence"""
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT id, incident_number, title, severity, status, start_time, end_time,
                   region, origin_component, root_cause, root_cause_confidence,
                   confidence_tier, summary, propagation_path, created_at, updated_at
            FROM incidents
            WHERE id = ? OR incident_number = ?
            """,
            (incident_id, incident_id)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        
        inc = dict(row)
        if inc.get("propagation_path"):
            try:
                inc["propagation_path"] = json.loads(inc["propagation_path"])
            except Exception:
                inc["propagation_path"] = []
        else:
            inc["propagation_path"] = []
            
        # Fetch associated events via incident_events
        ev_cursor = await db.execute(
            """
            SELECT e.id, e.event_type, e.severity, e.timestamp, e.site_id, e.cell_id,
                   e.network_component, e.description, e.metric_name, e.metric_value,
                   e.metric_unit, e.source, e.metadata,
                   ie.relationship_type, ie.correlation_score, ie.sequence_order, ie.causal_explanation
            FROM incident_events ie
            JOIN network_events e ON ie.event_id = e.id
            WHERE ie.incident_id = ?
            ORDER BY e.timestamp ASC, ie.sequence_order ASC
            """,
            (inc["id"],)
        )
        ev_rows = await ev_cursor.fetchall()
        events = []
        incident_events = []
        for erow in ev_rows:
            ed = dict(erow)
            if ed.get("metadata"):
                try:
                    ed["metadata"] = json.loads(ed["metadata"])
                except Exception:
                    pass
            events.append(ed)
            incident_events.append({
                "id": ed["id"],
                "incident_id": inc["id"],
                "event_id": ed["id"],
                "relationship_type": ed["relationship_type"],
                "correlation_score": ed["correlation_score"],
                "sequence_order": ed["sequence_order"],
                "causal_explanation": ed["causal_explanation"]
            })
            
        inc["events"] = events
        inc["incident_events"] = incident_events
        
        # Fetch hypotheses
        hypo_cursor = await db.execute(
            """
            SELECT id, incident_id, title, description, confidence, confidence_tier,
                   supporting_evidence, contradicting_evidence, status, reasoning
            FROM hypotheses
            WHERE incident_id = ?
            ORDER BY confidence DESC
            """,
            (inc["id"],)
        )
        hypo_rows = await hypo_cursor.fetchall()
        hypos = []
        for hrow in hypo_rows:
            hd = dict(hrow)
            for k in ["supporting_evidence", "contradicting_evidence"]:
                if hd.get(k):
                    try:
                        hd[k] = json.loads(hd[k])
                    except Exception:
                        hd[k] = []
                else:
                    hd[k] = []
            hypos.append(hd)
        inc["hypotheses"] = hypos
        
        # Fetch evidence
        evi_cursor = await db.execute(
            """
            SELECT id, incident_id, event_id, evidence_type, description,
                   strength, strength_score, direction, source_component, timestamp, metadata
            FROM evidence
            WHERE incident_id = ?
            ORDER BY strength_score DESC
            """,
            (inc["id"],)
        )
        evi_rows = await evi_cursor.fetchall()
        evis = []
        for erow in evi_rows:
            ed = dict(erow)
            if ed.get("metadata"):
                try:
                    ed["metadata"] = json.loads(ed["metadata"])
                except Exception:
                    pass
            evis.append(ed)
        inc["evidence"] = evis
        
        return inc

async def save_or_update_incident(inc_dict: Dict[str, Any]) -> str:
    """Saves or updates an incident, its events, hypotheses and evidence atomically"""
    async with get_db() as db:
        prop_str = json.dumps(inc_dict.get("propagation_path", []))
        
        # Insert or replace incident
        await db.execute(
            """
            INSERT OR REPLACE INTO incidents (
                id, incident_number, title, severity, status, start_time, end_time,
                region, origin_component, root_cause, root_cause_confidence,
                confidence_tier, summary, propagation_path, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (
                inc_dict["id"],
                inc_dict["incident_number"],
                inc_dict["title"],
                inc_dict["severity"],
                inc_dict.get("status", "INVESTIGATING"),
                inc_dict["start_time"],
                inc_dict.get("end_time"),
                inc_dict["region"],
                inc_dict.get("origin_component"),
                inc_dict.get("root_cause"),
                inc_dict.get("root_cause_confidence", 0.0),
                inc_dict.get("confidence_tier", "MODERATE"),
                inc_dict.get("summary"),
                prop_str
            )
        )
        
        # Save incident events
        if "incident_events" in inc_dict and inc_dict["incident_events"]:
            await db.execute("DELETE FROM incident_events WHERE incident_id = ?", (inc_dict["id"],))
            for ie in inc_dict["incident_events"]:
                await db.execute(
                    """
                    INSERT INTO incident_events (
                        id, incident_id, event_id, relationship_type,
                        correlation_score, sequence_order, causal_explanation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        ie.get("id", str(ie.get("event_id"))),
                        inc_dict["id"],
                        ie["event_id"],
                        ie.get("relationship_type", "CORRELATED"),
                        ie.get("correlation_score", 0.5),
                        ie.get("sequence_order", 1),
                        ie.get("causal_explanation")
                    )
                )
                
        # Save hypotheses
        if "hypotheses" in inc_dict and inc_dict["hypotheses"]:
            await db.execute("DELETE FROM hypotheses WHERE incident_id = ?", (inc_dict["id"],))
            for h in inc_dict["hypotheses"]:
                supp_str = json.dumps(h.get("supporting_evidence", []))
                contra_str = json.dumps(h.get("contradicting_evidence", []))
                await db.execute(
                    """
                    INSERT INTO hypotheses (
                        id, incident_id, title, description, confidence,
                        confidence_tier, supporting_evidence, contradicting_evidence,
                        status, reasoning
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        h["id"],
                        inc_dict["id"],
                        h["title"],
                        h["description"],
                        h["confidence"],
                        h["confidence_tier"],
                        supp_str,
                        contra_str,
                        h.get("status", "PRIMARY_CANDIDATE"),
                        h.get("reasoning")
                    )
                )
                
        # Save evidence
        if "evidence" in inc_dict and inc_dict["evidence"]:
            await db.execute("DELETE FROM evidence WHERE incident_id = ?", (inc_dict["id"],))
            for ev in inc_dict["evidence"]:
                meta_str = json.dumps(ev.get("metadata")) if ev.get("metadata") else None
                await db.execute(
                    """
                    INSERT INTO evidence (
                        id, incident_id, event_id, evidence_type, description,
                        strength, strength_score, direction, source_component,
                        timestamp, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        ev["id"],
                        inc_dict["id"],
                        ev.get("event_id"),
                        ev["evidence_type"],
                        ev["description"],
                        ev.get("strength", "HIGH"),
                        ev.get("strength_score", 0.8),
                        ev.get("direction", "SUPPORTING"),
                        ev.get("source_component"),
                        ev.get("timestamp"),
                        meta_str
                    )
                )
                
        await db.commit()
        return inc_dict["id"]

async def fetch_historical_incidents() -> List[Dict[str, Any]]:
    """Fetches all historical knowledge incidents"""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM historical_incidents ORDER BY occurred_at DESC")
        rows = await cursor.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            for k in ["symptoms", "affected_components"]:
                if d.get(k):
                    try:
                        d[k] = json.loads(d[k])
                    except Exception:
                        d[k] = []
            result.append(d)
        return result

async def fetch_network_topology() -> Dict[str, Any]:
    """Fetches sites, cells, nodes, and builds topology links"""
    async with get_db() as db:
        sites_cursor = await db.execute("SELECT * FROM network_sites")
        sites = [dict(r) for r in await sites_cursor.fetchall()]
        
        cells_cursor = await db.execute("SELECT * FROM network_cells")
        cells = []
        for r in await cells_cursor.fetchall():
            c = dict(r)
            if c.get("neighbor_cell_ids"):
                try:
                    c["neighbor_cell_ids"] = json.loads(c["neighbor_cell_ids"])
                except Exception:
                    c["neighbor_cell_ids"] = []
            else:
                c["neighbor_cell_ids"] = []
            cells.append(c)
            
        nodes_cursor = await db.execute("SELECT * FROM network_nodes")
        nodes = []
        for r in await nodes_cursor.fetchall():
            n = dict(r)
            if n.get("connected_node_ids"):
                try:
                    n["connected_node_ids"] = json.loads(n["connected_node_ids"])
                except Exception:
                    n["connected_node_ids"] = []
            else:
                n["connected_node_ids"] = []
            nodes.append(n)
            
        # Build logical links
        links = []
        for c in cells:
            for neighbor in c.get("neighbor_cell_ids", []):
                links.append({
                    "id": f"LINK-RADIO-{c['id']}-{neighbor}",
                    "source": c["id"],
                    "target": neighbor,
                    "link_type": "RADIO_NEIGHBOR",
                    "bandwidth_gbps": 5.0,
                    "status": "HEALTHY"
                })
        for n in nodes:
            for target in n.get("connected_node_ids", []):
                links.append({
                    "id": f"LINK-CORE-{n['id']}-{target}",
                    "source": n["id"],
                    "target": target,
                    "link_type": "FIBER_BACKHAUL" if "ROUTER" in n["id"] else "CORE_TRUNK",
                    "bandwidth_gbps": 25.0 if "CORE" in n["id"] else 10.0,
                    "status": "HEALTHY"
                })
                
        return {
            "sites": sites,
            "cells": cells,
            "nodes": nodes,
            "links": links
        }

async def clear_simulation_data():
    """Resets active events and incidents while preserving topology and historical database"""
    async with get_db() as db:
        await db.execute("DELETE FROM evidence")
        await db.execute("DELETE FROM hypotheses")
        await db.execute("DELETE FROM incident_events")
        await db.execute("DELETE FROM incidents")
        await db.execute("DELETE FROM network_events")
        await db.commit()
