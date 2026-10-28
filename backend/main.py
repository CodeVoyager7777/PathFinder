"""
main.py — FastAPI application for the PathFinder A* visualizer.

Endpoints:
  GET  /graph          → full graph (nodes + edges) for frontend rendering
  POST /search         → run A* and return the complete step trace
  GET  /health         → simple liveness check

Run with:
  uvicorn main:app --reload --port 8000
Then open http://localhost:8000/docs for the interactive API explorer.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph import NODES, EDGES, ADJACENCY
from astar import astar

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="PathFinder API",
    description="A* heuristic search visualizer backend",
    version="1.0.0",
)

# Allow requests from the Vite dev server (port 5173) and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class SearchRequest(BaseModel):
    start: str
    end: str

    class Config:
        json_schema_extra = {
            "example": {"start": "main_gate", "end": "hostel_a"}
        }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Meta"])
@app.get("/api/health", tags=["Meta"])
def health():
    """Simple liveness check."""
    return {"status": "ok", "message": "PathFinder API is running"}


@app.get("/graph", tags=["Graph"])
@app.get("/api/graph", tags=["Graph"])
def get_graph():
    """
    Return the full campus graph: all nodes (with coordinates and labels)
    and all edges (with weights).  The frontend uses this to draw the SVG.
    """
    nodes_out = [
        {
            "id": node_id,
            "label": data["label"],
            "x": data["x"],
            "y": data["y"],
        }
        for node_id, data in NODES.items()
    ]

    edges_out = [
        {
            "from": a,
            "to": b,
            "weight": w,
        }
        for a, b, w in EDGES
    ]

    return {"nodes": nodes_out, "edges": edges_out}


@app.post("/search", tags=["Search"])
@app.post("/api/search", tags=["Search"])
def search(req: SearchRequest):
    """
    Run A* from `start` to `end` and return the full step-by-step trace.

    The response contains:
    - `found`: whether a path was found
    - `path`: the final optimal path as a list of node IDs
    - `total_cost`: total cost of the optimal path
    - `steps`: list of every expansion step with g/h/f values,
               open/closed set snapshots, and a human-readable description
    """
    # Validate node IDs
    if req.start not in NODES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown start node: '{req.start}'. "
                   f"Valid nodes: {list(NODES.keys())}",
        )
    if req.end not in NODES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown end node: '{req.end}'. "
                   f"Valid nodes: {list(NODES.keys())}",
        )
    if req.start == req.end:
        raise HTTPException(
            status_code=400,
            detail="Start and end nodes must be different.",
        )

    result = astar(req.start, req.end)
    return result
