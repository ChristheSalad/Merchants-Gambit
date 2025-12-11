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

    const settingsBtn = document.getElementById('settings');
    const helpBtn = document.getElementById('help');
    const aboutBtn = document.getElementById('about');
    const backBtns = document.querySelectorAll('.back-to-menu');

    let gameMode = null; // 'pvp' or 'pve'
    let difficulty = null; // 'easy' or 'medium'
    

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
        // To be implemented
        alert('Medium difficulty is coming soon!');
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

                let player1Castle = null;

                let player2Castle = null;

                let player1Convoy = null;

                let player2Convoy = null;

                let currentPlayer = 1;

                let buildingRoad = false;

                let movingConvoy = false;

                let attacking = false;

            

                const board = Array(10).fill(null).map(() => Array(10).fill(null));

            

                const turnDisplay = document.getElementById('turn-display');

                const buildRoadBtn = document.getElementById('build-road');

                const moveConvoyBtn = document.getElementById('move-convoy');

                const attackBtn = document.getElementById('attack');

                const actionButtons = [buildRoadBtn, moveConvoyBtn, attackBtn];

                let turnNumber = 1;
                let lastAttackTurn = { 1: 0, 2: 0 };

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

            

                function switchTurn() {

                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    turnNumber += 1;

                    buildingRoad= false;
                    movingConvoy = false;
                    attacking = false;
                    updateActionSelection();

                    if (gameMode === 'pve' && currentPlayer === 2) {
                        turnDisplay.textContent = "AI's Turn";
                        setTimeout(aiTurn, 1000); // Give a slight delay for realism
                    } else {
                        turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;
                    }

                    moveConvoyBtn.disabled = false;
                    buildRoadBtn.disabled = false;
                    attackBtn.disabled = false;

                }

            

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
                    for (let i = 0; i < 100; i++) {
                        const cell = document.createElement('div');
                        cell.classList.add('grid-cell');
                        const row = Math.floor(i / 10);
                        const col = i % 10;
                        cell.dataset.row = row;
                        cell.dataset.col = col;
                        gameBoard.appendChild(cell);

                        cell.addEventListener('click', () => {
                            if (buildingRoad) {
                                buildRoad(cell, row, col);
                            } else if (movingConvoy) {
                                moveConvoy(cell, row, col);
                            } else if (attacking) {
                                attackRoad(cell, row, col);
                            }
                        });
                        
                        cell.addEventListener('mouseover', () => {
                            if (buildingRoad) {
                                const canBuildHere = () => {
                                    if (board[row][col] !== null) return false;
                                    const playerNetwork = [];
                                    for(let r=0; r<10; r++) {
                                        for(let c=0; c<10; c++) {
                                            if(board[r][c] === currentPlayer) {
                                                playerNetwork.push({r,c});
                                            }
                                        }
                                    }
                                    for (const piece of playerNetwork) {
                                        if ((Math.abs(piece.r - row) === 1 && piece.c === col) || (Math.abs(piece.c - col) === 1 && piece.r === row)) {
                                            return true;
                                        }
                                    }
                                    return false;
                                };
                                if (canBuildHere()) {
                                    cell.classList.add('road-preview');
                                }
                            }
                        });

                        cell.addEventListener('mouseout', () => {
                        cell.classList.remove('road-preview');
                        });


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

            

                function buildRoad(cell, row, col) {
                    if (cell === null) {
                        cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                    }

                   if (board[row][col] !== null) return;
                   if (board[row][col] === -1) return;

                    function isAdjacent(r1, c1, r2, c2) {
                        return (Math.abs(r1 - r2) === 1 && c1 === c2) ||
                               (Math.abs(c1 - c2) === 1 && r1 === r2);
                    }
                    let canBuild = false;
                    const playerNetwork = [];
                    for(let r=0; r<10; r++) {
                        for(let c=0; c<10; c++) {
                            if(board[r][c] === currentPlayer) {
                                playerNetwork.push({r,c});
                            }
                        }
                    }

                    for(const piece of playerNetwork) {
                        if(isAdjacent(piece.r, piece.c, row, col)) {
                            canBuild = true;
                            break;
                        }
                    }

                    if (canBuild) {
                        board[row][col] = currentPlayer;
                        cell.style.backgroundColor = currentPlayer === 1 ? 'blue' : 'pink';
                        buildingRoad = false;
                        switchTurn();
                    }
                }



                function attackRoad(cell, row, col) {
                    if (turnNumber - lastAttackTurn[currentPlayer] < 5) {
                        alert(`You must wait ${5 - (turnNumber - lastAttackTurn[currentPlayer])} more turns to attack.`);
                        return;
                    }
                    if (board[row][col] === null || board[row][col] === -1) return;

                    board[row][col] = -1;
                    cell.style.backgroundColor = 'red';
                    attacking = false;

                    lastAttackTurn[currentPlayer] = turnNumber;

                    moveConvoyBtn.disabled = true;
                    buildRoadBtn.disabled = true;
                    switchTurn();
                               
                }


            

                function moveConvoy(cell, row, col) {
                    if (cell === null) {
                        cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                    }
                    const pawn = currentPlayer === 1 ? player1Convoy : player2Convoy;
                    if (board[row][col] === null || board[row][col] === -1) return;
                    const convoyCell = pawn.parentElement;

                    const convoyRow = parseInt(convoyCell.dataset.row);
                    const convoyCol = parseInt(convoyCell.dataset.col);

                    const isAdjacent = (Math.abs(row - convoyRow) === 1 && col === convoyCol) || 
                       (Math.abs(col - convoyCol) === 1 && row === convoyRow);

                    if (board[row][col] !== null && isAdjacent) {

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
                        } 
                        else {
                            switchTurn();
                        }
                    }
            }



    

    function highlightRow(row) {
        const cells = document.querySelectorAll(`.grid-cell[data-row="${row}"]`);
        cells.forEach(cell => {
            cell.classList.add('row-highlight');
        });
    }

    function unhighlightRow(row) {
        const cells = document.querySelectorAll(`.grid-cell[data-row="${row}"]`);
        cells.forEach(cell => {
            cell.classList.remove('row-highlight');
        });
    }

    function placeCastle(cell) {
    if (buildingRoad) return;
    const row = parseInt(cell.dataset.row);

    // Create castle element
    const castle = document.createElement('span');
    castle.classList.add('castle');

    // Create pawn element
    const pawn = document.createElement('span');
    pawn.classList.add('pawn');

    if (row === 9 && !player1Castle) {
        castle.innerHTML = '&#9814;'; // White castle
        cell.appendChild(castle);
        pawn.innerHTML = '&#9817;'; // White pawn
        cell.appendChild(pawn);

        player1Castle = cell;
        player1Convoy = pawn;
        board[row][parseInt(cell.dataset.col)] = 1;
        cell.classList.add('player1-castle');
        removeRowHighlights(9);

        if (gameMode === 'pve') {
            aiPlaceCastle();
        }
    } else if (row === 0 && !player2Castle && gameMode === 'pvp') {
        castle.innerHTML = '&#9820;'; // Black castle
        cell.appendChild(castle);
        pawn.innerHTML = '&#9823;'; // Black pawn
        cell.appendChild(pawn);

        player2Castle = cell;
        player2Convoy = pawn;
        board[row][parseInt(cell.dataset.col)] = 2;
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

        castle.innerHTML = '&#9820;'; // Black castle
        cell.appendChild(castle);
        pawn.innerHTML = '&#9823;'; // Black pawn
        cell.appendChild(pawn);

        player2Castle = cell;
        player2Convoy = pawn;
        board[row][col] = 2;
        cell.classList.add('player2-castle');
        removeRowHighlights(0);

        if (player1Castle && player2Castle) {
            document.getElementById('game-info').classList.remove('hidden');
        }
    }

    function aiTurn() {
        // Easy AI logic
        const opponentCastleCell = player1Castle;
        const opponentCastleRow = parseInt(opponentCastleCell.dataset.row);
        const opponentCastleCol = parseInt(opponentCastleCell.dataset.col);
        const possibleMoves = getPossibleMoves(2);

        // 1. Try to win
        for (const move of possibleMoves) {
            if (move.row === opponentCastleRow && move.col === opponentCastleCol) {
                moveConvoy(null, move.row, move.col);
                return;
            }
        }

        const convoyCell = player2Convoy.parentElement;
        const convoyRow = parseInt(convoyCell.dataset.row);
        const convoyCol = parseInt(convoyCell.dataset.col);
        const currentDistance = findPathLength({ r: convoyRow, c: convoyCol }, { r: opponentCastleRow, c: opponentCastleCol });

        // 2. If no winning move, move convoy closer
        if (possibleMoves.length > 0) {
            let bestMove = null;
            let minDistance = currentDistance;

            for (const move of possibleMoves) {
                const distance = findPathLength({ r: move.row, c: move.col }, { r: opponentCastleRow, c: opponentCastleCol });
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMove = move;
                }
            }
            if (bestMove) {
                moveConvoy(null, bestMove.row, bestMove.col);
                return;
            }
        }

        // 3. If no move, build road closer (using Manhattan distance as a heuristic)
        const possibleBuilds = getPossibleBuilds(2);
        if (possibleBuilds.length > 0) {
            let bestBuild = null;
            let minDistance = Infinity;

            for (const build of possibleBuilds) {
                const distance = manhattanDistance(build.row, build.col, opponentCastleRow, opponentCastleCol);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestBuild = build;
                }
            }
            if (bestBuild) {
                buildRoad(null, bestBuild.row, bestBuild.col);
                return;
            }
        }
    }

    function getPossibleMoves(player) {
        const pawn = player === 1 ? player1Convoy : player2Convoy;
        if (!pawn) return [];

        const convoyCell = pawn.parentElement;
        const convoyRow = parseInt(convoyCell.dataset.row);
        const convoyCol = parseInt(convoyCell.dataset.col);
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of directions) {
            const newRow = convoyRow + dr;
            const newCol = convoyCol + dc;

            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && board[newRow][newCol] !== null && board[newRow][newCol] !== -1) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        return moves;
    }

    function getPossibleBuilds(player) {
        const builds = [];
        const playerNetwork = [];
        for(let r=0; r<10; r++) {
            for(let c=0; c<10; c++) {
                if(board[r][c] === player) {
                    playerNetwork.push({r,c});
                }
            }
        }

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const piece of playerNetwork) {
            for (const [dr, dc] of directions) {
                const newRow = piece.r + dr;
                const newCol = piece.c + dc;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && board[newRow][newCol] === null) {
                    builds.push({ row: newRow, col: newCol });
                }
            }
        }
        return builds;
    }

    function manhattanDistance(r1, c1, r2, c2) {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }

    function findPathLength(startNode, endNode) {
        const queue = [{ node: startNode, dist: 0 }];
        const visited = new Set([`${startNode.r},${startNode.c}`]);
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const { node, dist } = queue.shift();

            if (node.r === endNode.r && node.c === endNode.c) {
                return dist;
            }

            for (const [dr, dc] of directions) {
                const newRow = node.r + dr;
                const newCol = node.c + dc;
                const key = `${newRow},${newCol}`;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 &&
                    (board[newRow][newCol] !== null && board[newRow][newCol] !== -1) &&
                    !visited.has(key)) {
                    
                    visited.add(key);
                    queue.push({ node: { r: newRow, c: newCol }, dist: dist + 1 });
                }
            }
        }

        return Infinity; // No path found
    }
});


// change it so that you cannot attack roads that a player is currently on