const game = (function () {
  function createPlayer(name, symbol) {
    let playerSymbol = symbol;
    const playerName = name;

    const setSymbol = function (symbol) {
      playerSymbol = symbol;
    };

    const getSymbol = function () {
      return playerSymbol;
    };

    return { getSymbol, setSymbol, playerName };
  }

  function createGameBoard(p1, p2) {
    let player1 = p1;
    let player2 = p2;
    let turn = player1;
    let moveCount = 0;

    const BLANK = "_";

    let board = [
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
      [BLANK, BLANK, BLANK],
    ];

    const getBoard = function () {
      return board;
    };

    const checkWinner = function (x, y) {
      const SYMBOL = board[x][y];
      const B_LENGTH = board.length;
      const B_END = B_LENGTH - 1;

      // check columns
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[x][i] !== SYMBOL) break;
        if (i === B_END) console.log(`${SYMBOL} won!`);
      }

      // check rows
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[i][y] !== SYMBOL) break;
        if (i === B_END) console.log(`${SYMBOL} won!`);
      }

      // check diagonal
      if (x === y) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][i] != SYMBOL) break;
          if (i === B_END) console.log(`${SYMBOL} won!`);
        }
      }

      // check anti diagonal
      if (x + y == B_END) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][B_END - i] !== SYMBOL) break;
          if (i == B_END) console.log(`${SYMBOL} won!`);
        }
      }

      // check for draw
      if (moveCount >= B_LENGTH ** 2) console.log("DRAW!");
    };

    const switchTurn = function () {
      if (turn === player1) {
        turn = player2;
      } else {
        turn = player1;
      }
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
    };

    const resetBoard = function () {
      board = [
        [BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK],
      ];
    };

    return { getBoard, setBoard, resetBoard };
  }

  return { createGameBoard, createPlayer };
})();

var p1 = game.createPlayer("Charles", "X");
var p2 = game.createPlayer("Opponent", "O");
var gb = game.createGameBoard(p1, p2);
