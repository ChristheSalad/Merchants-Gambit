// WLD Tree Generator for Merchant's Gambit (4x2 board)
// Win condition: Reach opponent's castle

class GameState {
    constructor(board, player1Pos, player2Pos, currentPlayer, lastAttackTurn, turnNumber) {
        // Board: 4x2 grid
        // 0 = empty, 1 = player1 road, 2 = player2 road, -1 = destroyed
        this.board = board.map(row => [...row]);
        this.player1Pos = player1Pos; // [row, col]
        this.player2Pos = player2Pos; // [row, col]
        this.currentPlayer = currentPlayer; // 1 or 2
        this.lastAttackTurn = {...lastAttackTurn}; // {1: turn, 2: turn}
        this.turnNumber = turnNumber;
    }

    clone() {
        return new GameState(
            this.board,
            [...this.player1Pos],
            [...this.player2Pos],
            this.currentPlayer,
            this.lastAttackTurn,
            this.turnNumber
        );
    }

    // Check if a path exists from player1 castle to player2 castle
    pathExists() {
        const ROWS = 4;
        const COLS = 2;
        const visited = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
        
        // Find player1 castle (bottom row, row 3)
        let startRow = 3;
        let startCol = -1;
        for (let c = 0; c < COLS; c++) {
            if (this.board[startRow][c] === 1 || this.board[startRow][c] === 2) {
                startCol = c;
                break;
            }
        }
        if (startCol === -1) return false;

        // Find player2 castle (top row, row 0)
        let endRow = 0;
        let endCol = -1;
        for (let c = 0; c < COLS; c++) {
            if (this.board[endRow][c] === 1 || this.board[endRow][c] === 2) {
                endCol = c;
                break;
            }
        }
        if (endCol === -1) return false;

        // BFS to find path
        const queue = [[startRow, startCol]];
        visited[startRow][startCol] = true;

        while (queue.length > 0) {
            const [r, c] = queue.shift();
            
            if (r === endRow && c === endCol) return true;

            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;
                
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) {
                    // Can traverse if it's a road (1 or 2) and not destroyed (-1)
                    if (this.board[nr][nc] !== null && this.board[nr][nc] !== -1) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                    }
                }
            }
        }

        return false;
    }

    // Check if the player who just moved (previous player) wins
    // Note: currentPlayer is the NEXT player to move
    isWin() {
        // Check if Player 1 won (reached row 0)
        if (this.player1Pos[0] === 0) {
            return 1;
        }
        // Check if Player 2 won (reached row 3)
        if (this.player2Pos[0] === 3) {
            return 2;
        }
        return 0; // No win
    }

    // Get all valid moves for current player
    getValidMoves() {
        const moves = [];
        const ROWS = 4;
        const COLS = 2;
        const currentPos = this.currentPlayer === 1 ? this.player1Pos : this.player2Pos;
        const opponentPos = this.currentPlayer === 1 ? this.player2Pos : this.player1Pos;

        // 1. Build road moves
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const nr = currentPos[0] + dr;
            const nc = currentPos[1] + dc;
            
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                // Can build if empty and adjacent to current position
                if (this.board[nr][nc] === null) {
                    moves.push({
                        type: 'build',
                        row: nr,
                        col: nc
                    });
                }
            }
        }

        // 2. Move convoy moves
        for (const [dr, dc] of directions) {
            const nr = currentPos[0] + dr;
            const nc = currentPos[1] + dc;
            
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                // Can move if there's a road (1 or 2) and not destroyed
                if (this.board[nr][nc] !== null && this.board[nr][nc] !== -1) {
                    moves.push({
                        type: 'move',
                        row: nr,
                        col: nc
                    });
                }
            }
        }

        // 3. Attack moves (with cooldown check)
        const attackCooldown = 3; // Using 3 as per help text
        const turnsSinceLastAttack = this.turnNumber - this.lastAttackTurn[this.currentPlayer];
        
        if (turnsSinceLastAttack >= attackCooldown) {
            // Can attack roads adjacent to opponent's position
            for (const [dr, dc] of directions) {
                const nr = opponentPos[0] + dr;
                const nc = opponentPos[1] + dc;
                
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    // Can attack if there's a road and not already destroyed
                    if (this.board[nr][nc] !== null && this.board[nr][nc] !== -1) {
                        // Check if attack would break path requirement
                        const testState = this.clone();
                        testState.board[nr][nc] = -1;
                        if (testState.pathExists()) {
                            moves.push({
                                type: 'attack',
                                row: nr,
                                col: nc
                            });
                        }
                    }
                }
            }
        }

        return moves;
    }

    // Apply a move and return new state
    applyMove(move) {
        const newState = this.clone();
        const currentPos = newState.currentPlayer === 1 ? newState.player1Pos : newState.player2Pos;

        if (move.type === 'build') {
            newState.board[move.row][move.col] = newState.currentPlayer;
        } else if (move.type === 'move') {
            if (newState.currentPlayer === 1) {
                newState.player1Pos = [move.row, move.col];
            } else {
                newState.player2Pos = [move.row, move.col];
            }
        } else if (move.type === 'attack') {
            newState.board[move.row][move.col] = -1;
            newState.lastAttackTurn[newState.currentPlayer] = newState.turnNumber;
        }

        // Switch turn
        newState.currentPlayer = newState.currentPlayer === 1 ? 2 : 1;
        newState.turnNumber += 1;

        return newState;
    }

    // Get state key for memoization
    getKey() {
        return JSON.stringify({
            board: this.board,
            p1: this.player1Pos,
            p2: this.player2Pos,
            current: this.currentPlayer,
            lastAttack: this.lastAttackTurn
        });
    }
}

