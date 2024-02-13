const game = (function () {
  function createPlayer(symbol) {
    let playerSymbol = symbol;
    let points = 0;

    const setSymbol = function (symbol) {
      playerSymbol = symbol;
    };

    const getSymbol = () => playerSymbol;

    const getScore = () => points;

    const addScore = function () {
      points += 1;
    };

    return { getSymbol, setSymbol, getScore, addScore };
  }

  function createGameBoard(p1, p2) {
    const BLANK = '';

    let click = new Audio('./sounds/click.wav');
    let win = new Audio('./sounds/win.wav');

    let player1 = p1;
    let player2 = p2;
    let tie = createPlayer("Tie");
    let turn = player1;
    let winner = BLANK;

    let moveCount = 0;
    let board = [
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
    ];

    const getScore = function () {
      return [player1.getScore(), tie.getScore(), player2.getScore()];
    };

    const getBoard = function (x, y) {
      if (!arguments.length) return board;
      if (arguments.length === 2) return board[x][y];
      throw new Error("Missing parameters");
    };

    const setWinner = function (newWinner) {
      newWinner.addScore();
      winner = newWinner;
    };

    const checkWinner = function (x, y) {
      if (hasWinner()) return;

      const SYMBOL = board[x][y];
      const B_LENGTH = board.length;
      const B_END = B_LENGTH - 1;

      // check columns
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[x][i] !== SYMBOL) break;
        if (i === B_END) setWinner(turn);
      }

      // check rows
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[i][y] !== SYMBOL) break;
        if (i === B_END) setWinner(turn);
      }

      // check diagonal
      if (x === y) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][i] != SYMBOL) break;
          if (i === B_END) setWinner(turn);
        }
      }

      // check anti diagonal
      if (x + y == B_END) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][B_END - i] !== SYMBOL) break;
          if (i === B_END) setWinner(turn);
        }
      }

      // check for draw
      if (moveCount >= B_LENGTH ** 2 && !hasWinner()) {
        setWinner(tie);
      }
    };

    const switchTurn = function () {
      if (turn === player1) turn = player2;
      else turn = player1;
      return turn;
    };

    const hasWinner = () => {
      return winner === player1 || winner === player2 || winner === tie;
    };

    const isTied = () => winner === tie;

    const getWinnerSymbol = function () {
      if (hasWinner()) return winner.getSymbol();
      return BLANK;
    };

    const setBoard = function (row, col) {
      if(board[row][col] !== BLANK) throw new Error('INVALID: There is already a mark there! Try again.');
      
      board[row][col] = turn.getSymbol();
      moveCount += 1;
      checkWinner(row, col);

      if (hasWinner() && !isTied()) win.play();
      else click.play();

      switchTurn();
    };

    const printBoard = function () {
      for (let x = 0; x < board.length; ++x) {
        var rowString = `row ${x}: `;
        for (let y = 0; y < board.length; ++y) {
          rowString += `${board[x][y]} `;
        } console.log(rowString);
      }
      console.log(winner);
    };

    const resetGame = function () {
      turn = player1;
      winner = BLANK;
      moveCount = 0;
      board = [
        [BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK],
      ];
    };

    return {
      getBoard,
      setBoard,
      printBoard,
      resetGame,
      getWinnerSymbol,
      hasWinner,
      isTied,
      BLANK,
      getScore,
    };
  }

  return { createGameBoard, createPlayer };
})();

var p1 = game.createPlayer('📙');
var p2 = game.createPlayer('O');
var gb = game.createGameBoard(p1, p2);

const domHandler = (function () {
  var mainNode = document.querySelector('main');
  var buttons = mainNode.querySelectorAll('button');
  var winnerNode = document.querySelector('.winner-name');

  var p1SymbolNode = document.querySelector('#player1-symbol');
  var p2SymbolNode = document.querySelector('#player2-symbol');
  var scoreNodes = document.querySelectorAll('.score');

  resetScreen();

  // event selectors
  mainNode.addEventListener('click', function(event) {
    inputMove(event);
    updateDOM(event);
    updateSymbol();
    updateScore();
  });
  p1SymbolNode.addEventListener('click',inputSymbol);
  p2SymbolNode.addEventListener('click',inputSymbol);

  function inputMove(event) {
    if(gb.hasWinner()) { 
      resetScreen();
      return;
    }

    var eData = event.target.dataset;
    gb.setBoard(eData.row, eData.col);
    gb.printBoard();
  }

  function updateDOM(event) {
    var eventData = event.target.dataset;
    event.target.innerText = gb.getBoard(eventData.row, eventData.col);
    winnerNode.innerText = gb.getWinnerSymbol();
  }

  function updateScore() {
    var scoreArray = gb.getScore();
    for (let i = 0; i < scoreNodes.length; ++i) {
      scoreNodes[i].innerText = scoreArray[i];
    }
  }

  function updateSymbol() {
    p1SymbolNode.innerText = p1.getSymbol();
    p2SymbolNode.innerText = p2.getSymbol();
  }

  function inputSymbol(event) {
    var symbolNode = event.currentTarget;
    var inputBox = document.createElement('input');
    inputBox.setAttribute('type','text');
    symbolNode.innerHTML = ''
    symbolNode.appendChild(inputBox);
    inputBox.focus();

    symbolNode.removeEventListener('click', inputSymbol);
    symbolNode.addEventListener('keypress', setSymbol);
    symbolNode.addEventListener('focusout', setSymbol);

    function setSymbol(event) {
      if (event.key !== 'Enter' && event.type !== 'focusout') return;

      symbolNode.innerHTML = ''
      if(inputBox.value !== '') {
        if(symbolNode.id === 'player1-symbol') p1.setSymbol(inputBox.value);
        else p2.setSymbol(inputBox.value);          
      }
      updateSymbol();
      symbolNode.removeEventListener('keypress', setSymbol);
      symbolNode.removeEventListener('focusout', setSymbol);
      symbolNode.addEventListener('click', inputSymbol);
    }
  }

  function resetScreen() {
    buttons.forEach((button) => (button.innerText = gb.BLANK));
    winnerNode.innerText = gb.getWinnerSymbol();
    updateSymbol();
    gb.resetGame();
  }

  return { inputMove };
})();
