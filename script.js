const gameResult = document.querySelector('.game__result');
const gameForm = document.querySelector('.game__form');
const formField = document.querySelector('.form__field');
const formLabel = document.querySelector('.form__label');
const buttonSubmit = document.querySelector('.button--submit');
const sidebarList = document.querySelector('.sidebar-list');
const tableCells = document.querySelectorAll('.board__box');
const userInput = document.getElementById('username');
const formErrorMessage = document.getElementById('form-error-message');

const COMBINATIONS = {
  0: [[1, 2], [3, 6], [4, 8]],
  1: [[0, 2], [4, 7]],
  2: [[0, 1], [5, 8], [4, 6]],
  3: [[0, 6], [4, 5]],
  4: [[3, 5], [1, 7], [0, 8], [2, 6]],
  5: [[3, 4], [2, 8]],
  6: [[0, 3], [7, 8], [2, 4]],
  7: [[1, 4], [6, 8]],
  8: [[6, 7], [2, 5], [0, 4]],
};

let numberOfMoves = 0;
let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];

const handlePlayerChange = () => currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
const clearUserInput = () => userInput.value = '';
const winningMessage = () => `Player ${currentPlayer} has won in ${numberOfMoves} moves!`;
const drawMessage = () => `Game ended in a draw!`;

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
  gameState[clickedCellIndex] = currentPlayer;
  clickedCell.innerHTML = currentPlayer;
  numberOfMoves++;
};

const handleResultValidation = (clickedCellIndex) => {
  let roundWon = false;
  const combinations = COMBINATIONS[clickedCellIndex];

  combinations.forEach(([firstIndex, secondIndex]) => {
    if (gameState[firstIndex] === currentPlayer && gameState[secondIndex] === currentPlayer) {
      roundWon = true;
    }
  });

  if (roundWon) {
    clearForm();
    gameResult.innerHTML = winningMessage();
    gameForm.classList.toggle('hide');
    handlePointerEvents();
    return;
  }

  const roundDraw = !gameState.includes('');

  if (roundDraw) {
    clearForm();
    gameResult.innerHTML = drawMessage();
    handlePointerEvents();
    return;
  }

  handlePlayerChange();
};

const clearForm = () => {
  resetFormField();
  gameResult.classList.toggle('hide');
  gameActive = false;
};

const handlePointerEvents = () => {
  tableCells.forEach((cell) => {
    cell.style.pointerEvents = 'none';
    cell.style.opacity = '0.87';
  });
};

const handleCellClick = (event) => {
  const clickedCell = event.target;
  const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

  if (gameState[clickedCellIndex] !== '' || !gameActive || numberOfMoves === 9) {
    return;
  }

  handleCellPlayed(clickedCell, clickedCellIndex);
  handleResultValidation(clickedCellIndex);
};

const handleRestartGame = () => {
  gameActive = true;
  numberOfMoves = 0;
  currentPlayer = 'X';
  gameState = ['', '', '', '', '', '', '', '', ''];
  buttonSubmit.disabled = false;
  userInput.disabled = false;
  clearUserInput();
  resetFormField();

  if (!gameForm.classList.contains('hide')) {
    gameForm.classList.add('hide');
  }

  if (!gameResult.classList.contains('hide')) {
    gameResult.classList.toggle('hide');
  }

  tableCells.forEach((cell) => clearBoard(cell));
};

const clearBoard = (cell) => {
  cell.innerHTML = '';
  cell.style.pointerEvents = 'initial';
  cell.style.opacity = '1';
};

const resetFormField = () => {
  formErrorMessage.style.visibility = 'hidden';
  formField.style.borderBottom = '1px solid #d2d2d2';
  formLabel.style.color = 'var(--primary-color-dark)';
};

const showErrorMessage = (message) => {
  formLabel.style.color = 'var(--error-color)';
  formField.style.borderBottom = '2px solid var(--error-color)';
  formField.focus();
  formErrorMessage.innerHTML = message;
  formErrorMessage.style.visibility = 'initial';
};

const handleUsernameInput = (event) => {
  event.preventDefault();
  const username = new FormData(event.target).get('username');
  resetFormField();

  const inputLength = checkInputLength(username);

  if (inputLength === false) {
    showErrorMessage('Length must be below 12 characters');
    clearUserInput();
    return;
  }

  const inputValidity = checkInputValidity(username);

  if (inputValidity === false) {
    showErrorMessage('Use only alphanumeric characters');
    clearUserInput();
    return;
  }

  addWinner(username);
  appendWinnerToSidebar(username, currentPlayer, numberOfMoves);
};

const addWinner = (username) => {
  const winnersFromStorage = JSON.parse(localStorage.getItem('winners'));
  let winners = [];

  if (winnersFromStorage) {
    winnersFromStorage.forEach((winner) => {
      if (checkInputLength(winner.username) && checkInputValidity(winner.username)) {
        winners.push(winner);
      }
    });
  }

  const winner = {
    username: username,
    symbol: currentPlayer,
    numberOfMoves: numberOfMoves,
  };

  if (winners) {
    winners.push(winner);
  } else {
    winners = [winner];
  }

  localStorage.setItem('winners', JSON.stringify(winners));
  buttonSubmit.disabled = true;
  userInput.disabled = true;
  clearUserInput();
};

const appendWinnerToSidebar = (username, symbol, numOfMoves) => {
  sidebarList.insertAdjacentHTML(
    'beforeend',
    `<div class="sidebar-list-item">
						 <span class="sidebar-list-item__text">
						   Winner: ${username}, Symbol: ${symbol}, Moves: ${numOfMoves}
						 </span>
					 </div>`
  );
};

const showWinnersInSidebar = () => {
  const winners = JSON.parse(localStorage.getItem('winners'));

  if (winners) {
    winners.forEach((winner) => {
      const { username, symbol, numberOfMoves } = winner;

      if (checkInputLength(username) && checkInputValidity(username)) {
        appendWinnerToSidebar(username, symbol, numberOfMoves);
      }
    });
  }
};

const checkInputLength = (input) => {
  return !(input === '' || input.length > 12);
};

const checkInputValidity = (input) => {
  const alphanumericRegex = /^[a-zA-Z0-9_]+$/g;
  return alphanumericRegex.test(input);
};

tableCells.forEach((cell) => cell.addEventListener('click', handleCellClick));
document.querySelector('.button--restart').addEventListener('click', handleRestartGame);
document.querySelector('.game__form').addEventListener('submit', handleUsernameInput);
showWinnersInSidebar();