// WLD Tree Solver
class WLDTree {
    constructor() {
        this.memo = new Map();
        this.nodeCount = 0;
        this.maxDepth = 0;
    }

    // Returns: 'W' (win for player who just moved), 'L' (loss), 'D' (draw)
    // From perspective of the player whose turn it is now
    solve(state, depth = 0, maxDepth = 50) {
        if (depth > maxDepth) {
            return 'D'; // Draw if too deep (prevent infinite loops)
        }
        this.nodeCount++;
        this.maxDepth = Math.max(this.maxDepth, depth);
        
        if (this.nodeCount % 1000 === 0) {
            console.error(`Exploring node ${this.nodeCount}, depth ${depth}`);
        }

        // Check for win by previous player
        const winner = state.isWin();
        if (winner === 1) {
            // Player 1 won, so if it's Player 1's turn now, they already won (return 'W')
            // If it's Player 2's turn, Player 1 won (return 'L' for Player 2)
            return state.currentPlayer === 1 ? 'W' : 'L';
        } else if (winner === 2) {
            // Player 2 won, so if it's Player 2's turn now, they already won (return 'W')
            // If it's Player 1's turn, Player 2 won (return 'L' for Player 1)
            return state.currentPlayer === 2 ? 'W' : 'L';
        }

        // Check memoization
        const key = state.getKey();
        if (this.memo.has(key)) {
            return this.memo.get(key);
        }

        const moves = state.getValidMoves();

        // If no moves available, it's a draw (or loss depending on interpretation)
        if (moves.length === 0) {
            this.memo.set(key, 'D');
            return 'D';
        }

        // Try all moves
        // Result is from opponent's perspective after we move
        let hasWin = false;
        let hasDraw = false;
        let allLoss = true;

        for (const move of moves) {
            const newState = state.applyMove(move);
            const result = this.solve(newState, depth + 1, maxDepth);

            // Result is from opponent's perspective
            // If opponent loses (L), we win (W)
            // If opponent wins (W), we lose (L)
            // If draw (D), it's a draw
            if (result === 'L') {
                hasWin = true;
                allLoss = false;
            } else if (result === 'D') {
                hasDraw = true;
                allLoss = false;
            } else if (result === 'W') {
                // Opponent wins, so this is a loss for current player
            }
        }

        // Current player wins if any move leads to opponent's loss
        // Current player loses if all moves lead to opponent's win
        // Draw if no win but some moves lead to draw
        let outcome;
        if (hasWin) {
            outcome = 'W';
        } else if (allLoss) {
            outcome = 'L';
        } else {
            outcome = 'D';
        }

        this.memo.set(key, outcome);
        return outcome;
    }

    // Generate tree visualization
    generateTree(state, depth = 0, maxDepth = 10) {
        if (depth > maxDepth) {
            return { type: 'cutoff', depth };
        }

        const moves = state.getValidMoves();
        if (moves.length === 0) {
            return { type: 'terminal', outcome: 'D', state: this.getStateString(state) };
        }

        const winner = state.isWin();
        if (winner !== 0) {
            const outcome = (winner === 1 && state.currentPlayer === 1) || 
                          (winner === 2 && state.currentPlayer === 2) ? 'W' : 'L';
            return { type: 'terminal', outcome, state: this.getStateString(state) };
        }

        const children = [];
        for (const move of moves) {
            const newState = state.applyMove(move);
            const child = this.generateTree(newState, depth + 1, maxDepth);
            children.push({
                move: `${move.type}(${move.row},${move.col})`,
                child
            });
        }

        return {
            type: 'node',
            player: state.currentPlayer,
            state: this.getStateString(state),
            children
        };
    }

    getStateString(state) {
        let str = `P${state.currentPlayer} | P1:(${state.player1Pos[0]},${state.player1Pos[1]}) P2:(${state.player2Pos[0]},${state.player2Pos[1]})\n`;
        for (let r = 0; r < 4; r++) {
            str += '[';
            for (let c = 0; c < 2; c++) {
                if (state.board[r][c] === null) str += '.';
                else if (state.board[r][c] === 1) str += '1';
                else if (state.board[r][c] === 2) str += '2';
                else if (state.board[r][c] === -1) str += 'X';
                str += ' ';
            }
            str += ']\n';
        }
        return str;
    }
}

// Initialize starting state for 4x2 board
function createInitialState() {
    // Player 1 starts at bottom (row 3), Player 2 at top (row 0)
    // Assume they start at column 0
    const board = Array(4).fill(null).map(() => Array(2).fill(null));
    
    // Place castles and initial roads
    board[3][0] = 1; // Player 1 castle
    board[0][0] = 2; // Player 2 castle
    
    return new GameState(
        board,
        [3, 0], // Player 1 position
        [0, 0], // Player 2 position
        1,      // Player 1 goes first
        { 1: 0, 2: 0 },
        1
    );
}

// Main execution
console.log("=== Merchant's Gambit WLD Tree Analysis (4x2 Board) ===\n");

const initialState = createInitialState();
const solver = new WLDTree();

console.log("Initial State:");
console.log(solver.getStateString(initialState));
console.log("\nSolving game tree...\n");

const result = solver.solve(initialState);

console.log(`Result: ${result === 'W' ? 'First Player Wins' : result === 'L' ? 'First Player Loses' : 'Draw'}`);
console.log(`Nodes explored: ${solver.nodeCount}`);
console.log(`Max depth: ${solver.maxDepth}`);
console.log(`Memoized states: ${solver.memo.size}`);

// Generate tree visualization (limited depth)
console.log("\n=== Game Tree (first 5 levels) ===");
const tree = solver.generateTree(initialState, 0, 5);
console.log(JSON.stringify(tree, null, 2));

