const game = (function () {
  function createPlayer(symbol) {
    let playerSymbol = symbol;
    let points = 0;

    const setSymbol = function (symbol) {
      playerSymbol = symbol;
    };

    const getSymbol = () => playerSymbol;

    const addScore = function () {
      points += 1;
    };

    const getScore = function () {
      return points;
    };

    return { getSymbol, setSymbol, getScore, addScore };
  }

  function createGameBoard(p1, p2) {
    const BLANK = "_";
    const DRAW = "DRAW";

    let click = new Audio("./sounds/click.wav");
    let win = new Audio("./sounds/win.wav");

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
      if (arguments.length !== 2) throw new Error("Missing parameters");
      return board[x][y];
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
      if (board[row][col] === BLANK) {
        board[row][col] = turn.getSymbol();
        moveCount += 1;
        checkWinner(row, col);

        if (hasWinner() && !isTied()) win.play();
        else click.play();

        switchTurn();
      } else {
        console.log("INVALID: There is already a mark there! Try again.");
      }

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

    return {
      getBoard,
      setBoard,
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

var p1 = game.createPlayer("📙");
var p2 = game.createPlayer("O");
var gb = game.createGameBoard(p1, p2);

const domHandler = (function () {
  var mainNode = document.querySelector("main");
  var winnerNode = document.querySelector(".winner-name");
  var resetButtonNode = document.querySelector("button.reset");

  var p1SymbolNode = document.querySelector('#player1-symbol');
  var p2SymbolNode = document.querySelector('#player2-symbol');
  var scoreNodes = document.querySelectorAll(".score");

  resetScreen();

  // event selectors
  mainNode.addEventListener("click", inputMove);
  resetButtonNode.addEventListener("click", function () {
    gb.resetGame();
    resetScreen();
    showReset();
    winnerNode.innerText = gb.getWinner();
    resetButtonNode.classList.add("hidden");
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
    winnerNode.innerText = gb.getWinnerSymbol();
    p1SymbolNode.innerText = p1.getSymbol();
    p2SymbolNode.innerText = p2.getSymbol();  
    updateScore();
    showReset();
  }

  function updateScore() {
    var scoreArray = gb.getScore();
    for (let i = 0; i < scoreNodes.length; ++i) {
      scoreNodes[i].innerText = scoreArray[i];
    }
  }

  function resetScreen() {
    var buttons = mainNode.querySelectorAll("button");
    buttons.forEach((button) => (button.innerText = gb.BLANK));
    p1SymbolNode.innerText = p1.getSymbol();
    p2SymbolNode.innerText = p2.getSymbol();
  }

  function showReset() {
    if (gb.hasWinner()) resetButtonNode.classList.remove("hidden");
  }

  return { inputMove };
})();
