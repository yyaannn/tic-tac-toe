function Player(name, marker) {
    return {
        name,
        marker,
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
    let gameOver = true;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    const startGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name || "Player 1", "O"),
            Player(player2Name || "Player 2", "X"),
        ];

        currentPlayerIndex = 0;
        gameOver = false;

        GameBoard.resetBoard();
        DisplayController.render();
        DisplayController.updateMessage(
            `${getCurrentPlayer().name} 's turn`
        );
    };

    const getCurrentPlayer = () => {
        return players[currentPlayerIndex];
    };

    const switchTurn = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const playRound = (index) => {
        if (gameOver) return;

        const currentPlayer = getCurrentPlayer();

        const success = GameBoard.setCell(index, currentPlayer.marker);
        if (!success) return;

        DisplayController.render();

        if (checkWinner(currentPlayer.marker)) {
            gameOver = true;

            DisplayController.updateMessage(
                `${currentPlayer.name} wins!`
            );

            return;
        }

        if (checkTie()) {
            gameOver = true;

            DisplayController.updateMessage("It's a tie!");

            return;
        }

        switchTurn();
        DisplayController.updateMessage(
            `${getCurrentPlayer().name}'s turn`
        );
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

    return {
        startGame,
        playRound,
    };
})();

const DisplayController = (() => {
    const boardElement = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");
    const messageElement = document.getElementById("message");

    const render = () => {
        const board = GameBoard.getBoard();

        cells.forEach((cell, index) => {
            cell.textContent = board[index];
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

        document.getElementById("start-btn").addEventListener("click", () => {
            GameController.startGame();
        });

        document.getElementById("restart-btn").addEventListener("click", () => {
            GameController.startGame();
        });
    };

    return {
        render,
        updateMessage,
        bindEvents,
    };
})();

DisplayController.bindEvents();