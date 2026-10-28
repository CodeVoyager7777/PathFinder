"""
graph.py — Campus graph data for PathFinder on Vercel.
"""

NODES = {
    "main_gate":    {"label": "Main Gate",       "x": 80,  "y": 300},
    "parking":      {"label": "Parking Lot",     "x": 180, "y": 180},
    "admin":        {"label": "Admin Block",     "x": 300, "y": 120},
    "library":      {"label": "Library",         "x": 460, "y": 80},
    "auditorium":   {"label": "Auditorium",      "x": 600, "y": 140},
    "cafeteria":    {"label": "Cafeteria",       "x": 320, "y": 300},
    "lab_block":    {"label": "Lab Block",       "x": 500, "y": 280},
    "cs_dept":      {"label": "CS Department",  "x": 620, "y": 320},
    "sports":       {"label": "Sports Complex",  "x": 740, "y": 200},
    "hostel_a":     {"label": "Hostel A",        "x": 760, "y": 400},
    "hostel_b":     {"label": "Hostel B",        "x": 620, "y": 480},
    "medical":      {"label": "Medical Centre",  "x": 200, "y": 430},
    "workshop":     {"label": "Workshop",        "x": 380, "y": 440},
    "bus_stop":     {"label": "Bus Stop",        "x": 80,  "y": 480},
}

EDGES = [
    ("main_gate",  "parking",    3.5),
    ("main_gate",  "bus_stop",   2.0),
    ("main_gate",  "medical",    5.0),
    ("parking",    "admin",      3.0),
    ("parking",    "cafeteria",  5.5),
    ("admin",      "library",    4.0),
    ("admin",      "cafeteria",  4.5),
    ("library",    "auditorium", 3.5),
    ("library",    "lab_block",  5.0),
    ("auditorium", "sports",     4.0),
    ("auditorium", "cs_dept",    5.5),
    ("cafeteria",  "lab_block",  3.5),
    ("cafeteria",  "medical",    4.0),
    ("cafeteria",  "workshop",   3.0),
    ("lab_block",  "cs_dept",    3.0),
    ("cs_dept",    "sports",     4.5),
    ("cs_dept",    "hostel_a",   4.0),
    ("cs_dept",    "hostel_b",   3.5),
    ("sports",     "hostel_a",   3.5),
    ("hostel_a",   "hostel_b",   4.0),
    ("hostel_b",   "workshop",   4.5),
    ("workshop",   "medical",    4.5),
    ("bus_stop",   "medical",    3.5),
]

def build_adjacency_list() -> dict:
    graph: dict = {node: [] for node in NODES}
    for a, b, w in EDGES:
        graph[a].append((b, w))
        graph[b].append((a, w))
    return graph

ADJACENCY = build_adjacency_list()
