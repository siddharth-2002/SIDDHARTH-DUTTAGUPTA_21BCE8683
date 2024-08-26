const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('Client'));

// // Serving the default route
// app.get('/', (req, res) => {
//     res.sendFile(path.join('Client', 'index.html'));
// });
app.use(express.static(path.join(__dirname, '..', 'Client')));

// Serving the default route
app.get('/', (req, res) => {
    // const filePath = path.join(__dirname, 'Client', 'index.html');
    // const filePath = path.join(__dirname, '..', 'Client', 'index.html');
    res.sendFile(path.join(__dirname, '..', 'Client', 'index.html'));


    res.sendFile(filePath);
});


// Initializing the game state
let gameState = {
    grid: [
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
    ],
    turn: 'A',
    winner: null,
    moves: [], // Tracking moves
    captures: [], // Tracking captures
    lastMove: null // Tracking the last valid move
};

// Broadcasting the game state to all connected clients
const broadcastGameState = () => {
    const stateMessage = JSON.stringify({ type: 'state', state: gameState });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(stateMessage);
        }
    });
    console.log('Broadcasted game state:', gameState);
};

// Checking for a winner after each move
const checkForWinner = () => {
    const playerAHasCharacters = gameState.grid.flat().some(cell => cell && cell.startsWith('A-'));
    const playerBHasCharacters = gameState.grid.flat().some(cell => cell && cell.startsWith('B-'));

    if (!playerAHasCharacters) {
        gameState.winner = 'B';
    } else if (!playerBHasCharacters) {
        gameState.winner = 'A';
    }
};

// Handling client connection and messages
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'state', state: gameState }));

    ws.on('message', (message) => {
        console.log('Received message:', message);
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const { player, character, direction } = data;

            if (gameState.turn !== player) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn!' }));
                console.log('Error: Not your turn!');
                return;
            }

            const [row, col] = findCharacterPosition(`${player}-${character}`);
            if (row === null || col === null) {
                ws.send(JSON.stringify({ type: 'error', message: 'Character not found!' }));
                console.log('Error: Character not found!');
                return;
            }

            let newRow = row;
            let newCol = col;

            switch (character) {
                case 'P1':
                case 'P2':
                case 'P3':
                    // Handling Pawn movement
                    switch (direction) {
                        case 'L': newCol = Math.max(0, col - 1); break;
                        case 'R': newCol = Math.min(4, col + 1); break;
                        case 'F': newRow = gameState.turn === 'A' ? Math.min(4, row + 1) : Math.max(0, row - 1); break;
                        case 'B': newRow = gameState.turn === 'A' ? Math.max(0, row - 1) : Math.min(4, row + 1); break;
                    }

                    // Checking if the destination cell is occupied by an opponent's piece
                    if (gameState.grid[newRow][newCol] && gameState.grid[newRow][newCol].startsWith(gameState.turn === 'A' ? 'B-' : 'A-')) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Pawns cannot capture opponent pieces!'
                        }));
                        console.log('Error: Pawns cannot capture opponent pieces!');
                        return;
                    }
                    break;
                case 'H1':
                    // Handling Hero1 movement
                    switch (direction) {
                        case 'L': newRow = row; newCol = Math.max(0, col - 2); break;
                        case 'R': newRow = row; newCol = Math.min(4, col + 2); break;
                        case 'F': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = col; break;
                        case 'B': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = col; break;
                    }
                    break;
                case 'H2':
                    // Handling Hero2 movement
                    switch (direction) {
                        case 'FL': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = Math.max(0, col - 2); break;
                        case 'FR': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = Math.min(4, col + 2); break;
                        case 'BL': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = Math.max(0, col - 2); break;
                        case 'BR': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = Math.min(4, col + 2); break;
                    }
                    break;
            }

            if (gameState.grid[newRow][newCol] && gameState.grid[newRow][newCol].startsWith(player)) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Cannot move to cell occupied by your own piece! Cell value: ${gameState.grid[newRow][newCol]}`
                }));
                console.log(`Error: Cannot move to cell occupied by your own piece! Cell value: ${gameState.grid[newRow][newCol]}`);
                return;
            }

            // Handling captures
            if (gameState.grid[newRow][newCol] && !gameState.grid[newRow][newCol].startsWith(player)) {
                const capturedPiece = gameState.grid[newRow][newCol];
                gameState.captures.push(`Player ${player}'s ${character} captured Player ${capturedPiece.split('-')[0]}'s ${capturedPiece.split('-')[1]}`);
                gameState.grid[newRow][newCol] = null;
            }

            // Moving the character
            gameState.grid[row][col] = null;
            gameState.grid[newRow][newCol] = `${player}-${character}`;
            gameState.lastMove = `Player ${player} moved ${character} ${getMoveDescription(direction)}`;

            console.log('Updated game state:', gameState);

            checkForWinner();
            if (gameState.winner) {
                broadcastGameState();
                console.log('Game over. Winner:', gameState.winner);
                return;
            }

            gameState.turn = gameState.turn === 'A' ? 'B' : 'A';
            broadcastGameState();
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Finding the position of a character on the grid
const findCharacterPosition = (character) => {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (gameState.grid[i][j] === character) {
                return [i, j];
            }
        }
    }
    return [null, null];
};

// Converting direction codes to descriptive text
const getMoveDescription = (direction) => {
    switch (direction) {
        case 'F': return 'forward';
        case 'B': return 'backward';
        case 'L': return 'left';
        case 'R': return 'right';
        case 'FL': return 'forward-left';
        case 'FR': return 'forward-right';
        case 'BL': return 'backward-left';
        case 'BR': return 'backward-right';
        default: return 'unknown direction';
    }
};

// Starting the server
server.listen(8080, () => {
    console.log(`Server is listening on port 8080  http://localhost:8080/`);
});