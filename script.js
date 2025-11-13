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

            

                buildRoadBtn.addEventListener('click', () => {

                    buildingRoad = true;

                    movingConvoy = false;

                    attacking = false;

                });

            

                moveConvoyBtn.addEventListener('click', () => {

                    movingConvoy = true;

                    buildingRoad = false;

                    attacking = false;

                });

            

                attackBtn.addEventListener('click', () => {

                    attacking = true;

                    buildingRoad = false;

                    movingConvoy = false;

                });

            

                function switchTurn() {

                    currentPlayer = currentPlayer === 1 ? 2 : 1;

                    turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;

                    moveConvoyBtn.disabled = false;

                    buildRoadBtn.disabled = false;

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
                    const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;
                    const convoyRow = parseInt(convoy.dataset.row);
                    const convoyCol = parseInt(convoy.dataset.col);

                    const isAdjacent = (Math.abs(row - convoyRow) === 1 && col === convoyCol) || (Math.abs(col - convoyCol) === 1 && row === convoyRow);

                    if (board[row][col] === null && isAdjacent) {
                        board[row][col] = currentPlayer;
                        cell.style.border = '2px solid blue';
                        buildingRoad = false;
                        switchTurn();
                    }
                }

                function attackRoad(cell, row, col) {
                    const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;
                    const convoyRow = parseInt(convoy.dataset.row);
                    const convoyCol = parseInt(convoy.dataset.col);

                    const isAdjacent = (Math.abs(row - convoyRow) === 1 && col === convoyCol) || (Math.abs(col - convoyCol) === 1 && row === convoyRow);

                    if (board[row][col] !== null && board[row][col] !== -1 && isAdjacent) {
                        board[row][col] = -1;
                        cell.style.border = '2px solid red';
                        attacking = false;
                        moveConvoyBtn.disabled = true;
                        buildRoadBtn.disabled = true;
                        switchTurn();
                    }
                }

            

                function moveConvoy(cell, row, col) {
                    const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;
                    const convoyRow = parseInt(convoy.dataset.row);
                    const convoyCol = parseInt(convoy.dataset.col);

                    const isAdjacent = (Math.abs(row - convoyRow) === 1 && col === convoyCol) || (Math.abs(col - convoyCol) === 1 && row === convoyRow);

                    if (board[row][col] !== null && isAdjacent) {
                        const convoyChar = currentPlayer === 1 ? '&#9817;' : '&#9823;';
                        const castleChar = currentPlayer === 1 ? '&#9814;' : '&#9820;';

                        if (convoy.innerHTML.includes(castleChar)) {
                            convoy.innerHTML = convoy.innerHTML.replace(convoyChar, '');
                        } else {
                            convoy.innerHTML = '';
                        }
                        
                        cell.innerHTML += convoyChar;
                        if (currentPlayer === 1) {
                            player1Convoy = cell;
                        }
                        else {
                            player2Convoy = cell;
                        }
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
        const col = parseInt(cell.dataset.col);
        if (row === 9 && !player1Castle) {
            cell.innerHTML = '&#9814;'; // White castle
            player1Castle = cell;
            player1Convoy = cell;
            cell.innerHTML += '&#9817;'; // White pawn
            board[row][col] = 1;
            cell.classList.add('player1-castle');
            removeRowHighlights(9);
        } else if (row === 0 && !player2Castle) {
            cell.innerHTML = '&#9820;'; // Black castle
            player2Castle = cell;
            player2Convoy = cell;
            cell.innerHTML += '&#9823;'; // Black pawn
            board[row][col] = 2;
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
});
