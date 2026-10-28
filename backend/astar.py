"""
astar.py — A* search algorithm implemented from scratch.

Core concepts:
  g(n)  — actual cost from the start node to node n
  h(n)  — heuristic estimate from n to the goal (Euclidean distance)
  f(n)  — total estimated cost: f(n) = g(n) + h(n)

The algorithm always expands the node in the open set with the lowest f(n),
which guarantees the shortest path when the heuristic is admissible
(i.e., never overestimates the true cost).

Euclidean distance is admissible here because edge weights represent
physical distances and can never be shorter than the straight-line distance.

This implementation records every step so the frontend can replay the
search visually, one step at a time.
"""

import heapq
import math
from graph import NODES, ADJACENCY


# ---------------------------------------------------------------------------
# Heuristic
# ---------------------------------------------------------------------------

def euclidean(node_a: str, node_b: str) -> float:
    """
    Straight-line (Euclidean) distance between two nodes using their
    SVG canvas coordinates.  h(n) = sqrt( (x2-x1)^2 + (y2-y1)^2 ) / SCALE

    We divide by a SCALE factor so that h(n) is in the same units as the
    edge weights (which are in campus-distance units, not pixels).
    """
    SCALE = 30.0  # pixels per campus-distance unit — tune to match edge weights
    x1, y1 = NODES[node_a]["x"], NODES[node_a]["y"]
    x2, y2 = NODES[node_b]["x"], NODES[node_b]["y"]
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / SCALE


# ---------------------------------------------------------------------------
# A* search
# ---------------------------------------------------------------------------

