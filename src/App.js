import { useState } from 'react';

function Square({ value, onSquareClick, highlight, isWinningSquare, lastMove }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""} ${
        isWinningSquare ? "highlight-winner-square" : ""
      } ${lastMove ? "last-move" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  return { winner: null, line: [] };
}

function Board({ xIsNext, squares, onPlay, lastMove }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares).winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const { winner, line } = calculateWinner(squares);

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const highlightWin = line.includes(index);
      const isLastMove = index === lastMove;
      squaresInRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          highlight={winner ? false : highlightWin}
          isWinningSquare={winner && highlightWin}
          lastMove={isLastMove}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  let statusClass = "status";
  if (winner) statusClass += " highlight-winner";
  else if (!squares.includes(null)) statusClass += " highlight-draw";

  return (
    <>
      <div className={statusClass}>
        {winner
          ? `Winner: ${winner}`
          : !squares.includes(null)
          ? "It's a draw!"
          : `Next player: ${xIsNext ? "X" : "O"}`}
      </div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const { winner } = calculateWinner(currentSquares);

  const lastMoveIndex =
    currentMove === 0
      ? -1
      : currentSquares.findIndex(
          (sq, idx) => sq !== history[currentMove - 1][idx]
        );

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  const moves = history.map((squares, move) => {
    let description;

    if (move === 0) {
      description = "Go to game start";
    } else {
      const prevSquares = history[move - 1];
      const changedIndex = squares.findIndex((sq, idx) => sq !== prevSquares[idx]);
      const row = Math.floor(changedIndex / 3) + 1;
      const col = (changedIndex % 3) + 1;
      description = `Go to move #${move} (${row}, ${col})`;
    }

    return (
      <li key={move}>
        {move === currentMove ? (
          move === 0 && history.length === 1 ? (
            <span>Make the 1st move!</span>
          ) : (
            <span>You are at move #{move}</span>
          )
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const displayedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          lastMove={lastMoveIndex}
        />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder} className="sort-button">
          Sort {isAscending ? "Descending" : "Ascending"}
        </button>
        <ol>{displayedMoves}</ol>
        {(winner || !currentSquares.includes(null)) && (
          <button className="restart-button" onClick={restartGame}>
            Restart Game
          </button>
        )}
      </div>
    </div>
  );
}
