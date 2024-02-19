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

  function Move(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
  }

  function createGameBoard(p1, p2) {
    let click = new Audio("./sounds/click.wav");
    let win = new Audio("./sounds/win.wav");

    const player1 = p1;
    const player2 = p2;
    const tie = createPlayer("Tie");
    const blankPlayer = createPlayer("");
    let turn = player1;
    let winner = blankPlayer;
    const winnerMoves = [];

    let moveCount = 0;
    let board = [
      [blankPlayer, blankPlayer, blankPlayer],
      [blankPlayer, blankPlayer, blankPlayer],
      [blankPlayer, blankPlayer, blankPlayer],
    ];

    const getScore = function () {
      return {
        player1: player1.getScore(),
        tie: tie.getScore(),
        player2: player2.getScore(),
      };
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

    const resetInputMoves = () => {
      winnerMoves = [];
    };

    const inputWinnerMoves = function (xPos, yPos) {
      if (winnerMoves.length >= board.length) winnerMoves.shift();
      winnerMoves.push(new Move(xPos, yPos));
    };

    const getWinnerMoves = () => winnerMoves;

    const checkWinner = function (xPos, yPos) {
      if (hasWinner()) return;
      const x = +xPos;
      const y = +yPos;
      const SYMBOL = board[x][y];
      const B_LENGTH = board.length;
      const B_END = B_LENGTH - 1;

      // check columns
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[x][i] !== SYMBOL) break;
        inputWinnerMoves(x, i);
        if (i === B_END) {
          setWinner(turn);
          return;
        }
      }

      // check rows
      for (let i = 0; i < B_LENGTH; ++i) {
        if (board[i][y] !== SYMBOL) break;
        inputWinnerMoves(i, y);
        if (i === B_END) {
          setWinner(turn);
          return;
        }
      }

      // check diagonal
      if (x === y) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][i] != SYMBOL) break;
          inputWinnerMoves(i, i);
          if (i === B_END) {
            setWinner(turn);
            return;
          }
        }
      }

      // check anti diagonal
      if (x + y == B_END) {
        for (let i = 0; i < B_LENGTH; ++i) {
          if (board[i][B_END - i] !== SYMBOL) break;
          inputWinnerMoves(i, B_END - i);
          if (i === B_END) {
            setWinner(turn);
            return;
          }
        }
      }

      // check for draw
      if (moveCount >= B_LENGTH ** 2 && !hasWinner()) {
        resetInputMoves();
        setWinner(tie);
        return;
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

    const getWinner = () => winner;

    const setBoard = function (row, col) {
      if (board[row][col] !== blankPlayer)
        throw new Error("INVALID: There is already a mark there! Try again.");

      board[row][col] = turn === player1 ? player1 : player2;
      moveCount += 1;
      checkWinner(row, col);

      if (hasWinner() && !isTied()) win.play();
      else click.cloneNode().play();

      switchTurn();
    };

    const printBoard = function () {
      for (let x = 0; x < board.length; ++x) {
        var rowString = `row ${x}: `;
        for (let y = 0; y < board.length; ++y) {
          if (board[x][y] === blankPlayer) rowString += "_";
          rowString += `${board[x][y].getSymbol()} `;
        }
        console.log(rowString);
      }
    };

    const resetGame = function () {
      turn = player1;
      winner = blankPlayer;
      moveCount = 0;
      board = [
        [blankPlayer, blankPlayer, blankPlayer],
        [blankPlayer, blankPlayer, blankPlayer],
        [blankPlayer, blankPlayer, blankPlayer],
      ];
    };

    return {
      getBoard,
      setBoard,
      printBoard,
      resetGame,
      hasWinner,
      isTied,
      getScore,
      getWinnerMoves,
      getWinner,
    };
  }

  return { createGameBoard, createPlayer };
})();

var p1 = game.createPlayer("📙");
var p2 = game.createPlayer("O");
var gb = game.createGameBoard(p1, p2);

const domHandler = (function () {
  var gameContainer = document.querySelector("#game-container");

  var p1SymbolNode = document.querySelector("#player1-symbol");
  var p2SymbolNode = document.querySelector("#player2-symbol");

  var p1ScoreNode = document.querySelector(".score#player1-score");
  var tieScoreNode = document.querySelector(".score#tie-score");
  var p2ScoreNode = document.querySelector(".score#player2-score");

  // event selectors
  gameContainer.addEventListener("click", function (event) {
    inputMove(event);
    updateSymbols();
    updateScore();
  });
  p1SymbolNode.addEventListener("click", inputSymbol);
  p2SymbolNode.addEventListener("click", inputSymbol);

  resetScreen();

  function inputMove(event) {
    if (gb.hasWinner()) {
      resetScreen();
      return;
    }

    var eventData = event.target.dataset;
    gb.setBoard(eventData.row, eventData.col);
    if (gb.hasWinner()) blinkWinner();
    gb.printBoard();
  }

  function blinkWinner() {
    let moves = gb.getWinnerMoves();
    moves.forEach((move) => {
      let spanQuery = `[data-row="${move.x}"][data-col="${move.y}"] span`;
      let span = document.querySelector(spanQuery);
      span.classList.add("blink");
    });
  }

  function updateScore() {
    var score = gb.getScore();
    p1ScoreNode.innerText = score.player1;
    tieScoreNode.innerText = score.tie;
    p2ScoreNode.innerText = score.player2;
  }

  function updateSymbols() {
    for (let x = 0; x < gb.getBoard().length; ++x) {
      for (let y = 0; y < gb.getBoard().length; ++y) {
        let spanQuery = `[data-row="${x}"][data-col="${y}"] span`;
        let span = gameContainer.querySelector(spanQuery);
        span.innerText = gb.getBoard(x, y).getSymbol();
      }
    }

    p1SymbolNode.innerText = p1.getSymbol();
    p2SymbolNode.innerText = p2.getSymbol();
  }

  function inputSymbol(event) {
    var symbolNode = event.currentTarget;
    var inputBox = document.createElement("input");
    inputBox.setAttribute("type", "text");
    symbolNode.innerHTML = "";
    symbolNode.appendChild(inputBox);
    inputBox.focus();

    symbolNode.removeEventListener("click", inputSymbol);
    symbolNode.addEventListener("keypress", setSymbol);
    symbolNode.addEventListener("focusout", setSymbol);

    function setSymbol(event) {
      if (event.key !== "Enter" && event.type !== "focusout") return;

      symbolNode.innerHTML = "";
      if (inputBox.value !== "") {
        if (symbolNode.id === "player1-symbol") p1.setSymbol(inputBox.value);
        else p2.setSymbol(inputBox.value);
      }
      updateSymbols();
      symbolNode.removeEventListener("keypress", setSymbol);
      symbolNode.removeEventListener("focusout", setSymbol);
      symbolNode.addEventListener("click", inputSymbol);
    }
  }

  function resetScreen() {
    var gameContainerSpans = document.querySelectorAll(".container span");
    gameContainerSpans.forEach((span) => {
      span.classList.remove("blink");
      span.innerText = "";
    });
    updateSymbols();
    gb.resetGame();
  }

  return { inputMove };
})();
