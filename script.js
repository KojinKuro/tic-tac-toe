const game = (function () {
  function createPlayer(symbol) {
    let playerSymbol = symbol;
    let points = 0;

    const setSymbol = function (symbol) {
      playerSymbol = symbol;
    };

    const getSymbol = () => playerSymbol;

    const addPoint = function () {
      points += 1;
    }

    const getPoints = function () {
      return points;
    }

    return { getSymbol, setSymbol, getPoints, addPoint };
  }

  function createGameBoard(p1, p2) {
    const BLANK = "_";
    const DRAW = "DRAW";

    let player1 = p1;
    let player2 = p2;
    let turn = player1;
    let winner = BLANK;
    let moveCount = 0;
    let board = [
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
    ];

    const getBoard = function (x, y) {
      if (!arguments.length) return board;
      if (arguments.length !== 2) throw new Error("Missing parameters");
      return board[x][y];
    };

    const checkWinner = function (x, y) {
      if (winner !== BLANK) return;

      const SYMBOL = board[x][y];
      const B_LENGTH = board.length;
      const B_END = B_LENGTH - 1;

      // check columns
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[x][i] !== SYMBOL) break;
        if (i === B_END) winner = SYMBOL;
      }

      // check rows
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[i][y] !== SYMBOL) break;
        if (i === B_END) winner = SYMBOL;
      }

      // check diagonal
      if (x === y) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][i] != SYMBOL) break;
          if (i === B_END) winner = SYMBOL;
        }
      }

      // check anti diagonal
      if (x + y == B_END) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][B_END - i] !== SYMBOL) break;
          if (i === B_END) winner = SYMBOL;
        }
      }

      // check for draw
      if (moveCount >= B_LENGTH ** 2) winner = DRAW;
    };

    const switchTurn = function () {
      if (turn === player1) turn = player2;
      else turn = player1;
    };

    const setBoard = function (row, col) {
      if (board[row][col] === BLANK) {
        board[row][col] = turn.getSymbol();
        moveCount += 1;
        switchTurn();
      } else {
        console.log("INVALID: There is already a mark there! Try again.");
      }

      checkWinner(row, col);
      console.log("Printing board: ");
      printBoard();
    };

    const printBoard = function () {
      for (let x = 0; x < board.length; ++x) {
        var rowString = `row ${x}: `;
        for (let y = 0; y < board.length; ++y) {
          rowString += `${board[x][y]} `;
        }
        console.log(rowString);
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

    const getWinner = function () {
      if (winner !== BLANK) return winner;
    };

    return { getBoard, setBoard, resetGame, getWinner, BLANK };
  }

  return { createGameBoard, createPlayer };
})();

var p1 = game.createPlayer("📙");
var p2 = game.createPlayer("O");
var gb = game.createGameBoard(p1, p2);

const domHandler = (function() {
  var mainNode = document.querySelector("main");
  var winnerNode = document.querySelector('.winner-name');
  var resetButtonNode = document.querySelector('button.reset');

  resetScreen();
  
  // event selectors
  mainNode.addEventListener("click", inputMove);
  resetButtonNode.addEventListener("click", function() {
    gb.resetGame();
    resetScreen();
    showReset();
    winnerNode.innerText = gb.getWinner();
    resetButtonNode.classList.add('hidden');
  });

  function inputMove(e) {
    var eData = e.target.dataset;
    gb.setBoard(eData.row, eData.col);
    
    // updates the DOM
    updateDOM(e);
  }

  function updateDOM(e) {
    var eData = e.target.dataset;
    e.target.innerText = gb.getBoard(eData.row, eData.col);
    winnerNode.innerText = gb.getWinner();
    showReset();
  }

  function resetScreen() {
    var buttons = mainNode.querySelectorAll('button');
    buttons.forEach((button) => button.innerText = gb.BLANK);
  }

  function showReset() {
    if(gb.getWinner()) resetButtonNode.classList.remove('hidden');
  }

  return { inputMove };
})();