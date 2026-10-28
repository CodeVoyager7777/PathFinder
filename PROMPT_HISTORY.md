# PathFinder — Project Development & AI Prompt Journey

**Project:** PathFinder (A* Heuristic Search Campus Visualizer)  
**Author:** Lakshya  
**Tech Stack:** Python (FastAPI), React (Vite + Tailwind CSS), Vercel Multi-Services  

---

## 📌 Phase 1: Problem Definition & Architecture Planning

### Prompt 1 — The Idea & Tech Stack Discussion
> "I need to make an AI algorithm implementation project for my college, and I've decided to go with A* heuristic search. I want to build a visual demonstration of how the algorithm actually works.. but I don't want it to look like a basic college project with a boring graph and a few buttons.
>
> I want it to feel like a proper, modern website with a clean glassmorphism UI.. frosted-glass panels.. subtle animations, a dark background and a nice color scheme. The main focus should be showing A* in action.. how it explores nodes, compares different paths, uses g(n), h(n), and f(n) = g(n) + h(n), and eventually finds the best route.
>
> I'd like users to be able to choose a starting node and destination, run the algorithm, and see the search happen visually instead of just getting the final answer. It should also explain what's happening at each step so I can understand it and explain it during my viva.
>
> The project should look polished and realistic, with a proper layout, interactive graph, useful statistics, and a good explanation of the algorithm. It doesn't have to use real MUJ campus data if that makes things unnecessarily complicated, but the demo should be believable and the algorithm must actually work.. no fake animations or hardcoded results.
>
> Before starting, help me choose a suitable tech stack and plan the project. Keep in mind that I'm still learning Python, so I need something I can run and understand without too much setup. Let's build it step by step rather than trying to do everything at once.
>
> Tech Stack:
> - Frontend: React + Vite
> - Styling: Tailwind CSS
> - Backend: Python + FastAPI
> - Algorithm: A* heuristic search, implemented from scratch
> - Communication: REST API
>
> Before writing any code.. briefly review the tech stack. Let's build and test it step by step."

---

## 📌 Phase 2: Backend & Algorithm Implementation

### Prompt 2 — Building the Core Backend
> "The plan looks good. Let's start with Phase 1: the backend only. Write the campus graph with 14 nodes and weighted edges in `backend/graph.py`, implement A* from scratch in `backend/astar.py` using `heapq` and Euclidean heuristic, and set up the FastAPI routes in `backend/main.py`. I want to test the algorithm from the terminal first before building any UI."

### Prompt 3 — Real Debugging (Windows Unicode Terminal Error)
> *"Traceback (most recent call last):*  
> *File 'D:\PathFinder\backend\astar.py', line 263, in <module>*  
> *print(f"Path: {' \u2192 '.join(result['path'])}")*  
> *UnicodeEncodeError: 'charmap' codec can't encode character '\u2192' in position 17: character maps to <undefined>*  
> *How do I fix this error on Windows?"*

### Prompt 4 — Testing the API Endpoints
> "The self test passed. Now start the FastAPI server on port 8000 and test the `/graph` and `/search` endpoints with curl or PowerShell to verify the JSON output format."

---

## 📌 Phase 3: Frontend & Visualizer Construction

### Prompt 5 — Frontend Layout & Components
> "Let's proceed with Phase 2. Build the React + Vite + Tailwind frontend for PathFinder using the existing FastAPI backend. Start by creating the main layout and interactive graph visualization.. then connect it to the API. Include manual step-by-step playback and automatic playback controls. Keep the design modern with dark glassmorphism styling, and make sure the node states and g(n), h(n), and f(n) values reflect the actual backend trace. Don't rewrite the working backend unless an issue requires it. Test the frontend and API integration before moving on."

### Prompt 6 — UI Refinement (Removing Clutter)
> "Remove algorithm & viva guide section"

---

## 📌 Phase 4: Production Deployment on Vercel

### Prompt 7 — Requesting Deployment
> "Deploy it on vercel"

### Prompt 8 — Git Push & Verification
> "PS D:\PathFinder> git push -u origin main  
> Enumerating objects: 30, done.  
> Counting objects: 100% (30/30), done.  
> ...  
> what after this?"

### Prompt 9 — Multi-Service Configuration on Vercel
> "Configure this repository to deploy on Vercel as a project with multiple services.  
> Here is a suggested vercel.json to add to the repo root directory, auto-detected from the repository layout:  
> [pasted Vercel Services snippet]  
> I can't see the deploy button"

### Prompt 10 — Fixing the Vercel Runtime Build Error
> "01:10:23.338 Error: [MISSING_SERVICE_CONFIG] Service 'backend' detected framework 'fastapi' in 'backend' and must specify an 'entrypoint' for runtime 'python'."
