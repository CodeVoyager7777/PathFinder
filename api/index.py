"""
index.py — FastAPI serverless entrypoint for Vercel.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .graph import NODES, EDGES, ADJACENCY
    from .astar import astar
except ImportError:
    from graph import NODES, EDGES, ADJACENCY
    from astar import astar

app = FastAPI(
    title="PathFinder API",
    description="A* Search Visualizer API on Vercel",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    start: str
    end: str

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "PathFinder API on Vercel is running"}

@app.get("/graph")
@app.get("/api/graph")
def get_graph():
    nodes_out = [
        {"id": k, "label": v["label"], "x": v["x"], "y": v["y"]}
        for k, v in NODES.items()
    ]
    edges_out = [
        {"from": a, "to": b, "weight": w}
        for a, b, w in EDGES
    ]
    return {"nodes": nodes_out, "edges": edges_out}

@app.post("/search")
@app.post("/api/search")
def search(req: SearchRequest):
    if req.start not in NODES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown start node: '{req.start}'.",
        )
    if req.end not in NODES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown end node: '{req.end}'.",
        )
    if req.start == req.end:
        raise HTTPException(
            status_code=400,
            detail="Start and end nodes must be different.",
        )

    return astar(req.start, req.end)
