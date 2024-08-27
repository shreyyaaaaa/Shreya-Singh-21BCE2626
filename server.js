const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
  players: {
    A: [],
    B: []
  },
  board: Array(5).fill().map(() => Array(5).fill(null)),
  turn: 'A',
  winner: null
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'init':
        initializeGame(ws, data);
        break;
      case 'move':
        processMove(ws, data);
        break;
    }
  });
});

function initializeGame(ws, data) {
  const { playerId, characters } = data;

  if (playerId === 'A' || playerId === 'B') {
    gameState.players[playerId] = characters;
    const startingRow = playerId === 'A' ? 0 : 4;
    characters.forEach((character, index) => {
      gameState.board[startingRow][index] = `${playerId}-${character}`;
    });
  }

  ws.send(JSON.stringify({
    type: 'update',
    state: gameState
  }));

  broadcastGameState();
}

function processMove(ws, data) {
  const { playerId, character, move } = data;

  if (playerId !== gameState.turn || gameState.winner) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not your turn or game over' }));
    return;
  }

  const validMove = makeMove(playerId, character, move);

  if (validMove) {
    gameState.turn = gameState.turn === 'A' ? 'B' : 'A';
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
    return;
  }

  broadcastGameState();
}

function makeMove(playerId, character, move) {
  
  return true;
}

function broadcastGameState() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'update',
        state: gameState
      }));
    }
  });
}
