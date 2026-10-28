"""
astar.py — A* search algorithm for Vercel deployment.
"""

import heapq
import math
from .graph import NODES, ADJACENCY

def euclidean(node_a: str, node_b: str) -> float:
    SCALE = 30.0
    x1, y1 = NODES[node_a]["x"], NODES[node_a]["y"]
    x2, y2 = NODES[node_b]["x"], NODES[node_b]["y"]
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / SCALE

def astar(start: str, goal: str) -> dict:
    open_heap: list = []
    counter = 0

    g_score: dict = {node: math.inf for node in NODES}
    g_score[start] = 0.0

    came_from: dict = {}
    closed_set: set = set()
    in_open: set = {start}

    h_start = euclidean(start, goal)
    f_start = g_score[start] + h_start
    heapq.heappush(open_heap, (f_start, counter, start))

    steps = []
    step_number = 0

    def reconstruct_path(node: str) -> list:
        path = []
        current = node
        while current in came_from:
            path.append(current)
            current = came_from[current]
        path.append(start)
        path.reverse()
        return path

    def open_set_snapshot() -> list:
        snapshot = []
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
        snapshot.sort(key=lambda x: x["f"])
        return snapshot

    while open_heap:
        f_current, _, current = heapq.heappop(open_heap)

        if current in closed_set:
            continue

        in_open.discard(current)
        closed_set.add(current)

        g_current = g_score[current]
        h_current = euclidean(current, goal)
        f_current_actual = g_current + h_current

        path_so_far = reconstruct_path(current)

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
            "open_set": [],
        }

        if current == goal:
            step_entry["open_set"] = open_set_snapshot()
            steps.append(step_entry)
            return {
                "found": True,
                "path": path_so_far,
                "total_cost": round(g_current, 2),
                "steps": steps,
            }

        neighbour_updates = []
        for neighbour, weight in ADJACENCY[current]:
            if neighbour in closed_set:
                continue

            tentative_g = g_current + weight

            if tentative_g < g_score[neighbour]:
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
