document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const gameBoard = document.getElementById('game-board');
    const settingsPage = document.getElementById('settings-page');
    const helpPage = document.getElementById('help-page');
    const aboutPage = document.getElementById('about-page');

    const startGameBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings');
    const helpBtn = document.getElementById('help');
    const aboutBtn = document.getElementById('about');
    const backBtns = document.querySelectorAll('.back-to-menu');
    

    startGameBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
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

                    turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;

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
                            if (buildingRoad && canBuildHere(row, col)) {
                                cell.classList.add('road-preview');
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

                   if (board[row][col] !== null) return;
                   if (board[row][col] === -1) return;

                    function isAdjacent(r1, c1, r2, c2) {
                        return (Math.abs(r1 - r2) === 1 && c1 === c2) ||
                               (Math.abs(c1 - c2) === 1 && r1 === r2);
                    }
                    let canBuild = false;

                    for (let r = 0; r < 10; r++) {
                        for (let c = 0; c < 10; c++) {
                            if (board[r][c] === 1 || board[r][c] === 2) {
                                if (isAdjacent(r, c, row, col)) {
                                    canBuild = true;
                                    break;
                                }
                            }
                        }
                        if (canBuild) break;
                    }
                    if (canBuild) {
                        board[row][col] = currentPlayer;
                        cell.style.backgroundColor = 'blue';
                        buildingRoad = false;
                        switchTurn();
                    }
                }



    function attackRoad(cell, row, col) {
    // cooldown
    if (turnNumber - lastAttackTurn[currentPlayer] < 5) {
        alert(`You must wait ${5 - (turnNumber - lastAttackTurn[currentPlayer])} more turns to attack.`);
        return;
    }

    // cannot attack a tile where a convoy stands
    if (player1Convoy?.parentElement === cell || player2Convoy?.parentElement === cell) {
        return;
    }

    // cannot attack castles
    if (cell === player1Castle || cell === player2Castle) return;

    // can't attack already destroyed / empty?
    // If you want to allow attacking non-road tiles remove the null check; current logic blocks empty/null.
    if (board[row][col] === null || board[row][col] === -1) return;

    // backup and simulate
    const oldValue = board[row][col];
    board[row][col] = -1; // simulate attack

    // get coordinates for both convoys and both castles
    if (!player1Convoy || !player2Convoy || !player1Castle || !player2Castle) {
        // something missing — revert and block
        board[row][col] = oldValue;
        return;
    }

    const p1StartR = parseInt(player1Convoy.parentElement.dataset.row, 10);
    const p1StartC = parseInt(player1Convoy.parentElement.dataset.col, 10);
    const p2StartR = parseInt(player2Convoy.parentElement.dataset.row, 10);
    const p2StartC = parseInt(player2Convoy.parentElement.dataset.col, 10);

    const p1CastleR = parseInt(player1Castle.dataset.row, 10);
    const p1CastleC = parseInt(player1Castle.dataset.col, 10);
    const p2CastleR = parseInt(player2Castle.dataset.row, 10);
    const p2CastleC = parseInt(player2Castle.dataset.col, 10);

    // check connectivity for BOTH players: each convoy -> *opponent's* castle
    // Player1 must reach player2Castle; Player2 must reach player1Castle
    const p1CanReach = bfsPathExists(board, p1StartR, p1StartC, p2CastleR, p2CastleC);
    const p2CanReach = bfsPathExists(board, p2StartR, p2StartC, p1CastleR, p1CastleC);

    if (!p1CanReach || !p2CanReach) {
        // revert simulation and deny
        board[row][col] = oldValue;
        alert("That attack would block all possible paths for at least one player. Attack denied.");
        return;
    }

    // attack allowed — commit
    cell.style.backgroundColor = 'red';
    // board[row][col] already set to -1 (keeps logical state)
    attacking = false;
    lastAttackTurn[currentPlayer] = turnNumber;

    moveConvoyBtn.disabled = true;
    buildRoadBtn.disabled = true;

    switchTurn();
}





            

                function moveConvoy(cell, row, col) {
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
    } else if (row === 0 && !player2Castle) {
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


    function bfsPathExists(board, startRow, startCol, goalRow, goalCol) {
    const rows = board.length;
    const cols = board[0].length;

    // sanity checks
    if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) return false;
    if (goalRow  < 0 || goalRow  >= rows || goalCol  < 0 || goalCol  >= cols) return false;

    // if start or goal are attacked, no path
    if (board[startRow][startCol] === -1) return false;
    if (board[goalRow][goalCol] === -1) return false;

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    while (queue.length) {
        const [r,c] = queue.shift();
        if (r === goalRow && c === goalCol) return true;

        for (const [dr,dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (visited[nr][nc]) continue;
            // treat ANY non-attacked tile as walkable (null, 1, 2 are allowed)
            if (board[nr][nc] !== -1) {
                visited[nr][nc] = true;
                queue.push([nr,nc]);
            }
        }
    }

    return false;
}});