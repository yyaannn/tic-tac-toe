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
    let results = []; // 0: tie, 1: player 1 wins, 2: player 2 wins

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
            results.push(currentPlayerIndex + 1);
            DisplayController.updateMessage(
                `${currentPlayer.getName()} wins!`
            );
        } else if (checkTie()) {
            gameOver = true;
            results.push(0);
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

    const getResults = () => {
        return results;
    };

    return {
        resetPlayers,
        startGame,
        playRound,
        getGameStart,
        getGameOver,
        getPlayerNames,
        setPlayerNames,
        getResults,
    };
})();

const DisplayController = (() => {
    const boardElement = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");
    const messageElement = document.getElementById("message");
    const playerNameElements = document.querySelectorAll(".player-name");
    const resultTbody = document.querySelector(".results > tbody");
    const resultTfoot = document.querySelector(".results > tfoot");

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

        const results = GameController.getResults();
        resultTbody.innerHTML = "";
        let scores = [0, 0]
        results.forEach((result, index) => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            td1.textContent = `${index + 1}`;
            const td2 = document.createElement("td");
            switch (result) {
                case 0:
                    td2.textContent = "Tie";
                    break;
                case 1:
                case 2:
                    scores[result - 1]++;
                    td2.textContent = `${playerNames[result - 1]} wins`;
                    break;
                default:
                    td2.textContent = "";
            }
            tr.appendChild(td1);
            tr.appendChild(td2);
            resultTbody.appendChild(tr);
        });

        resultTfoot.innerHTML = "";
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 2;
        td.textContent = `${playerNames[0]} ${scores[0]} : ${scores[1]} ${playerNames[1]}`;
        tr.appendChild(td);
        resultTfoot.appendChild(tr);
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