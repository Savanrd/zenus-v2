# 🛰️ NETWORK INVESTIGATOR
### AI-Powered Telecom Incident Investigation & Forensic Reconstruction

> **"Don't just detect the failure. Reconstruct it."**
> Give Network Investigator messy telecom incident data, and it reconstructs what probably happened, in what order, why it happened, how it propagated through the network topology, and what evidence supports that conclusion.

---

## 🌟 Key Highlights & Core Capabilities

- 🔍 **5 Forensic Pillars**: Designed around answering **WHAT**, **WHEN**, **WHERE**, **WHY**, and **HOW SURE**.
- ⚡ **Real-Time Database**: Continuous ingestion into PostgreSQL / SQLite with WebSocket / Supabase Realtime synchronization. No browser refresh required.
- 🧠 **Multi-Dimensional Correlation Engine**: Computes composite correlation scores across Temporal decay ($e^{-\lambda \Delta t}$), Topological Graph hops (NetworkX), Causal rule matrix, and Historical analogies.
- 📊 **Interactive Incident DAG Graph**: Built with **React Flow** featuring custom forensic event nodes, root-cause candidate badges, animated propagation vectors, and click-to-inspect telemetry drawers.
- ⏱️ **Crime Scene Replay Timeline**: Step-by-step incident playback scrubber with $0.5\times, 1\times, 2\times, 5\times$ speed multipliers and live node illumination.
- 🔒 **Ranked Evidence Locker**: Transparent, verifiable evidence trails showing supporting and contradicting telemetry checks.
- 🎯 **Multi-Hypothesis Arena**: Probabilistic ranking of competing explanations (e.g. Configuration Error vs External Traffic Surge vs Fiber Transceiver Degrade) with confidence tiers (LOW, MODERATE, HIGH, VERY HIGH).
- 🗺️ **Interactive Network Topology**: Visualizes 5G gNodeB Sectors, 4G LTE Cells, Edge Routers, Core Switches, and animated blast radius propagation paths.
- 💬 **Grounded AI Detective Chat**: Conversational AI forensic assistant answering specific questions grounded in actual incident telemetry.
- 📑 **Comprehensive Dossier Reporting**: 1-click export of complete forensic dossiers to **PDF**, **JSON**, and **CSV**.
- 🧪 **Live Crisis Simulation Engine**: 3 pre-built realistic telecom scenarios:
  1. *Scenario 1: Massive MIMO Configuration Failure (Cell A17)*
  2. *Scenario 2: Stadium Flash Crowd Traffic Congestion (Cell E21)*
  3. *Scenario 3: Core Optical Trunk & BGP Flapping (Router-A)*

---

## 🏗️ Architecture Overview

```text
LIVE NETWORK EVENT (Simulated / Uploaded / REST API)
        ↓
REAL-TIME DATABASE (PostgreSQL / SQLite Engine)
        ↓
EVENT PROCESSING & NORMALIZATION (Pandas / NumPy)
        ↓
EVENT CORRELATION ENGINE (NetworkX / Causal Matrix)
        ↓
INCIDENT GRAPH & TIMELINE RECONSTRUCTION (DAG)
        ↓
AI FORENSIC REASONING & EVIDENCE RANKING
        ↓
LIVE FRONTEND COMMAND CENTER UPDATE (WebSockets)
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

### 1. Start the FastAPI Backend
```bash
# In project root:
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend starts at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Start the React Frontend
```bash
# In a separate terminal:
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Live Simulation & Demonstration Flow

1. Open `http://localhost:5173`.
2. Navigate to **Live Network & Sim**.
3. Click **START LIVE SIMULATION**.
4. Watch telemetry events arrive in real time, write to the database, and trigger correlation.
5. Watch the **Incident Investigation** page automatically illuminate the DAG graph, compute root cause confidence, rank evidence items, and trace the propagation wave.
6. Interact with the **Timeline Replay** slider or ask the **AI Detective Chat** why the incident occurred.
7. Click **Generate Dossier Report** to export to PDF.

---

## 📂 Project Structure

```text
zenus/
├── backend/
│   ├── app/
│   │   ├── ai/                # Forensic reasoning & grounded chat assistant
│   │   ├── analytics/         # Multi-dimensional correlation & clustering
│   │   ├── api/               # REST routers (events, incidents, topology, reports, sim)
│   │   ├── db/                # Database engine & async session queries
│   │   ├── graph/             # React Flow DAG generator
│   │   ├── models/            # Pydantic schemas & enums
│   │   ├── realtime/          # WebSocket broadcaster & event bus
│   │   ├── simulation/        # Scenario definitions & simulator engine
│   │   ├── config.py          # Environment settings
│   │   └── main.py            # FastAPI entrypoint
│   ├── tests/                 # Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components (Navbar, EvidenceLocker, Chat, Controls)
│   │   ├── graph/             # React Flow incident nodes & graph canvas
│   │   ├── network-map/       # 2D SVG topology map & blast radius
│   │   ├── pages/             # 8 command center pages
│   │   ├── realtime/          # WebSocket hook
│   │   ├── services/          # API client
│   │   ├── timeline/          # Crime scene replay timeline
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── database/
│   ├── schema.sql             # Relational PostgreSQL & SQLite schema
│   └── seed.sql               # Telecom topology and historical case library
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 📄 License
MIT License. Built for advanced telecom network forensic operations and research.
