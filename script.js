document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const gameBoard = document.getElementById('game-board');
    const settingsPage = document.getElementById('settings-page');
    const helpPage = document.getElementById('help-page');
    const aboutPage = document.getElementById('about-page');

    const aiDifficultyMenu = document.getElementById('ai-difficulty-menu');
    const playerVsPlayerBtn = document.getElementById('player-vs-player');
    const playerVsAiBtn = document.getElementById('player-vs-ai');
    const easyDifficultyBtn = document.getElementById('easy-difficulty');
    const mediumDifficultyBtn = document.getElementById('medium-difficulty');
    const hardDifficultyBtn = document.getElementById('hard-difficulty');

    const settingsBtn = document.getElementById('settings');
    const helpBtn = document.getElementById('help');
    const aboutBtn = document.getElementById('about');
    const backBtns = document.querySelectorAll('.back-to-menu');

    let gameMode = null;
    let difficulty = null;

    // --- Event Listeners for Menu ---

    playerVsPlayerBtn.addEventListener('click', () => {
        gameMode = 'pvp';
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        generateBoard();
    });

    playerVsAiBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        aiDifficultyMenu.classList.remove('hidden');
    });

    easyDifficultyBtn.addEventListener('click', () => {
        gameMode = 'pve';
        difficulty = 'easy';
        aiDifficultyMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        generateBoard();
    });

    mediumDifficultyBtn.addEventListener('click', () => {
        gameMode = 'pve';
        difficulty = 'medium';
        aiDifficultyMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        generateBoard();
    });

    hardDifficultyBtn.addEventListener('click', () => {
        gameMode = 'pve';
        difficulty = 'hard';
        aiDifficultyMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        generateBoard();
    });

    settingsBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        settingsPage.classList.remove('hidden');
    });

    helpBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        helpPage.classList.remove('hidden');
    });

    aboutBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        aboutPage.classList.remove('hidden');
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mainMenu.classList.remove('hidden');
            settingsPage.classList.add('hidden');
            helpPage.classList.add('hidden');
            aboutPage.classList.add('hidden');
            aiDifficultyMenu.classList.add('hidden');
        });
    });

    // --- Game State Variables ---

    let player1Castle = null;
    let player2Castle = null;
    let player1Convoy = null;
    let player2Convoy = null;
    let currentPlayer = 1;
    let buildingRoad = false;
    let movingConvoy = false;
    let attacking = false;

    // 10x10 Board
    const board = Array(10).fill(null).map(() => Array(10).fill(null));
    const roadOwner = Array(10).fill(null).map(() => Array(10).fill(null));

    const turnDisplay = document.getElementById('turn-display');
    const buildRoadBtn = document.getElementById('build-road');
    const moveConvoyBtn = document.getElementById('move-convoy');
    const attackBtn = document.getElementById('attack');
    let turnNumber = 1;
    let lastAttackTurn = { 1: 0, 2: 0 };

    // --- Action Button Logic ---

    function updateActionSelection() {
        buildRoadBtn.classList.toggle('selected', buildingRoad);
        moveConvoyBtn.classList.toggle('selected', movingConvoy);
        attackBtn.classList.toggle('selected', attacking);
    }

    buildRoadBtn.addEventListener('click', () => {
        buildingRoad = true;
        movingConvoy = false;
        attacking = false;
        updateActionSelection();
    });

    moveConvoyBtn.addEventListener('click', () => {
        movingConvoy = true;
        buildingRoad = false;
        attacking = false;
        updateActionSelection();
    });

    attackBtn.addEventListener('click', () => {
        attacking = true;
        buildingRoad = false;
        movingConvoy = false;
        updateActionSelection();
    });

    // --- Game Flow Control ---

    function switchTurn() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnNumber += 1;

        buildingRoad = false;
        movingConvoy = false;
        attacking = false;
        updateActionSelection();

        if (gameMode === 'pve' && currentPlayer === 2) {
            turnDisplay.textContent = "AI's Turn";
            disableActionButtons();
            setTimeout(() => {
                aiTurn();
            }, 600); 
        } else {
            turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;
            enableActionButtons();
        }
    }

    function disableActionButtons() {
        moveConvoyBtn.disabled = true;
        buildRoadBtn.disabled = true;
        attackBtn.disabled = true;
    }

    function enableActionButtons() {
        moveConvoyBtn.disabled = false;
        buildRoadBtn.disabled = false;
        attackBtn.disabled = false;
    }

    // --- Board Generation & Interaction ---

    function onMouseOver(row) {
        if ((row === 0 && !player2Castle) || (row === 9 && !player1Castle)) {
            highlightRow(row);
        }
    }

    function onMouseOut(row) {
        unhighlightRow(row);
    }

    const cellListeners = new Map();

    function generateBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            const row = Math.floor(i / 10);
            const col = i % 10;
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameBoard.appendChild(cell);

            // Handle Clicks
            cell.addEventListener('click', () => {
                if (gameMode === 'pve' && currentPlayer === 2) return;
                
                if (buildingRoad) {
                    buildRoad(cell, row, col);
                } else if (movingConvoy) {
                    moveConvoy(cell, row, col);
                } else if (attacking) {
                    attackRoad(cell, row, col);
                }
            });
            
            // Handle Hover Previews (Building)
            cell.addEventListener('mouseover', () => {
                if (buildingRoad) {
                    if (board[row][col] !== null) return;
                    
                    const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;
                    if (!convoy) return;
                    
                    const convoyCell = convoy.parentElement;
                    const cr = parseInt(convoyCell.dataset.row);
                    const cc = parseInt(convoyCell.dataset.col);
                    
                    let valid = false;
                    if ((Math.abs(row - cr) === 1 && col === cc) || (Math.abs(col - cc) === 1 && row === cr)) {
                        valid = true;
                    } else {
                         const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                        for (const [dr, dc] of directions) {
                            const nr = row + dr;
                            const nc = col + dc;
                            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                                if (board[nr][nc] === 'road' || board[nr][nc] === 'castle') { 
                                    valid = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (valid) {
                        cell.classList.add('road-preview');
                    }
                }
            });

            cell.addEventListener('mouseout', () => {
                cell.classList.remove('road-preview');
            });

            // Castle Placement
            if (row === 0 || row === 9) {
                const mouseOverListener = () => onMouseOver(row);
                const mouseOutListener = () => onMouseOut(row);
                cellListeners.set(cell, { mouseOverListener, mouseOutListener });
                cell.addEventListener('mouseover', mouseOverListener);
                cell.addEventListener('mouseout', mouseOutListener);

                if (row === 0) {
                    cell.classList.add('player2-row');
                } else {
                    cell.classList.add('player1-row');
                }
                cell.addEventListener('click', () => {
                    placeCastle(cell);
                });
            }
        }
    }

    // --- Core Actions ---

    function buildRoad(cell, row, col) {
        if (cell === null) {
            cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        }

        if (board[row][col] !== null) return;

        const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;
        if (!convoy) return;
        
        const convoyCell = convoy.parentElement;
        const cr = parseInt(convoyCell.dataset.row);
        const cc = parseInt(convoyCell.dataset.col);
        
        let canBuild = false;
        
        if ((Math.abs(row - cr) === 1 && col === cc) || (Math.abs(col - cc) === 1 && row === cr)) {
            canBuild = true;
        } else {
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                    if (board[nr][nc] === 'road' || board[nr][nc] === 'castle') {
                        canBuild = true;
                        break;
                    }
                }
            }
        }

        if (canBuild) {
            board[row][col] = 'road';
            roadOwner[row][col] = currentPlayer;
            cell.style.backgroundColor = '#4169E1';
            buildingRoad = false;
            switchTurn();
        }
    }

    function attackRoad(cell, row, col) {
        // 1. Check Cooldown
        if (turnNumber - lastAttackTurn[currentPlayer] < 5) {
            // NOTE: AI should NEVER reach this block. This is a safety for Player 1.
            if(gameMode === 'pvp' || currentPlayer === 1) {
                alert(`You must wait ${5 - (turnNumber - lastAttackTurn[currentPlayer])} more turns to attack.`);
            }
            return; // EXIT WITHOUT SWITCHING TURN
        }

        // 2. Check Valid Target
        if (player1Convoy?.parentElement === cell || player2Convoy?.parentElement === cell) return;
        if (cell === player1Castle || cell === player2Castle) return;
        if (board[row][col] !== 'road') return;

        // 3. Connectivity Rule Check
        const oldValue = board[row][col];
        board[row][col] = -1; 

        if (!player1Convoy || !player2Convoy || !player1Castle || !player2Castle) {
            board[row][col] = oldValue;
            return;
        }

        const p1CastleR = parseInt(player1Castle.dataset.row, 10);
        const p1CastleC = parseInt(player1Castle.dataset.col, 10);
        const p2CastleR = parseInt(player2Castle.dataset.row, 10);
        const p2CastleC = parseInt(player2Castle.dataset.col, 10);

        const castlesConnected = checkGlobalConnectivity(board, p1CastleR, p1CastleC, p2CastleR, p2CastleC);

        if (!castlesConnected) {
            board[row][col] = oldValue; // Revert
            if(gameMode === 'pvp' || currentPlayer === 1) {
                alert("That attack would make winning impossible (disconnects castles). Attack denied.");
            }
            return;
        }

        // 4. Execute Attack
        cell.style.backgroundColor = 'red';
        attacking = false;
        lastAttackTurn[currentPlayer] = turnNumber;

        switchTurn();
    }

    function moveConvoy(cell, row, col) {
        if (cell === null) {
            cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        }
        const pawn = currentPlayer === 1 ? player1Convoy : player2Convoy;
        
        if (board[row][col] !== 'road' && cell !== player1Castle && cell !== player2Castle) return;
        
        const convoyCell = pawn.parentElement;
        const convoyRow = parseInt(convoyCell.dataset.row);
        const convoyCol = parseInt(convoyCell.dataset.col);

        const isAdjacent = (Math.abs(row - convoyRow) === 1 && col === convoyCol) || 
                           (Math.abs(col - convoyCol) === 1 && row === convoyRow);

        if (isAdjacent) {
            convoyCell.removeChild(pawn);
            cell.appendChild(pawn);

            if (currentPlayer === 1) player1Convoy = pawn;
            else player2Convoy = pawn;

            movingConvoy = false;

            const opponentCastle = currentPlayer === 1 ? player2Castle : player1Castle;
            if (cell === opponentCastle) {
                setTimeout(() => {
                    alert(`Player ${currentPlayer} wins!`);
                    mainMenu.classList.remove('hidden');
                    gameContainer.classList.add('hidden');
                    location.reload();
                }, 100);
            } else {
                switchTurn();
            }
        }
    }

    // --- Utilities ---

    function highlightRow(row) {
        const cells = document.querySelectorAll(`.grid-cell[data-row="${row}"]`);
        cells.forEach(cell => cell.classList.add('row-highlight'));
    }

    function unhighlightRow(row) {
        const cells = document.querySelectorAll(`.grid-cell[data-row="${row}"]`);
        cells.forEach(cell => cell.classList.remove('row-highlight'));
    }

    function placeCastle(cell) {
        if (buildingRoad) return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        const castle = document.createElement('span');
        castle.classList.add('castle');

        const pawn = document.createElement('span');
        pawn.classList.add('pawn');

        if (row === 9 && !player1Castle) {
            castle.innerHTML = '&#9814;';
            cell.appendChild(castle);
            pawn.innerHTML = '&#9817;';
            cell.appendChild(pawn);

            player1Castle = cell;
            player1Convoy = pawn;
            board[row][col] = 'castle';
            cell.classList.add('player1-castle');
            removeRowHighlights(9);

            if (gameMode === 'pve') {
                aiPlaceCastle();
            }
        } else if (row === 0 && !player2Castle && gameMode === 'pvp') {
            castle.innerHTML = '&#9820;';
            cell.appendChild(castle);
            pawn.innerHTML = '&#9823;';
            cell.appendChild(pawn);

            player2Castle = cell;
            player2Convoy = pawn;
            board[row][col] = 'castle';
            cell.classList.add('player2-castle');
            removeRowHighlights(0);
        }

        if (player1Castle && player2Castle) {
            document.getElementById('game-info').classList.remove('hidden');
        }
    }

    function removeRowHighlights(row) {
        const cells = document.querySelectorAll(`.grid-cell[data-row="${row}"]`);
        cells.forEach(cell => {
            cell.classList.remove('player1-row', 'player2-row', 'row-highlight');
            const listeners = cellListeners.get(cell);
            if (listeners) {
                cell.removeEventListener('mouseover', listeners.mouseOverListener);
                cell.removeEventListener('mouseout', listeners.mouseOutListener);
                cellListeners.delete(cell);
            }
        });
    }

    function aiPlaceCastle() {
        const row = 0;
        const col = Math.floor(Math.random() * 10);
        const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        const castle = document.createElement('span');
        castle.classList.add('castle');
        const pawn = document.createElement('span');
        pawn.classList.add('pawn');

        castle.innerHTML = '&#9820;';
        cell.appendChild(castle);
        pawn.innerHTML = '&#9823;';
        cell.appendChild(pawn);

        player2Castle = cell;
        player2Convoy = pawn;
        board[row][col] = 'castle';
        cell.classList.add('player2-castle');
        removeRowHighlights(0);

        if (player1Castle && player2Castle) {
            document.getElementById('game-info').classList.remove('hidden');
        }
    }

    // --- Helper Functions ---

    function checkGlobalConnectivity(boardState, startRow, startCol, goalRow, goalCol) {
        const rows = 10;
        const cols = 10;
        if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) return false;
        
        const queue = [[startRow, startCol]];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        visited[startRow][startCol] = true;
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        while (queue.length) {
            const [r, c] = queue.shift();
            if (r === goalRow && c === goalCol) return true;

            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (visited[nr][nc]) continue;
                if (boardState[nr][nc] !== -1) {
                    visited[nr][nc] = true;
                    queue.push([nr, nc]);
                }
            }
        }
        return false;
    }

    function findPathLength(startNode, endNode) {
        const queue = [{ node: startNode, dist: 0 }];
        const visited = new Set([`${startNode.r},${startNode.c}`]);
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const { node, dist } = queue.shift();
            if (node.r === endNode.r && node.c === endNode.c) return dist;

            for (const [dr, dc] of directions) {
                const newRow = node.r + dr;
                const newCol = node.c + dc;
                const key = `${newRow},${newCol}`;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 &&
                    (board[newRow][newCol] === 'road' || board[newRow][newCol] === 'castle') &&
                    !visited.has(key)) {
                    visited.add(key);
                    queue.push({ node: { r: newRow, c: newCol }, dist: dist + 1 });
                }
            }
        }
        return Infinity;
    }

    function findPathLengthForState(boardState, startNode, endNode) {
        if (!startNode || !endNode) return Infinity;
        const queue = [{ r: startNode.r, c: startNode.c, dist: 0 }];
        const visited = new Set([`${startNode.r},${startNode.c}`]);
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const { r, c, dist } = queue.shift();
            if (r === endNode.r && c === endNode.c) return dist;

            for (const [dr, dc] of directions) {
                const newRow = r + dr;
                const newCol = c + dc;
                const key = `${newRow},${newCol}`;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 &&
                    (boardState[newRow][newCol] === 'road' || boardState[newRow][newCol] === 'castle') &&
                    !visited.has(key)) {
                    visited.add(key);
                    queue.push({ r: newRow, c: newCol, dist: dist + 1 });
                }
            }
        }
        return Infinity;
    }

    function manhattanDistance(r1, c1, r2, c2) {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }

    // --- AI Logic ---

    async function aiTurn() {
        try {
            if (difficulty === 'easy') {
                await easyAI();
            } else if (difficulty === 'medium') {
                await mediumAI();
            } else if (difficulty === 'hard') {
                await hardAI();
            }
        } catch (error) {
            console.error('AI error:', error);
            await easyAI();
        }
    }

    async function easyAI() {
        const opponentCastleCell = player1Castle;
        const opponentCastleRow = parseInt(opponentCastleCell.dataset.row);
        const opponentCastleCol = parseInt(opponentCastleCell.dataset.col);
        
        const myConvoyCell = player2Convoy.parentElement;
        const myRow = parseInt(myConvoyCell.dataset.row);
        const myCol = parseInt(myConvoyCell.dataset.col);

        // 1. Priority: Move
        const possibleMoves = getPossibleMoves(2);
        let bestMove = null;
        let bestMoveDist = manhattanDistance(myRow, myCol, opponentCastleRow, opponentCastleCol);

        for (const move of possibleMoves) {
            if (move.row === opponentCastleRow && move.col === opponentCastleCol) {
                moveConvoy(null, move.row, move.col);
                return;
            }
            const dist = manhattanDistance(move.row, move.col, opponentCastleRow, opponentCastleCol);
            if (dist < bestMoveDist) {
                bestMoveDist = dist;
                bestMove = move;
            }
        }

        if (bestMove) {
            moveConvoy(null, bestMove.row, bestMove.col);
            return;
        }

        // 2. Priority: Build directly from Convoy towards goal
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let bestBuild = null;
        let minDistance = Infinity;

        for (const [dr, dc] of directions) {
            const nr = myRow + dr;
            const nc = myCol + dc;
            
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === null) {
                const dist = manhattanDistance(nr, nc, opponentCastleRow, opponentCastleCol);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestBuild = { row: nr, col: nc };
                }
            }
        }

        if (bestBuild) {
            buildRoad(null, bestBuild.row, bestBuild.col);
            return;
        }
        
        // 3. Fallback: Random legal build (if blocked)
        const allBuilds = getPossibleBuilds(2);
        if (allBuilds.length > 0) {
            const rnd = allBuilds[Math.floor(Math.random() * allBuilds.length)];
            buildRoad(null, rnd.row, rnd.col);
        } else {
            // No moves possible? Pass turn logic (should not happen often)
            console.log("AI has no moves");
            // In a real game, you might need a 'Pass' function, but for now we assume moves exist
        }
    }

    async function mediumAI() {
        // MCTS with Random Rollout Simulation
        const explorationConstant = 2.0; 

        class MCTSNode {
            constructor(gameState, parent = null, move = null) {
                this.gameState = gameState;
                this.parent = parent;
                this.move = move; // The move that led to this state
                this.children = [];
                this.visits = 0;
                this.wins = 0; // Score from the perspective of the player whose turn it is
                this.untriedMoves = this.getPossibleMoves();
            }

            getPossibleMoves() {
                const moves = [];
                const player = this.gameState.currentPlayer;
                moves.push(...getPossibleMovesForState(this.gameState, player).map(m => ({ type: 'move', ...m })));
                moves.push(...getPossibleBuildsForState(this.gameState, player).map(m => ({ type: 'build', ...m })));
                if (this.gameState.turnNumber - this.gameState.lastAttackTurn[player] >= 5) {
                    moves.push(...getPossibleAttacksForState(this.gameState, player).map(m => ({ type: 'attack', ...m })));
                }
                return moves;
            }

            isFullyExpanded() { return this.untriedMoves.length === 0; }
            isTerminal() { return this.gameState.winner !== null; }

            bestChild(c = explorationConstant) {
                let bestUct = -Infinity;
                let bestChildren = [];

                for (const child of this.children) {
                    if (child.visits === 0) return child;
                    
                    // UCT calculation
                    const exploitation = child.wins / child.visits;
                    const exploration = Math.sqrt(Math.log(this.visits) / child.visits);
                    let uctValue = exploitation + c * exploration;

                    if (child.move.type === 'move') {
                        uctValue += 0.1; // Small bias for moving
                    }

                    if (uctValue > bestUct) {
                        bestUct = uctValue;
                        bestChildren = [child];
                    } else if (Math.abs(uctValue - bestUct) < 1e-6) {
                        bestChildren.push(child);
                    }
                }
                if(bestChildren.length === 0) return null;
                return bestChildren[Math.floor(Math.random() * bestChildren.length)];
            }
        }

        function cloneGameState() {
            return {
                board: board.map(row => [...row]),
                roadOwner: roadOwner.map(row => [...row]),
                currentPlayer: 2, // AI is always player 2
                turnNumber: turnNumber,
                lastAttackTurn: { ...lastAttackTurn },
                p1ConvoyPos: { r: parseInt(player1Convoy.parentElement.dataset.row), c: parseInt(player1Convoy.parentElement.dataset.col) },
                p2ConvoyPos: { r: parseInt(player2Convoy.parentElement.dataset.row), c: parseInt(player2Convoy.parentElement.dataset.col) },
                p1CastlePos: { r: parseInt(player1Castle.dataset.row), c: parseInt(player1Castle.dataset.col) },
                p2CastlePos: { r: parseInt(player2Castle.dataset.row), c: parseInt(player2Castle.dataset.col) },
                winner: null
            };
        }

        function applyMove(state, move) {
            const newState = JSON.parse(JSON.stringify(state));
            const player = newState.currentPlayer;

            if (move.type === 'move') {
                const convoyPos = player === 1 ? newState.p1ConvoyPos : newState.p2ConvoyPos;
                convoyPos.r = move.row;
                convoyPos.c = move.col;
                const target = player === 1 ? newState.p2CastlePos : newState.p1CastlePos;
                if (convoyPos.r === target.r && convoyPos.c === target.c) {
                    newState.winner = player;
                }
            } else if (move.type === 'build') {
                newState.board[move.row][move.col] = 'road';
                newState.roadOwner[move.row][move.col] = player;
            } else if (move.type === 'attack') {
                newState.board[move.row][move.col] = null;
                newState.roadOwner[move.row][move.col] = null;
                newState.lastAttackTurn[player] = newState.turnNumber;
            }
            newState.currentPlayer = player === 1 ? 2 : 1;
            newState.turnNumber++;
            return newState;
        }

        function simulate(state) {
            let simState = JSON.parse(JSON.stringify(state));
            let depth = 0;
            const maxDepth = 30;

            while (simState.winner === null && depth < maxDepth) {
                const player = simState.currentPlayer;
                const moves = [];
                moves.push(...getPossibleMovesForState(simState, player).map(m => ({ type: 'move', ...m })));
                moves.push(...getPossibleBuildsForState(simState, player).map(m => ({ type: 'build', ...m })));
                if (simState.turnNumber - simState.lastAttackTurn[player] >= 5) {
                    moves.push(...getPossibleAttacksForState(simState, player).map(m => ({ type: 'attack', ...m })));
                }

                if (moves.length === 0) break;

                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                simState = applyMove(simState, randomMove);
                depth++;
            }

            if (simState.winner) return simState.winner;

            // If no winner, score based on path length
            const p1Dist = findPathLengthForState(simState.board, simState.p1ConvoyPos, simState.p2CastlePos);
            const p2Dist = findPathLengthForState(simState.board, simState.p2ConvoyPos, simState.p1CastlePos);

            if (p2Dist < p1Dist) return 2;
            if (p1Dist < p2Dist) return 1;
            return 0; // Draw
        }
        
        const rootState = cloneGameState();
        const root = new MCTSNode(rootState);

        const startTime = Date.now();
        while (Date.now() - startTime < 1000) { // 1 second think time
            let node = root;

            // Selection
            while (!node.isTerminal() && node.isFullyExpanded()) {
                node = node.bestChild();
                if (!node) { node = root; break; } // Fallback
            }

            // Expansion
            if (!node.isTerminal() && !node.isFullyExpanded()) {
                const move = node.untriedMoves.pop();
                const newState = applyMove(node.gameState, move);
                const child = new MCTSNode(newState, node, move);
                node.children.push(child);
                node = child;
            }

            // Simulation
            const winner = simulate(node.gameState);

            // Backpropagation
            let tempNode = node;
            while (tempNode !== null) {
                tempNode.visits++;
                // The winner score is from the perspective of the parent node's player
                if (tempNode.parent) {
                    if (winner !== 0) { // Not a draw
                         if (tempNode.parent.gameState.currentPlayer === winner) {
                            tempNode.wins++;
                        }
                    } else {
                        tempNode.wins += 0.5; // Award half point for a draw
                    }
                }
                tempNode = tempNode.parent;
            }
        }

        if (root.children.length > 0) {
            const bestChild = root.children.reduce((best, child) => {
                return (child.visits > best.visits) ? child : best;
            });

            const move = bestChild.move;
            console.log('MCTS (Random Rollout) chose:', move, `(visits: ${bestChild.visits}, score: ${bestChild.wins/bestChild.visits})`);
            
            if (move.type === 'move') {
                moveConvoy(null, move.row, move.col);
            } else if (move.type === 'build') {
                buildRoad(null, move.row, move.col);
            } else if (move.type === 'attack') {
                const cell = document.querySelector(`.grid-cell[data-row="${move.row}"][data-col="${move.col}"]`);
                attackRoad(cell, move.row, move.col);
            }
        } else {
            await easyAI();
        }
    }

    async function hardAI() {
    turnDisplay.textContent = "AI is plotting (Gemini 2.5)...";

    // *** YOUR API KEY ***
    const API_KEY = "AIzaSyBDXxaX3eK0XTPyNBxu1XqPMfqlF5eTGIM"; 
    
    // Cooldown Check
    const canAttack = turnNumber - lastAttackTurn[2] >= 5;
    const gameStateDescription = generateGameStateDescription(canAttack);
    const MODEL_NAME = "gemini-2.5-flash"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `ROLE: You are a RUTHLESS, AGGRESSIVE General playing Merchant's Gambit as Player 2. 
Goal: Reach [${parseInt(player1Castle.dataset.row)}, ${parseInt(player1Castle.dataset.col)}].

RULES:
- Move on roads (shared).
- Build road adjacent to existing road/castle.
- Attack road (cooldown 5 turns).
- ATTACK STATUS: ${canAttack ? "READY (PRIORITY)" : "ON COOLDOWN"}

STATE:
${gameStateDescription}

TACTICAL PRIORITIES:
1. WIN GAME: If goal is reachable, MOVE there immediately.
2. DESTROY ENEMY: If you can attack an enemy road/unit and status is READY, you MUST ATTACK. Do not hesitate.
3. ADVANCE: Move closer to goal.
4. BUILD: Build only if blocked.

Return JSON: {"action": "MOVE"|"BUILD"|"ATTACK", "row": number, "col": number}`
                    }]
                }],
                // Added slightly higher temperature for more "creative/risky" plays
                generationConfig: {
                    temperature: 0.9 
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = textContent.replace(/```json|```/g, '').trim();
        const decision = JSON.parse(cleanedText);

        console.log('Gemini 2.5 (Aggressive) Decision:', decision);

        // ** SAFETY CHECK **
        if (decision.action === 'ATTACK' && !canAttack) {
            console.warn("AI tried to attack on cooldown. Forcing fallback.");
            await mediumAI(); 
            return;
        }

        if (decision.action === 'MOVE') {
            moveConvoy(null, decision.row, decision.col);
        } else if (decision.action === 'BUILD') {
            buildRoad(null, decision.row, decision.col);
        } else if (decision.action === 'ATTACK') {
            const cell = document.querySelector(`.grid-cell[data-row="${decision.row}"][data-col="${decision.col}"]`);
            attackRoad(cell, decision.row, decision.col);
        } else {
            await mediumAI();
        }
    } catch (error) {
        console.error('Gemini AI failed, using Medium AI:', error);
        await mediumAI();
    }
}

    // --- State Generation for AI ---

    function generateGameStateDescription(canAttack) {
        const p1ConvoyCell = player1Convoy.parentElement;
        const p2ConvoyCell = player2Convoy.parentElement;
        
        const p1Pos = { r: parseInt(p1ConvoyCell.dataset.row), c: parseInt(p1ConvoyCell.dataset.col) };
        const p2Pos = { r: parseInt(p2ConvoyCell.dataset.row), c: parseInt(p2ConvoyCell.dataset.col) };
        const p1CastlePos = { r: parseInt(player1Castle.dataset.row), c: parseInt(player1Castle.dataset.col) };

        let desc = `You: [${p2Pos.r}, ${p2Pos.c}]\nGoal: [${p1CastlePos.r}, ${p1CastlePos.c}]\n`;
        
        const moves = getPossibleMoves(2);
        // Optimize context: Only nearby builds
        const builds = getPossibleBuilds(2).filter(b => 
             Math.abs(b.row - p2Pos.r) <= 2 && Math.abs(b.col - p2Pos.c) <= 2
        );
        
        desc += `Moves: ${JSON.stringify(moves)}\n`;
        desc += `Builds (Nearby): ${JSON.stringify(builds)}\n`;
        return desc;
    }

    // --- Shared Helper Logic for AI State Analysis ---
    
    function getPossibleMovesForState(state, player) {
        const convoyPos = player === 1 ? state.p1ConvoyPos : state.p2ConvoyPos;
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of directions) {
            const newRow = convoyPos.r + dr;
            const newCol = convoyPos.c + dc;

            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                if (state.board[newRow][newCol] === 'road' || state.board[newRow][newCol] === 'castle') {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        return moves;
    }

    function getPossibleBuildsForState(state, player) {
        const builds = [];
        const buildableFrom = [];
        for(let r=0; r<10; r++) {
            for(let c=0; c<10; c++) {
                if(state.roadOwner[r][c] === player || state.board[r][c] === 'castle') {
                    buildableFrom.push({row: r, col: c});
                }
            }
        }

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const seen = new Set();
        
        for (const pos of buildableFrom) {
            for (const [dr, dc] of directions) {
                const newRow = pos.row + dr;
                const newCol = pos.col + dc;
                const key = `${newRow},${newCol}`;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && 
                    state.board[newRow][newCol] === null && !seen.has(key)) {
                    builds.push({ row: newRow, col: newCol });
                    seen.add(key);
                }
            }
        }
        return builds;
    }

    function getPossibleAttacksForState(state, player) {
        const attacks = [];
        const p1C = state.p1CastlePos;
        const p2C = state.p2CastlePos;

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (state.board[r][c] === 'road' && state.roadOwner[r][c] !== player) {
                    
                    if ((r === state.p1ConvoyPos.r && c === state.p1ConvoyPos.c) ||
                        (r === state.p2ConvoyPos.r && c === state.p2ConvoyPos.c)) {
                        continue;
                    }

                    const original = state.board[r][c];
                    state.board[r][c] = null; 
                    const connected = checkGlobalConnectivity(state.board, p1C.r, p1C.c, p2C.r, p2C.c);
                    state.board[r][c] = original; 

                    if (connected) {
                        attacks.push({ row: r, col: c });
                    }
                }
            }
        }
        return attacks;
    }

    function getPossibleMoves(player) {
        return getPossibleMovesForState({
            p1ConvoyPos: { r: parseInt(player1Convoy.parentElement.dataset.row), c: parseInt(player1Convoy.parentElement.dataset.col) },
            p2ConvoyPos: { r: parseInt(player2Convoy.parentElement.dataset.row), c: parseInt(player2Convoy.parentElement.dataset.col) },
            board: board
        }, player);
    }

    function getPossibleBuilds(player) {
        return getPossibleBuildsForState({ roadOwner: roadOwner, board: board }, player);
    }
});