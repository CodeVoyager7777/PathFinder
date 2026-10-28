# PathFinder — Real Human Prompt History

This is the exact, authentic conversation flow a human developer uses with an AI assistant to build, polish, and deploy this project from scratch:

---

### Prompt 1 (The initial dump of the project vision)
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

### Prompt 2 (Approving the plan)
> "The plan looks good. Let's build and test the backend first."

---

### Prompt 3 (Building the UI)
> "Let's proceed with Phase 2. Build the React + Vite + Tailwind frontend for PathFinder using the existing FastAPI backend. Start by creating the main layout and interactive graph visualization.. then connect it to the API. Include manual step-by-step playback and automatic playback controls. Keep the design modern with dark glassmorphism styling, and make sure the node states and g(n), h(n), and f(n) values reflect the actual backend trace. Don't rewrite the working backend unless an issue requires it. Test the frontend and API integration before moving on."

---

### Prompt 4 (Visual feedback / tweak)
> "Remove algorithm & viva guide section"

---

### Prompt 5 (Asking for deployment)
> "Deploy it on vercel"

---

### Prompt 6 (Asking what to do next after git push)
> "PS D:\PathFinder> git push -u origin main
> Enumerating objects: 30, done.
> Counting objects: 100% (30/30), done.
> ...
> what after this?"

---

### Prompt 7 (Pasting the Vercel prompt + confusion)
> "Configure this repository to deploy on Vercel as a project with multiple services.
> 
> [pasting Vercel's suggested vercel.json snippet]
> 
> I can't see the deploy button"

---

### Prompt 8 (Pasting Vercel's build error)
> "01:10:23.338 Error: [MISSING_SERVICE_CONFIG] Service "backend" detected framework "fastapi" in "backend" and must specify an "entrypoint" for runtime "python"."