def astar(start: str, goal: str) -> dict:
    """
    Run A* from `start` to `goal` and return a full step-by-step trace.

    Returns a dict:
    {
        "found": bool,
        "path": [node_id, ...],          # final optimal path (empty if not found)
        "total_cost": float,
        "steps": [                        # one entry per expansion
            {
                "step": int,
                "action": str,           # human-readable description
                "current_node": str,
                "g": float,
                "h": float,
                "f": float,
                "open_set": [            # snapshot of open set AFTER this step
                    {"node": str, "g": float, "h": float, "f": float}, ...
                ],
                "closed_set": [str, ...],
                "path_so_far": [str, ...],  # best path to current_node
            },
            ...
        ]
    }
    """

    # -----------------------------------------------------------------------
    # Data structures
    # -----------------------------------------------------------------------

    # Priority queue: entries are (f_value, tie_breaker, node_id)
    # tie_breaker (insertion counter) prevents comparison of strings if f ties
    open_heap: list = []
    counter = 0  # tie-breaker

    # g_score[n]  — cheapest known cost from start to n
    g_score: dict = {node: math.inf for node in NODES}
    g_score[start] = 0.0

    # came_from[n] — which node we arrived at n from (for path reconstruction)
    came_from: dict = {}

    # Nodes that have been fully expanded
    closed_set: set = set()

    # Track which nodes are currently in the open heap (for O(1) membership)
    in_open: set = {start}

    # Initialise with the start node
    h_start = euclidean(start, goal)
    f_start = g_score[start] + h_start
    heapq.heappush(open_heap, (f_start, counter, start))

    steps = []
    step_number = 0

    # -----------------------------------------------------------------------
    # Helper: reconstruct path from came_from map
    # -----------------------------------------------------------------------
    def reconstruct_path(node: str) -> list:
        path = []
        current = node
        while current in came_from:
            path.append(current)
            current = came_from[current]
        path.append(start)
        path.reverse()
        return path

    # -----------------------------------------------------------------------
    # Helper: snapshot of the current open set (for frontend display)
    # -----------------------------------------------------------------------
    def open_set_snapshot() -> list:
        snapshot = []
        # Walk the heap entries; skip stale entries (nodes already closed)
        seen = set()
        for f_val, _, nid in open_heap:
            if nid not in seen and nid not in closed_set:
                seen.add(nid)
                g_val = g_score[nid]
                h_val = euclidean(nid, goal)
                snapshot.append({
                    "node": nid,
                    "label": NODES[nid]["label"],
                    "g": round(g_val, 2),
                    "h": round(h_val, 2),
                    "f": round(g_val + h_val, 2),
                })
        # Sort by f so the frontend shows them in priority order
        snapshot.sort(key=lambda x: x["f"])
        return snapshot

    # -----------------------------------------------------------------------
    # Main loop
    # -----------------------------------------------------------------------
    while open_heap:
        f_current, _, current = heapq.heappop(open_heap)

        # Skip stale heap entries (a better path was already found)
        if current in closed_set:
            continue

        in_open.discard(current)
        closed_set.add(current)

        g_current = g_score[current]
        h_current = euclidean(current, goal)
        f_current_actual = g_current + h_current

        path_so_far = reconstruct_path(current)

        # --- Build human-readable action description -------------------------
        if current == start:
            action = (
                f"Starting at '{NODES[start]['label']}'. "
                f"g(n)=0, h(n)={h_current:.2f}, f(n)={f_current_actual:.2f}. "
                f"Exploring neighbours..."
            )
        elif current == goal:
            action = (
                f"Reached the goal '{NODES[goal]['label']}'! "
                f"Total path cost = {g_current:.2f}. "
                f"Optimal path found!"
            )
        else:
            action = (
                f"Expanding '{NODES[current]['label']}' — lowest f(n) in open set. "
                f"g(n)={g_current:.2f} (cost from start), "
                f"h(n)={h_current:.2f} (estimated distance to goal), "
                f"f(n)={f_current_actual:.2f}."
            )

        step_number += 1
        step_entry = {
            "step": step_number,
            "action": action,
            "current_node": current,
            "g": round(g_current, 2),
            "h": round(h_current, 2),
            "f": round(f_current_actual, 2),
            "closed_set": list(closed_set),
            "path_so_far": path_so_far,
            "open_set": [],  # filled after neighbour processing below
        }

        # Goal reached — record final step and stop
        if current == goal:
            step_entry["open_set"] = open_set_snapshot()
            steps.append(step_entry)
            return {
                "found": True,
                "path": path_so_far,
                "total_cost": round(g_current, 2),
                "steps": steps,
            }

        # --- Process neighbours ---------------------------------------------
        neighbour_updates = []  # for the action description
        for neighbour, weight in ADJACENCY[current]:
            if neighbour in closed_set:
                continue  # already fully explored — skip

            tentative_g = g_current + weight

            if tentative_g < g_score[neighbour]:
                # Found a better path to this neighbour
                came_from[neighbour] = current
                g_score[neighbour] = tentative_g
                h_neighbour = euclidean(neighbour, goal)
                f_neighbour = tentative_g + h_neighbour
                counter += 1
                heapq.heappush(open_heap, (f_neighbour, counter, neighbour))
                in_open.add(neighbour)
                neighbour_updates.append(
                    f"'{NODES[neighbour]['label']}' (f={f_neighbour:.2f})"
                )

        if neighbour_updates:
            step_entry["action"] += (
                f" Added/updated neighbours: {', '.join(neighbour_updates)}."
            )
        else:
            step_entry["action"] += " No new neighbours to add."

        step_entry["open_set"] = open_set_snapshot()
        steps.append(step_entry)

    # Open set exhausted — no path exists
    steps.append({
        "step": step_number + 1,
        "action": (
            f"Open set is empty. No path exists from "
            f"'{NODES[start]['label']}' to '{NODES[goal]['label']}'."
        ),
        "current_node": None,
        "g": 0, "h": 0, "f": 0,
        "closed_set": list(closed_set),
        "path_so_far": [],
        "open_set": [],
    })
    return {
        "found": False,
        "path": [],
        "total_cost": 0,
        "steps": steps,
    }


# ---------------------------------------------------------------------------
# Quick self-test (run: python astar.py)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    result = astar("main_gate", "hostel_a")
    print(f"Found: {result['found']}")
    print(f"Path:  {' -> '.join(result['path'])}")
    print(f"Cost:  {result['total_cost']}")
    print(f"Steps: {len(result['steps'])}")
    print()
    for s in result["steps"]:
        print(f"[Step {s['step']}] {s['action']}")
