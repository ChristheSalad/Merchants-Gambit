# Merchants Gambit

[cite_start]**Authors:** Christian Saldana, Jorge Vasquez, Jaden Arredondo [cite: 2, 8]  
[cite_start]**University:** University of Texas Rio Grande Valley [cite: 2]  
[cite_start]**Course:** Game Theory and Complexity - Final Project [cite: 4]

## Abstract

[cite_start]Merchants Gambit is an adversarial strategy game played on a grid, combining path-building and sabotage mechanics with a strict global connectivity constraint[cite: 5, 15]. [cite_start]Players must navigate a "Trojan Horse" style convoy to the opposing player's castle to win[cite: 14]. This software implementation demonstrates the application of various AI techniques—ranging from heuristics to Large Language Models (LLMs)—to solve dynamic pathfinding and blocking problems.

## Game Description

### Concept Overview
[cite_start]Merchants Gambit is a two-player race game[cite: 14]. Each player represents a merchant attempting to secretly deliver a convoy to the opponent’s castle. [cite_start]Players construct roads, traverse them, and selectively attack enemy road segments[cite: 15]. [cite_start]The game is constrained by a global connectivity rule ensuring that a path between the two castles always remains possible[cite: 15].

### Rules & Mechanics (Current Implementation)

* [cite_start]**Board:** The game is played on a **10x10 grid** (updated from original 8x8 design)[cite: 5].
* [cite_start]**Objective:** The first player to move their Convoy onto the opponent's Castle wins[cite: 59].
* **Shared Infrastructure:** Unlike standard connection games, built roads are shared; players may traverse roads built by their opponent.
* [cite_start]**Actions:** On their turn, a player must choose exactly one action[cite: 44]:
    1.  [cite_start]**Build Road:** Place a road on an empty tile adjacent to the player's Convoy or any existing road[cite: 45].
    2.  [cite_start]**Move Convoy:** Move the convoy to an adjacent tile containing a road or castle[cite: 46].
    3.  [cite_start]**Attack:** Destroy an existing road tile[cite: 47].

### Constraints & Cooldowns
* [cite_start]**Connectivity Rule:** An attack is illegal if removing the road would disconnect the two castles, making victory impossible for either side[cite: 20, 54].
* [cite_start]**Attack Cooldown:** To prevent degenerate states, players must wait **5 turns** after attacking before they can attack again (updated from original 3-turn design)[cite: 21].
* **Safety:** Castles and tiles currently occupied by a convoy cannot be attacked.

## AI Implementation

[cite_start]The project features a scalable AI difficulty system[cite: 121], implementing three distinct algorithms:

### 1. Easy Mode: "The Selfish Builder" (Heuristic)
* **Logic:** Uses a simple Manhattan Distance heuristic to move towards the goal.
* **Strategy:** If blocked, it builds roads extending exclusively from its own convoy. It is non-aggressive and rarely uses attacks.

### 2. Medium Mode: "The Planner" (MCTS)
* **Logic:** Monte Carlo Tree Search (MCTS) with a Greedy Simulation policy.
* **Strategy:** Simulates hundreds of future game states per turn. Unlike random MCTS, the simulation phase is biased to prioritize moves that reduce distance to the goal, allowing the AI to "plan" paths and blocks effectively without an LLM.

### 3. Hard Mode: "The Strategist" (Gemini LLM)
* **Logic:** Integration with Google's **Gemini 1.5 Flash** model.
* **Strategy:** The board state is serialized into text and analyzed by the LLM to determine high-level strategy (e.g., identifying when to block an opponent vs. when to rush the goal).
* **Fallback:** Includes a safety mechanism that reverts to MCTS logic if the API fails or attempts an illegal move (e.g., attacking during cooldown).

## Technical Stack

* [cite_start]**Frontend:** HTML5 for board layout[cite: 110].
* [cite_start]**Styling:** CSS for piece representation and responsive design[cite: 111].
* [cite_start]**Logic:** Vanilla JavaScript for rules, move verification, graph connectivity checks (BFS), and AI integration[cite: 112].

## Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-repo/merchants-gambit.git](https://github.com/your-repo/merchants-gambit.git)
    ```

2.  **Configure AI (Hard Mode):**
    * Open `script.js`.
    * Locate the `hardAI()` function.
    * Replace `INSERT_YOUR_GEMINI_API_KEY_HERE` with your valid Google Gemini API Key.

3.  **Run:**
    * Open `index.html` in a web browser.
    * *Note:* To avoid CORS errors with the LLM API, running through a local server (like VS Code Live Server) is recommended.

## Complexity Analysis

* [cite_start]**Legal Move Verification:** The connectivity constraint is verified using Breadth-First Search (BFS), ensuring valid graph states efficiently[cite: 97].
* [cite_start]**Game Complexity:** The combination of road building and destruction creates a branching factor similar to general graph-building games, where determining a forced win is computationally intensive (PSPACE-hard considerations)[cite: 105].