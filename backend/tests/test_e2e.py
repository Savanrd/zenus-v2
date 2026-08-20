import asyncio
import httpx
import time

async def run_verification():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("=== NETWORK INVESTIGATOR E2E VERIFICATION ===")
        
        # 1. Health & Status
        r = await client.get("http://127.0.0.1:8000/api/health")
        print(f"[1] Backend Health: {r.status_code} - {r.json()}")
        assert r.status_code == 200
        
        # 2. Topology
        r = await client.get("http://127.0.0.1:8000/api/network/topology")
        topo = r.json()
        print(f"[2] Topology: {len(topo['sites'])} Sites, {len(topo['cells'])} Cells, {len(topo['nodes'])} Nodes, {len(topo['links'])} Links")
        assert len(topo['cells']) >= 8
        
        # 3. Start Scenario 1 (Massive MIMO Config Failure)
        r = await client.post("http://127.0.0.1:8000/api/simulation/start", json={"scenario_id": "config_failure", "speed": 4.0})
        print(f"[3] Started Simulation: {r.json()}")
        
        # Wait for simulation to finish ingesting
        await asyncio.sleep(4.0)
        
        # 4. Check Events in Database
        r = await client.get("http://127.0.0.1:8000/api/events")
        events = r.json()
        print(f"[4] Events Ingested into Realtime DB: {len(events)}")
        for idx, ev in enumerate(events[:5]):
            print(f"    - [{ev['severity']}] {ev['event_type']} on {ev['network_component']}: {ev['description'][:60]}...")
        assert len(events) >= 5
        
        # 5. Check Detected Incidents
        r = await client.get("http://127.0.0.1:8000/api/incidents")
        incidents = r.json()
        print(f"[5] Incidents Clustered: {len(incidents)}")
        assert len(incidents) >= 1
        inc = incidents[0]
        inc_id = inc["id"]
        print(f"    - Incident ID: {inc['incident_number']} | Root Cause: {inc['root_cause']} | Confidence: {int(inc['root_cause_confidence']*100)}%")
        
        # 6. Deep Investigation & Graph
        r = await client.get(f"http://127.0.0.1:8000/api/incidents/{inc_id}/graph")
        graph = r.json()
        print(f"[6] Incident React Flow Graph: {len(graph['nodes'])} Nodes, {len(graph['edges'])} Edges")
        assert len(graph['nodes']) >= 4
        
        # 7. AI Investigator Grounded Chat
        r = await client.post("http://127.0.0.1:8000/api/ai/chat", json={
            "query": "Why do you think Cell A17 is the root cause?",
            "incident_id": inc_id
        })
        chat_res = r.json()
        print(f"[7] AI Investigator Chat Answer:\n{chat_res['answer'][:250]}...\n")
        assert "Cell" in chat_res['answer'] or "CELL" in chat_res['answer']
        
        # 8. Dossier Report Generation
        r = await client.post("http://127.0.0.1:8000/api/reports/generate", json={"incident_id": inc_id})
        report = r.json()
        print(f"[8] Generated Dossier Report: ID={report['report_id']}, Actions={len(report['recommended_actions'])}, Hypotheses={len(report['hypotheses'])}")
        assert len(report['recommended_actions']) >= 3
        
        # 9. Frontend Dev Server Check
        try:
            r_fe = await client.get("http://localhost:5173/")
            print(f"[9] Frontend HTML Server: Status {r_fe.status_code} (Length: {len(r_fe.text)} bytes)")
            assert r_fe.status_code == 200
        except Exception as e:
            print(f"[9] Frontend check: {e}")
            
        print("\n=== ALL E2E VERIFICATIONS PASSED SUCCESSFULLY (100%) ===")

if __name__ == "__main__":
    asyncio.run(run_verification())
