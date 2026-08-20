import math
import re
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel

# Comprehensive Project Knowledge Base Documents for RAG
PROJECT_KNOWLEDGE_BASE = [
    {
        "id": "doc_intro",
        "title": "Network Investigator Overview & One-Line Concept",
        "keywords": ["network investigator", "concept", "what is", "about", "idea", "overview", "zenus", "forensic", "detective"],
        "content": (
            "Network Investigator is an AI-powered digital forensic investigator and incident reconstruction platform for telecom networks. "
            "Instead of simply saying 'Network failure detected', it behaves like a digital detective: it receives real-time network events, "
            "correlates them across temporal, spatial, topological, and causal dimensions, reconstructs the chronological incident timeline, "
            "identifies the most likely root cause with confidence scoring, explains visible evidence trails, shows how the failure propagated "
            "through the network topology, and provides an interactive command center for telecom NOC engineers."
        )
    },
    {
        "id": "doc_five_pillars",
        "title": "The Five Core Forensic Pillars",
        "keywords": ["five questions", "pillars", "core principle", "what", "when", "where", "why", "how sure", "confidence"],
        "content": (
            "Network Investigator is designed around five fundamental forensic questions:\n"
            "1. WHAT: Incident summary & type of network degradation (e.g. Massive MIMO QoS cascade).\n"
            "2. WHEN: Reconstructed chronological sequence and exact event timestamps.\n"
            "3. WHERE: Origin component (e.g. CELL-A17) and physical/logical region (Metro Central).\n"
            "4. WHY: Root cause attribution (e.g. unvalidated antenna tilt parameter push) and failure mechanics.\n"
            "5. HOW SURE: Probabilistic AI Confidence score (0-100%) and transparent evidence trail (supporting & contradicting)."
        )
    },
    {
        "id": "doc_correlation",
        "title": "Multi-Dimensional Correlation Engine & Mathematical Formula",
        "keywords": ["correlation", "math", "formula", "scoring", "weights", "temporal", "spatial", "causal", "networkx", "topology"],
        "content": (
            "The event correlation engine evaluates incoming telecom telemetry across four dimensions to produce a composite correlation score (0.0 to 1.0):\n"
            "Composite Score = 0.30 * TemporalScore + 0.35 * CausalScore + 0.25 * SpatialScore + 0.10 * SeverityWeight\n\n"
            "- Temporal Score: Exponential decay function e^(-ln(2) * dt / half_life) where dt is time delta.\n"
            "- Causal Score: Domain transition probability matrix (e.g., CONFIG_CHANGE -> CPU_SPIKE: 94%, CPU_SPIKE -> PACKET_LOSS: 91%, HANDOVER_FAILURE -> CALL_DROPS: 95%).\n"
            "- Spatial / Topology Score: Shortest hop distance computed dynamically on the NetworkX network graph (Adjacent=0.88, 2 hops=0.72, 3 hops=0.55).\n"
            "- Severity Weight: CRITICAL=1.0, HIGH=0.85, MEDIUM=0.65, LOW=0.45."
        )
    },
    {
        "id": "doc_realtime_db",
        "title": "Real-Time Database Architecture & WebSockets",
        "keywords": ["database", "realtime", "sqlite", "postgresql", "supabase", "websockets", "sync", "polling", "schema"],
        "content": (
            "Network Investigator utilizes a persistent real-time database architecture supporting both zero-config asynchronous SQLite/PostgreSQL "
            "and Supabase PostgreSQL with Realtime subscriptions. When an event enters the database via POST /api/events, file upload, or the live simulator:\n"
            "1. It is stored in the database.\n"
            "2. Broadcaster pushes an 'EVENT_INSERTED' message across active WebSockets (/ws/realtime).\n"
            "3. Incident clustering checks if it belongs to an active incident or creates a new incident cluster.\n"
            "4. The AI forensic reasoner updates hypotheses, evidence, and graph DAG.\n"
            "5. All connected frontend browsers update immediately without manual page refreshes."
        )
    },
    {
        "id": "doc_scenarios",
        "title": "Live Crisis Simulation Scenarios",
        "keywords": ["simulation", "scenarios", "scenario 1", "scenario 2", "scenario 3", "demo", "config failure", "traffic surge", "router failure"],
        "content": (
            "The system includes three realistic pre-configured telecom crisis scenarios:\n\n"
            "• Scenario 1: Massive MIMO Configuration Failure (Cell A17)\n"
            "  Sequence: Config Change (tilt -8.5deg, TxPower 46dBm) -> CPU Spike (93.4%) -> Packet Loss (14.8%) -> Handover Failure to Cell B12 (48.2%) -> Call Drops (6.8%) -> CRM User Complaints (42 tickets/min).\n"
            "  Root Cause: Erroneous RF configuration push on Sector Alpha.\n\n"
            "• Scenario 2: Stadium Flash Crowd Traffic Congestion (Cell E21)\n"
            "  Sequence: Traffic Surge (4.2 Gbps) -> Scheduler CPU Load (96.1%) -> RTT Latency Spike (215ms) -> Router Ingress Buffer Queue Drops (18.5k pkts/sec) -> Adjacent Cell D09 Spillover Rejection (31.4%).\n"
            "  Root Cause: High-density subscriber traffic surge exceeding BBU buffer capacity.\n\n"
            "• Scenario 3: Core Edge Router Optical Trunk Failure (Router-A)\n"
            "  Sequence: SFP28 Optic Loss of Signal (-32.5dBm) -> Core BGP Neighbor Transition to IDLE -> Detour Failover Latency (+140ms) -> X2/Xn Handover Timeout (54%) -> Voice Call Drops (9.2%).\n"
            "  Root Cause: Optical transceiver loss of signal and BGP route flapping on edge trunk."
        )
    },
    {
        "id": "doc_hypotheses_evidence",
        "title": "Multi-Hypothesis Arena, Evidence Locker & Confidence Tiers",
        "keywords": ["hypothesis", "hypotheses", "evidence", "confidence", "tiers", "supporting", "contradicting", "reasoning"],
        "content": (
            "The AI forensic engine evaluates multiple competing hypotheses rather than blindly asserting a single cause:\n"
            "- Hypothesis 1 (Primary): Configuration Error (88% Likelihood — VERY HIGH tier)\n"
            "- Hypothesis 2 (Alternative): External Traffic Flash Crowd (58% Likelihood — MODERATE tier)\n"
            "- Hypothesis 3 (Alternative): Physical Fiber Transceiver Degradation (28% Likelihood — LOW tier / Ruled Out)\n\n"
            "Confidence Tiers:\n"
            "- 0–39%: LOW\n"
            "- 40–69%: MODERATE\n"
            "- 70–84%: HIGH\n"
            "- 85–100%: VERY HIGH\n\n"
            "Every conclusion is backed by atomic evidence items classified as SUPPORTING (e.g. temporal sequence, CPU spikes) or CONTRADICTING (e.g. facility grid voltage remained stable at 48.2V DC, ruling out facility power failure)."
        )
    },
    {
        "id": "doc_tech_stack",
        "title": "Complete Full-Stack Technology Stack",
        "keywords": ["tech stack", "frontend", "backend", "fastapi", "react", "typescript", "tailwind", "react flow", "python", "networkx", "libraries"],
        "content": (
            "Network Investigator Tech Stack:\n"
            "• Frontend: React 18, TypeScript, Vite, Tailwind CSS, @xyflow/react (React Flow for DAG graph), Lucide React, Recharts, jsPDF, html2canvas.\n"
            "• Backend: Python 3.11, FastAPI, Pydantic v2, Pandas, NumPy, NetworkX, Scikit-learn, SQLAlchemy, aiosqlite, Uvicorn.\n"
            "• Database: Relational schema supporting Supabase PostgreSQL and async SQLite.\n"
            "• Real-Time: WebSockets (/ws/realtime) with bidirectional event broadcasting."
        )
    },
    {
        "id": "doc_demo_script",
        "title": "Zenus Group Selection Presentation Demo Guide",
        "keywords": ["zenus", "demo guide", "presentation", "how to present", "how to demonstrate", "steps"],
        "content": (
            "Step-by-Step Zenus Presentation Script:\n"
            "1. Open http://localhost:5173 to show the Overview Command Center.\n"
            "2. Highlight the 5 Forensic Questions and Real-Time Database status indicator.\n"
            "3. Go to 'Live Network & Sim' and click 'START LIVE SIMULATION' (Scenario 1).\n"
            "4. Show live events writing to the database and automatically clustering into an incident.\n"
            "5. Open 'Investigation Hub' -> Show React Flow DAG Graph with root-cause badge.\n"
            "6. Demonstrate Timeline Replay scrubber (Play, Pause, Speed 0.5x - 5x).\n"
            "7. Show Evidence Locker & Multi-Hypothesis Arena.\n"
            "8. Ask Sunny or the AI Investigator Chat why Cell A17 is the root cause.\n"
            "9. Click 'Generate Investigation Report' and show 1-click PDF/JSON/CSV export."
        )
    },
    {
        "id": "doc_api_endpoints",
        "title": "REST API & WebSocket Endpoints",
        "keywords": ["api", "endpoints", "rest", "routes", "urls", "backend routes"],
        "content": (
            "Main REST API Endpoints:\n"
            "- GET /api/health: Service and database health check\n"
            "- GET /api/stats: Live KPI statistics\n"
            "- GET /api/events & POST /api/events: Ingest and list network events\n"
            "- GET /api/incidents & GET /api/incidents/{id}: Query active incidents\n"
            "- GET /api/incidents/{id}/graph: React Flow DAG layout\n"
            "- GET /api/incidents/{id}/timeline: Chronological event sequence\n"
            "- GET /api/network/topology: 5G/4G cells, routers, and links\n"
            "- POST /api/simulation/start | stop | reset: Simulation control plane\n"
            "- POST /api/ai/chat: Grounded AI detective chat\n"
            "- POST /api/ai/sunny: Sunny RAG Assistant endpoint\n"
            "- POST /api/reports/generate: PDF/JSON dossier generator\n"
            "- POST /api/data/upload: CSV/JSON/Syslog parser\n"
            "- WS /ws/realtime: Live real-time WebSocket stream"
        )
    }
]

