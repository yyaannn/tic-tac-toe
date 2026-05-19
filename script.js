function Player(_name, marker) {
    let name = _name;

    const getName = () => {
        return name;
    };

    const setName = (newName) => {
        if (newName !== "") {
            name = newName;
        }
    };

    return {
        marker,
        getName,
        setName,
    };
}

const GameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;

    const setCell = (index, marker) => {
        if (board[index] !== "") {
            return false;
        }

        board[index] = marker;

        return true;
    };

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        }
    };

    return {
        getBoard,
        setCell,
        resetBoard,
    };
})();

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameStart = false;
    let gameOver = false;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    const resetPlayers = () => {
        players = [
            Player("Player 1", "O"),
            Player("Player 2", "X"),
        ];
    };

    const startGame = () => {
        gameStart = true;
        currentPlayerIndex = 0;
        gameOver = false;

        GameBoard.resetBoard();
        DisplayController.render();
        DisplayController.updateMessage(
            `${getCurrentPlayer().getName()} 's turn`
        );
    };

    const getCurrentPlayer = () => {
        return players[currentPlayerIndex];
    };

    const switchTurn = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const playRound = (index) => {
        if (!gameStart || gameOver) return;

        const currentPlayer = getCurrentPlayer();

        const success = GameBoard.setCell(index, currentPlayer.marker);
        if (!success) return;

        if (checkWinner(currentPlayer.marker)) {
            gameOver = true;
            DisplayController.updateMessage(
                `${currentPlayer.getName()} wins!`
            );
        } else if (checkTie()) {
            gameOver = true;
            DisplayController.updateMessage("It's a tie!");
        } else {
            switchTurn();
            DisplayController.updateMessage(
                `${getCurrentPlayer().getName()}'s turn`
            );
        }

        DisplayController.render();

    };

    const checkWinner = (marker) => {
        const board = GameBoard.getBoard();

        return winningCombinations.some((comb) => {
            return comb.every((index) => {
                return board[index] === marker;
            });
        });
    };

    const checkTie = () => {
        return GameBoard.getBoard().every((cell) => cell !== "");
    };

    const getGameStart = () => {
        return gameStart;
    };

    const getGameOver = () => {
        return gameOver;
    };

    const getPlayerNames = () => {
        return [players[0].getName(), players[1].getName()];
    };

    const setPlayerNames = (player1Name, player2Name) => {
        players[0].setName(player1Name);
        players[1].setName(player2Name);
    };

    return {
        resetPlayers,
        startGame,
        playRound,
        getGameStart,
        getGameOver,
        getPlayerNames,
        setPlayerNames,
    };
})();

const DisplayController = (() => {
    const boardElement = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");
    const messageElement = document.getElementById("message");
    const playerNameElements = document.querySelectorAll(".player-name")

    const render = () => {
        const board = GameBoard.getBoard();
        const gameStart = GameController.getGameStart();
        const gameOver = GameController.getGameOver();
        const playerNames = GameController.getPlayerNames();

        playerNameElements.forEach((el, index) => {
            const defaultName = `Player ${index + 1}`;
            const playerName = playerNames[index];
            el.textContent = playerName === defaultName ? defaultName : `${defaultName} - ${playerName}`;
        });

        if (gameStart && gameOver) {
            document.getElementById("restart-btn").style.display = "block";
        }

        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            if (!gameOver && board[index] === "") {
                cell.classList.add("active");
            } else {
                cell.classList.remove("active");
            }
        });
    };

    const updateMessage = (message) => {
        messageElement.textContent = message;
    };

    const bindEvents = () => {
        cells.forEach((cell) => {
            cell.addEventListener("click", () => {
                const index = cell.dataset.index;
                GameController.playRound(index);
            });
        });

        const startBtn = document.getElementById("start-btn");
        startBtn.addEventListener("click", () => {
            startBtn.style.display = "none";
            GameController.startGame();
        });

        const restartBtn = document.getElementById("restart-btn");
        restartBtn.addEventListener("click", () => {
            restartBtn.style.display = "none";
            GameController.startGame();
        });

        const form = document.getElementById("player-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const player1 = formData.get("player1");
            const player2 = formData.get("player2");
            GameController.setPlayerNames(player1, player2);
            form.reset();
            render();
        });
    };

    return {
        render,
        updateMessage,
        bindEvents,
    };
})();

GameController.resetPlayers();
DisplayController.bindEvents();