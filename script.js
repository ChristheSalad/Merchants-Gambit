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

            

                const board = Array(10).fill(null).map(() => Array(10).fill(null));

            

                const turnDisplay = document.getElementById('turn-display');

                const buildRoadBtn = document.getElementById('build-road');

                const moveConvoyBtn = document.getElementById('move-convoy');

                const attackBtn = document.getElementById('attack');

            

                buildRoadBtn.addEventListener('click', () => {

                    buildingRoad = true;

                    movingConvoy = false;

                });

            

                moveConvoyBtn.addEventListener('click', () => {

                    movingConvoy = true;

                    buildingRoad = false;

                });

            

                attackBtn.addEventListener('click', () => {

                    console.log('Attack');

                    switchTurn();

                });

            

                function switchTurn() {

                    currentPlayer = currentPlayer === 1 ? 2 : 1;

                    turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;

                }

            

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

            

                                            }

            

                                        });

            

                

            

                                        if (row === 0) {

            

                                            cell.classList.add('player2-row');

            

                                            cell.addEventListener('mouseover', () => {

            

                                                if (!player2Castle) {

            

                                                    highlightRow(row);

            

                                                }

            

                                            });

            

                                            cell.addEventListener('mouseout', () => {

            

                                                unhighlightRow(row);

            

                                            });

            

                                            cell.addEventListener('click', () => {

            

                                                placeCastle(cell);

            

                                            });

            

                                        } else if (row === 9) {

            

                                            cell.classList.add('player1-row');

            

                                            cell.addEventListener('mouseover', () => {

            

                                                if (!player1Castle) {

            

                                                    highlightRow(row);

            

                                                }

            

                                            });

            

                                            cell.addEventListener('mouseout', () => {

            

                                                unhighlightRow(row);

            

                                            });

            

                                            cell.addEventListener('click', () => {

            

                                                placeCastle(cell);

            

                                            });

            

                                        }

            

                                    }

            

                                }

            

                function buildRoad(cell, row, col) {

                    if (board[row][col] === null) {

                        board[row][col] = currentPlayer;

                        cell.style.border = '2px solid blue';

                        buildingRoad = false;

                        switchTurn();

                    }

                }

            

                function moveConvoy(cell, row, col) {

                    if (board[row][col] !== null) {

                        const convoy = currentPlayer === 1 ? player1Convoy : player2Convoy;

                        const convoyChar = currentPlayer === 1 ? '&#9817;' : '&#9823;';

                        const castleChar = currentPlayer === 1 ? '&#9814;' : '&#9820;';

            

                        if (convoy.innerHTML.includes(castleChar)) {

                            convoy.innerHTML = castleChar;

                        } else {

                            convoy.innerHTML = '';

                        }

                        

                        cell.innerHTML = convoyChar;

                        if (currentPlayer === 1) {

                            player1Convoy = cell;

                        }

                        else {

                            player2Convoy = cell;

                        }

                        movingConvoy = false;

                        switchTurn();

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
        if (row === 9 && !player1Castle) {
            cell.innerHTML = '&#9820;'; // Black castle
            player1Castle = cell;
            player1Convoy = cell;
            cell.innerHTML += '&#9823;'; // Black pawn
        } else if (row === 0 && !player2Castle) {
            cell.innerHTML = '&#9814;'; // White castle
            player2Castle = cell;
            player2Convoy = cell;
            cell.innerHTML += '&#9817;'; // White pawn
        }

        if (player1Castle && player2Castle) {
            document.getElementById('game-info').classList.remove('hidden');
        }
    }
});