class SunnyRAGService:
    def __init__(self):
        self.knowledge_base = PROJECT_KNOWLEDGE_BASE

    def retrieve_relevant_docs(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves top-k relevant knowledge chunks using keyword and token overlap scoring"""
        tokens = set(re.findall(r'\w+', query.lower()))
        scored_docs = []

        for doc in self.knowledge_base:
            score = 0.0
            # Keyword match
            for kw in doc["keywords"]:
                if kw in query.lower():
                    score += 3.0
                for t in tokens:
                    if t in kw:
                        score += 1.5

            # Content token overlap
            doc_tokens = set(re.findall(r'\w+', (doc["title"] + " " + doc["content"]).lower()))
            overlap = len(tokens.intersection(doc_tokens))
            score += overlap * 0.5

            scored_docs.append((score, doc))

        # Sort by relevance score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k] if score > 0]

    def is_project_related(self, query: str) -> bool:
        """Guardrail to verify if the inquiry is strictly related to the Network Investigator project"""
        q = query.lower().strip()
        project_terms = [
            "network", "investigator", "telecom", "incident", "cell", "router", "correlation",
            "root cause", "evidence", "hypothesis", "hypotheses", "simulation", "scenario",
            "topology", "5g", "4g", "bbu", "packet loss", "handover", "call drop", "zenus",
            "sunny", "rag", "fastapi", "react", "database", "supabase", "websocket", "report",
            "pillar", "what", "when", "where", "why", "how sure", "confidence", "replay",
            "timeline", "graph", "react flow", "api", "project", "code", "architecture", "presentation"
        ]
        
        # Check if any project term is present or if retrieval finds high relevance
        if any(term in q for term in project_terms):
            return True
        
        docs = self.retrieve_relevant_docs(query, top_k=1)
        return len(docs) > 0

    def generate_sunny_response(self, query: str) -> Dict[str, Any]:
        """Formulates a precise, grounded RAG response strictly about the project"""
        if not self.is_project_related(query):
            return {
                "answer": (
                    "👋 Hello! I am **Sunny**, the dedicated AI assistant for the **Network Investigator** platform.\n\n"
                    "I am strictly programmed to assist only with questions regarding the **Network Investigator** project, its telecom forensic architecture, "
                    "real-time database, correlation math, incident scenarios, DAG graph, or presentation details for the Zenus Group selection.\n\n"
                    "Please ask me anything about the **Network Investigator** project! For example:\n"
                    "- *How does the multi-dimensional correlation formula work?*\n"
                    "- *Explain the 5 core forensic pillars.*\n"
                    "- *How do I demonstrate Scenario 1 (Configuration Failure)?*\n"
                    "- *What technology stack is used in the frontend and backend?*"
                ),
                "citations": [],
                "is_project_related": False
            }

        retrieved_docs = self.retrieve_relevant_docs(query, top_k=2)
        if not retrieved_docs:
            retrieved_docs = [self.knowledge_base[0]] # fallback to intro

        citations = [d["title"] for d in retrieved_docs]
        context_text = "\n\n".join([f"### {d['title']}\n{d['content']}" for d in retrieved_docs])

        # Synthesize clear, grounded answer
        answer = (
            f"☀️ **Sunny (Network Investigator Project AI)**:\n\n"
            f"{context_text}\n\n"
            f"---\n"
            f"💡 *Knowledge Base Sources: {', '.join(citations)}*"
        )

        return {
            "answer": answer,
            "citations": citations,
            "is_project_related": True
        }

sunny_rag_service = SunnyRAGService()
