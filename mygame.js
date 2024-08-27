let socket = new WebSocket('ws://localhost:8080');
let gameState = {};
let playerId = null;

socket.onopen = () => {
  console.log('Connected to server');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'update':
      updateGameState(data.state);
      break;
    case 'error':
      alert(data.message);
      break;
  }
};

function initializeGame(playerId, characters) {
  playerId = playerId; // Store player ID
  socket.send(JSON.stringify({
    type: 'init',
    playerId: playerId,
    characters: characters
  }));
}

function sendMove(character, move) {
  socket.send(JSON.stringify({
    type: 'move',
    playerId: playerId,
    character: character,
    move: move
  }));
}

function updateGameState(state) {
  gameState = state;
  renderBoard();
}

function renderBoard() {
  const boardElement = document.getElementById('gameBoard');
  boardElement.innerHTML = ''; // Clear the board

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      const character = gameState.board[row][col];
      if (character) {
        cell.textContent = character;
        cell.classList.add(character.startsWith('A') ? 'playerA' : 'playerB');
        cell.addEventListener('click', () => handleCellClick(row, col));
      }
      boardElement.appendChild(cell);
    }
  }

  document.getElementById('turnIndicator').textContent = `Current Turn: Player ${gameState.turn}`;
}

function handleCellClick(row, col) {
  // Example: When a cell is clicked, determine if it's a valid move and send it to the server
  const selectedCharacter = prompt('Enter character to move (e.g., P1):');
  const move = prompt('Enter move direction (e.g., L, F, BR):');
  
  if (selectedCharacter && move) {
    sendMove(selectedCharacter, move);
  }
}
