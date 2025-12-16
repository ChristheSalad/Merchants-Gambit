Merchants Gambit
Christian Saldana Jorge Vasquez Jaden Arredondo
University of Texas Rio Grande Valley
Abstract
This proposal outlines the design, theoretical grounding, computational model, and planned
software implementation of the game Merchants Gambit, created for the final project in Game
Theory and Complexity. The game is an adversarial connection-building and disruption game
played on an 8 × 8 grid. This document presents (1) a project description, (2) formal and
theoretical analysis, (3) complexity considerations, and (4) intended software development plans
including AI difficulty scaling.
1 Team Description
Our team consists of Christian Saldana, Jorge Vasquez, and Jaden Arredondo. We chose to work
together because we share strong interest in combinatorial strategy games and jointly preferred
the Merchants Gambit concept. Each member contributes complementary strengths: Christian in
theoretical modeling, Jorge in software implementation, and Jaden in design and playtesting. Our
collaboration ensures a balanced development workflow across theory, gameplay, and programming.
2 Game Description
2.1 Concept Overview
Merchants Gambit is a two-player adversarial race game. Each player represents a merchant at-
tempting to secretly deliver a convoy to the opponent’s castle “Trojan horse style.” Players con-
struct roads, traverse them, and selectively attack enemy road segments, all while constrained by
a global connectivity rule that ensures both castles remain mutually reachable. The first convoy to
reach the opposing castle wins.
2.2 Evolution and Design Focus
The initial design centered on road construction and sabotage, but playtesting revealed that un-
restricted destruction created degenerate states with no legal moves. This led to the introduction
of:
• A connectivity preservation rule: no attack may disconnect castles.
• A 3-turn cooldown on attacks to prevent over-aggression.
• A refined model of tiles as having 4 directed edges rather than a single traversable cell.
User feedback also emphasized the need for combat interactions, resulting in the convoy battle
mechanism triggered when two convoys occupy the same road segment.
1

3 Formal Model
3.1 Board and Components
The game is played on an 8 × 8 grid. Each tile has 4 undirected edges. Each player has:
• 1 castle located on their home row,
• 1 convoy piece,
• road markers,
• blockade markers (permanently destroyed edges),
• a die for combat resolution.
3.2 State Representation
A full game state is a tuple
S = (G, p, k
1
, k
2
, r
1
, r
2
, b
1
, b
2
, cd
1
, cd
2
)
where:
• G: a graph on 64 vertices and up to 224 edges (4 per tile),
• p ∈ {1, 2}: current player’s turn,
• k
i
: position of player i’s convoy,
• r
i
: remaining road placements for player i,
• b
i
: remaining destructible edges for player i,
• cd
i
: attack cooldown timer in {0, 1, 2, 3}.
3.3 Actions
Each turn, a player chooses exactly one action:
Build Road. Place an undeveloped edge adjacent to the player’s reachable network.
Move Convoy. Move the convoy along a built edge to an adjacent tile.
Attack Edge. Destroy a single built edge, provided:
• cd
i 
= 0,
• its removal does not disconnect both castles in G.
Then set cd
i 
:= 3.
Pass. If no legal action exists.
3.4 Rules and Constraints
• Connectivity Rule: Let c
1
, c
2 
be the castle nodes. For any action modifying G, the resulting
graph G
′ 
must satisfy:
c
1 
↭ c
2 
in G
′
.
• Combat: If two convoys occupy the same edge, each rolls a die; the initiator adds +1. The
winner receives an extra action at no turn cost.
• Victory: A player wins by moving their convoy onto the opponent’s castle vertex.
2

4 Background and Related Work
4.1 Similar Game Structures in Literature
Merchants Gambit combines elements studied in:
• Connection games (Hex, Twixt): analysis of guaranteed connectivity.
• Edge-deletion games: blocking and sabotage strategies (e.g., Shannon Switching Game).
• Pursuit-evasion on graphs: convoy interactions resemble pursuit combat.
• Network reliability theory: enforcing connectivity after edge removals.
Techniques from these domains (e.g., cut-vertex analysis, Menger’s theorem) inform our ap-
proach in determining valid attacks and analyzing first-player advantage.
4.2 Small-Board Exhaustive Solutions
We will exhaustively solve n × n versions for n ≤ 3. Preliminary reasoning suggests:
• 2 × 2 boards produce trivial forced wins for Player 1.
• 3 × 3 boards may be winnable for Player 2 by optimal road denial.
A full software solver will enumerate all reachable graphs under the connectivity constraint.
5 CGT Analysis
5.1 Normal Play Convention
The game is a finite, loop-free, alternating-move, deterministic, perfect-information win/lose game
except for stochastic combat roll resolution. Removing dice randomness yields a deterministic
underlying CGT skeleton.
5.2 Hot and Cold Positions
Building a road adjacent to a player’s network often increases their mobility—a “hot” move. At-
tacking an edge that reduces an opponent’s shortest path while preserving global connectivity is
also hot. In contrast, moves that maintain equal connectivity structures for both players are “cold”.
5.3 Dominated Options
Any attack creating a near-cut edge where only one remaining path exists is often dominated,
because the opponent can respond by building a stabilizing road. We will classify all dominated
moves on 3 × 3 boards.
5.4 Potential Values
For simplified deterministic variants, local subgraphs resemble sums of Hackenbush-like green edges.
We conjecture that road segments behave like positive-value components, while attackable edges
correspond to negative-value types. Formal decomposition will be attempted for n ≤ 3.
3

6 Complexity Analysis
6.1 Circuit Complexity
Verifying whether a move is legal requires:
• testing adjacency constraints,
• verifying connectivity after edge insertion/removal.
Connectivity verification can be implemented by an N C
1 
circuit via reachability reductions, giving
upper bound:
LEGAL-MOVE ∈ N C
1
.
6.2 Computational Complexity
The full problem:
WINNING-MOVE(S) = Does player p have a forced win from S?
is analogous to general graph-building games.
Because:
• the game graph grows exponentially in |G|,
• attack choices depend on global constraints,
we conjecture the decision problem is PSPACE-hard (similar to Geography, Hex, and Shannon
Switching). A reduction from Hex appears feasible since edge-building enforces connectivity struc-
tures.
7 Software and Implementation Plan
7.1 Technologies
The digital version of the game will be implemented using:
• HTML for board layout,
• CSS for styling and piece representation,
• JavaScript for rules, game logic, legal move verification, pathfinding, and combat.
7.2 Flowchart and System Design
Main modules:
1. Board Representation Module (graph with tile-edge structure)
2. Move Validator (connectivity and cooldown rules)
3. Combat Module (dice rolling)
4. Game Loop Controller (turn sequencing)
5. AI Module (difficulty scaling)
4

7.3 AI Difficulty Slider
The AI will have difficulty levels controlling:
• search depth in minimax tree,
• probabilistic error rate,
• aggressiveness in attacking edges,
• preference for shortest-path expansion.
Higher difficulty decreases random error and increases horizon in pathfinding and sabotage planning.
8 Conclusion
This proposal outlines the gameplay, theoretical foundations, computational model, and imple-
mentation plan for Merchants Gambit. The project integrates graph theory, game theory, CGT
structure, and software development. The final implementation will include a full playable web
version, AI opponents, and analytical tools for small-board perfect play.
5