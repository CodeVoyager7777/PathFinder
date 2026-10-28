# PathFinder — LLM Prompt Recipe & Build History

Use the prompts below with any modern LLM (Claude, ChatGPT, Gemini, DeepSeek, etc.) to recreate the complete **PathFinder** A* Heuristic Search Visualizer project from scratch.

You can feed this either as a single **Master Mega-Prompt** (Option 1) or as a **3-Phase Step-by-Step Prompt Sequence** (Option 2).

---

## Option 1: The Master Mega-Prompt (Single Shot)

Copy and paste the entire prompt below into any capable coding LLM:

```markdown
Create a complete full-stack web project called "PathFinder" — an interactive, modern visualizer demonstrating the A* Heuristic Search algorithm on a 2D campus graph. The project must have a dark glassmorphism aesthetic and be designed for deployment on Vercel as a multi-service project (FastAPI backend + React/Vite frontend).

### 1. Architecture & Tech Stack
- Backend: Python 3.11+, FastAPI, Uvicorn, Pydantic. Directory: `/backend`
- Frontend: React 18, Vite, Tailwind CSS (v3). Directory: `/frontend`
- Deployment: Vercel Services multi-service configuration (`vercel.json`)
- Communication: REST API with Vite local dev proxy and Vercel routing (`/api/*`)

---

### 2. Backend Requirements (`/backend`)

#### Graph Data (`graph.py`)
- Define 14 named university campus nodes with 2D coordinates (SVG viewBox scale 0-900 width, 0-560 height):
  - main_gate (80, 300), parking (180, 180), admin (300, 120), library (460, 80), auditorium (600, 140), cafeteria (320, 300), lab_block (500, 280), cs_dept (620, 320), sports (740, 200), hostel_a (760, 400), hostel_b (620, 480), medical (200, 430), workshop (380, 440), bus_stop (80, 480).
- Define 23 undirected weighted edges with realistic campus walking distances (weights between 2.0 and 5.5).
- Provide a helper function `build_adjacency_list()` returning an undirected adjacency map.

#### A* Algorithm From Scratch (`astar.py`)
- Implement A* from scratch using Python's standard `heapq` module (min-heap priority queue).
- Heuristic h(n): Straight-line Euclidean distance between node coordinates divided by SCALE=30.0 (ensuring the heuristic is admissible and does not overestimate edge travel costs).
- Cost functions:
  - g(n): Exact accumulated distance from start node.
  - h(n): Scaled Euclidean distance to target.
  - f(n) = g(n) + h(n): Evaluation priority score.
- Instead of just returning the final path, record and return a full step-by-step execution trace so the frontend can replay the search:
  - `step`: step index number.
  - `action`: detailed plain-English sentence describing the algorithm's decision (e.g. "Expanding 'Library' — lowest f(n) in open set. g(n)=4.00, h(n)=3.50, f(n)=7.50. Added/updated neighbours: 'Auditorium' (f=7.50)").
  - `current_node`: ID of the node currently popped and evaluated.
  - `g`, `h`, `f`: scores of the current node.
  - `closed_set`: list of all expanded nodes so far.
  - `open_set`: list of snapshots of all candidates currently in the priority queue sorted by f(n) ascending, each with `{node, label, g, h, f}`.
  - `path_so_far`: reconstructed shortest path from start to current node.
- Response payload must return `{ found: bool, path: list[str], total_cost: float, steps: list[dict] }`.

#### FastAPI Server (`main.py`)
- Add CORS middleware allowing `*`.
- Endpoints (support both `/` and `/api/` prefixes for seamless Vercel routing):
  - `GET /health` & `GET /api/health` -> returns `{"status": "ok"}`
  - `GET /graph` & `GET /api/graph` -> returns nodes array with coordinates and edges array with weights
  - `POST /search` & `POST /api/search` -> accepts `{ start: str, end: str }`, validates inputs, executes `astar(start, end)`, and returns the complete trace.

---

### 3. Frontend Requirements (`/frontend`)

#### Styling & Theme
- Dark futuristic glassmorphism aesthetic:
  - Background: Deep slate/navy `#070b14` with subtle radial gradient and SVG dot grid.
  - Panels: Frosted glass (`bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl`).
  - Font: Clean sans-serif (Inter).
  - Glowing accents and smooth CSS transitions on nodes and lines.

#### Layout
Two-panel responsive layout:
1. **Left Canvas (Main Area)**:
   - Full interactive SVG graph canvas rendered in a 900x560 viewBox.
   - Nodes color-coded by state:
     - 🟢 Start Node (green glow halo)
     - 🔴 Target Node (red glow halo)
     - 🟠 Current Expanding Node (pulsing orange halo)
     - 🟡 Open Set / Priority Queue (amber glow)
     - 🔵 Closed Set (slate blue)
     - 🟣 Optimal Path (neon purple trail with thick glow on traversed edges)
   - Edge lines with small dark weight badges displaying distance numbers.
   - Interactive hover tooltips displaying node name, state, and current g(n), h(n), f(n) evaluation scores.

2. **Right Sidebar**:
   - **Controls Panel**:
     - Start Node & Destination Node dropdown selectors with color badges.
     - "Execute A* Search" gradient button with loading spinner.
     - Interactive step progress bar with step counter.
     - Playback controls: Step Backward (◀), Auto Play / Pause (▶ / ⏸), Step Forward (▶), and Reset button.
     - Playback speed slider (200ms to 2000ms delay per step).
   - **Step Explainer Panel**:
     - Badge highlighting the current node being evaluated.
     - 3 prominent metrics cards displaying live `g(n)`, `h(n)`, and `f(n)`.
     - Plain-English dynamic action description explaining the algorithm's choices at the exact step.
     - Success banner showing optimal path and total path cost upon completion.
   - **Open Set (Priority Queue) Panel**:
     - Count chips for Open nodes vs. Closed nodes.
     - Live scrollable table of all candidates currently in the min-heap sorted by f(n) ascending.
     - Top row highlighted with a pulsing "Next" tag showing which node A* will explore next.
     - Final optimal route waypoint sequence displayed when search completes.

#### Vite Configuration
- Set up Vite development server proxy in `vite.config.js` forwarding `/api` to `http://127.0.0.1:8000`.
- In React code, call `const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'`.

---

### 4. Vercel Multi-Service Configuration (`vercel.json`)
At the project root, provide a valid `vercel.json` utilizing the Vercel Services specification:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "entrypoint": "main.py"
    },
    "frontend": {
      "root": "frontend"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "service": "frontend"
      }
    }
  ]
}
```

Provide the complete, unabridged, production-ready code for all files across both services without placeholders or ellipses.
```

---

## Option 2: Step-by-Step Prompt Sequence

If you prefer building and verifying phase by phase (recommended for interactive coding assistants):

### Prompt 1 — Backend & Core A* Implementation
> "I want to build the backend for an A* search visualizer called PathFinder in Python with FastAPI. 
> 1. Create a campus graph with 14 named nodes and 2D SVG coordinates (900x560 space) and 23 weighted undirected edges in `backend/graph.py`.
> 2. In `backend/astar.py`, implement the A* algorithm from scratch using Python's `heapq`. Use scaled Euclidean distance as the admissible heuristic h(n). In addition to finding the shortest path, record an expansion trace at every step: current node, g(n), h(n), f(n), snapshot of open set sorted by f(n), closed set, and a human-readable string explaining the step.
> 3. In `backend/main.py`, create a FastAPI app with CORS and endpoints: `GET /graph` and `POST /search` (taking start and end node IDs). Support both `/` and `/api/` path prefixes.
> 4. Provide `backend/requirements.txt` with fastapi, uvicorn[standard], and pydantic. Include a standalone test block in `astar.py` to verify the algorithm."

### Prompt 2 — Frontend & Glassmorphism Visualization
> "Now let's build the frontend for PathFinder using React 18, Vite, and Tailwind CSS in `/frontend`.
> 1. The UI must have a dark glassmorphism design (`#070b14` background, frosted-glass panels with `backdrop-blur`, subtle borders, neon accents).
> 2. Create `GraphCanvas.jsx`: An SVG renderer that displays the 14 campus nodes and 23 weighted edges. Color-code nodes dynamically based on search state (Green for start, Red for target, Orange for current expanding node, Amber for open set, Blue for closed set, Purple for final optimal path). Show edge weights and add SVG hover tooltips displaying live g(n), h(n), f(n) scores.
> 3. Create `ControlPanel.jsx`: Dropdowns for start and destination nodes, an 'Execute A* Search' button, step progress bar, Auto Play / Pause, manual Step Forward and Step Backward buttons, and a playback speed slider (200ms–2000ms).
> 4. Create `StepExplainer.jsx`: Displays 3 cards for g(n), h(n), f(n), an expanding node pill, and a plain-English explanation of why this node was chosen and which neighbours were added/updated.
> 5. Create `StatsPanel.jsx`: Displays counts for open and closed nodes, plus a live table of the Open Set (priority queue) sorted by f(n) with a 'Next' indicator on the top candidate.
> 6. Wire everything in `App.jsx` with an animation timer that steps through the backend trace. Configure Vite proxy in `vite.config.js` to route `/api` to `http://localhost:8000`."

### Prompt 3 — Vercel Multi-Services Deployment Setup
> "Configure the PathFinder repository for full-stack deployment on Vercel as a multi-service project.
> 1. At the root, create `vercel.json` using the `$schema: https://openapi.vercel.sh/vercel.json` Services schema.
> 2. Define two services: `backend` (root: `backend`, entrypoint: `main.py`) and `frontend` (root: `frontend`).
> 3. Configure top-level rewrites so `/api/(.*)` routes to `backend`, and `/(.*)` routes to `frontend`.
> 4. Ensure `frontend/src/App.jsx` uses `import.meta.env.VITE_API_BASE_URL || '/api'` so API calls work seamlessly both in local development and in production on Vercel.
> 5. Add `.gitignore` to prevent committing `node_modules`, `dist`, or `__pycache__`."
