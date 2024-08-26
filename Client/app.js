const ws = new WebSocket('ws://localhost:8080');
const gameBoard = document.getElementById('game-board');
const playerAMoveInput = document.getElementById('player-a-move');
const playerBMoveInput = document.getElementById('player-b-move');
const playerASubmitButton = document.getElementById('player-a-submit');
const playerBSubmitButton = document.getElementById('player-b-submit');
const playerAControls = document.getElementById('player-a-controls');
const playerBControls = document.getElementById('player-b-controls');
const gameStatus = document.getElementById('game-status');
const moveHistoryDiv = document.getElementById('move-history');
const captureHistoryDiv = document.getElementById('capture-history');

// Initializing the game board
const initializeBoard = (state) => {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            if (state.grid[i][j]) {
                cell.textContent = state.grid[i][j];
                const player = state.grid[i][j].split('-')[0];
                cell.classList.add(player === 'A' ? 'player-a' : 'player-b');
            }
            gameBoard.appendChild(cell);
        }
    }
    updateGameStatus(state);
    updateCaptureHistory(state.captures);
};

// Handling incoming messages from the server
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'state') {
        initializeBoard(message.state);
        togglePlayerControls(message.state.turn);
        if (message.state.lastMove) {
            addMoveToHistory(message.state.lastMove);
        }
    } else if (message.type === 'error') {
        displayError(message.message);
    }
};

// Sending the move command to the server
const sendMove = (command) => {
    const player = document.getElementById('player-a-controls').style.display === 'block' ? 'A' : 'B';
    ws.send(JSON.stringify({ type: 'move', player, character: command.split(':')[0], direction: command.split(':')[1] }));
};

// Toggling the controls for the current player
const togglePlayerControls = (currentTurn) => {
    if (currentTurn === 'A') {
        playerAControls.style.display = 'block';
        playerBControls.style.display = 'none';
    } else {
        playerAControls.style.display = 'none';
        playerBControls.style.display = 'block';
    }
};

// Updating the game status display
const updateGameStatus = (state) => {
    let statusText = `Current Turn: Player ${state.turn}`;
    if (state.winner) {
        statusText = `Game Over! Player ${state.winner} wins!`;
    }
    gameStatus.textContent = statusText;
};

// Displaying error messages to the user
const displayError = (message) => {
    gameStatus.textContent = `Error: ${message}`;
};

// Adding a move to the move history
const addMoveToHistory = (move) => {
    const moveParagraph = document.createElement('p');
    moveParagraph.textContent = move;
    moveHistoryDiv.appendChild(moveParagraph);
};

// Updating the capture history
const updateCaptureHistory = (captures) => {
    captureHistoryDiv.innerHTML = '';
    captures.forEach(capture => {
        const captureParagraph = document.createElement('p');
        captureParagraph.textContent = capture;
        captureHistoryDiv.appendChild(captureParagraph);
    });
};

// Adding event listeners for submitting moves
playerASubmitButton.addEventListener('click', () => {
    const command = playerAMoveInput.value.trim();
    if (command) {
        sendMove(command);
        playerAMoveInput.value = '';
    }
});

playerBSubmitButton.addEventListener('click', () => {
    const command = playerBMoveInput.value.trim();
    if (command) {
        sendMove(command);
        playerBMoveInput.value = '';
    }
});