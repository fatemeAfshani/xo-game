import { useCallback, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
import Messages from '../components/Messages.js';
import '../css/playground.css';
import { getSocket } from '../socket.js';
import { GameData, Move } from '../types.js';

const socket = getSocket();

export default function PlayGround() {
  const [error, setError] = useState('');
  const [gameStatus, setGameStatus] = useState('');
  const [gameDecision, setGameDecision] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>();
  const [myTurn, setMyTurn] = useState<'X' | 'O' | null>();
  const [turn, setTurn] = useState<'X' | 'O' | null>();
  const [cells, setCells] = useState<Move[]>(Array(9).fill(''));
  const [cellClassNames, setCellClassNames] = useState<string[]>(Array(9).fill('cell'));
  const [boardClassName, setBoardClassName] = useState('board mx-auto');

  const x_Class = 'X';

  const location = useLocation();
  const navigate = useNavigate();
  const gameId = location.state.gameId;
  const { user } = useAuth();

  useEffect(() => {
    socket.emit('join', {
      gameId,
      status: 'playground',
    });
  }, [gameId]);

  // game logic

  const setHover = useCallback(() => {
    setBoardClassName('board mx-auto');

    if (turn == myTurn) {
      setBoardClassName(`board mx-auto ${myTurn}`);
    }
  }, [myTurn, turn]);

  const continueGame = useCallback(() => {
    const newCells = [...cells];
    const newClassNames = newCells.map((cell) => {
      if (cell === 0) {
        return 'cell';
      } else if (cell === x_Class) {
        return 'cell X';
      } else {
        return 'cell O';
      }
    });

    setCellClassNames(newClassNames);
    setHover();
  }, [cells, setHover]);

  const startGame = useCallback(() => {
    setCellClassNames(Array(9).fill('cell'));

    setHover();
  }, [setHover]);

  useEffect(() => {
    const newGame = cells?.every((move) => {
      return move == 0;
    });
    if (newGame) {
      startGame();
    } else {
      continueGame();
    }
  }, [cells, continueGame, startGame]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameDecision) setGameDecision('');
    if (gameStatus) setGameStatus('');

    const cell = e.target as Element;
    const cellIndex = cell.getAttribute('data-index') as unknown as number;

    if (cells[cellIndex] !== 'X' && cells[cellIndex] !== 'O' && turn == myTurn) {
      const newCellClassNames = [...cellClassNames];

      newCellClassNames[cellIndex] = `cell ${myTurn}`;
      setCellClassNames(newCellClassNames);

      const data = {
        turn,
        index: cellIndex,
        gameId,
      };

      socket.emit('userMove', data);
      setHover();
    }
  };

  const continueHandler = useCallback(() => {
    socket.emit('continue', { gameId });
    setShowModal(false);
  }, [gameId]);

  const finishHandler = useCallback(() => {
    socket.emit('finish', { gameId });
    setShowModal(false);
  }, [gameId]);

  // socket logic
  useEffect(() => {
    socket.on('disconnect', () => {
      setError('unable to connect to server');
    });

    socket.on('gameMoves', (moves: Move[]) => {
      setCells(moves);
    });

    socket.on('endRound', ({ status }: { game: GameData; status: string }) => {
      setGameStatus(status);
      setShowModal(true);
    });

    socket.on('gameTurn', (turn: 'X' | 'O') => {
      setTurn(turn);
    });

    socket.on('otherUserDecision', ({ decision }: { decision: 'continue' | 'finish' }) => {
      setGameDecision(decision);
    });
  }, []);

  useEffect(() => {
    socket.on('gameData', (game: GameData) => {
      if (game?.user1?._id === user?.userId) {
        setMyTurn('X');
      } else {
        setMyTurn('O');
      }
      setGameData(game);
    });
  }, [user]);

  useEffect(() => {
    socket.on('acceptFinish', () => {
      navigate('/', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    socket.on('changesForUser', ({ moves, newTurn }: { moves: Move[]; newTurn: 'X' | 'O' }) => {
      setTurn(newTurn);
      setCells(moves);
      continueGame();
    });
  }, [continueGame]);

  useEffect(() => {
    socket.on('acceptContinue', ({ moves, turn, game }: { moves: Move[]; turn: 'X' | 'O'; game: GameData }) => {
      setCells(moves);
      setTurn(turn);
      setGameData(game);
      startGame();
    });
  }, [startGame]);

  // cell component
  const Cell = ({ id, className }: { id: number; className: string }) => {
    return <div className={className} data-index={id} onClick={handleClick}></div>;
  };
  return (
    <>
      <div className="text-center min-vh-100">
        <h4 className="m-3">Play Gound</h4>
        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}
        <div className="container">
          <div className="row my-3">
            <div className="col-sm-12 col-md-6 text-center">
              {gameData?.user1 && (
                <>
                  <div className="col-sm-12 h5 mb-3">username: {gameData.user1.username}</div>
                  <div className="col h6">score: {gameData.user1.score}</div>
                  <div className="col h6">winCount: {gameData.user1.winCount}</div>
                  <div className="col h6">lossCount: {gameData.user1.lossCount}</div>
                  <div className="col h6">drawCount: {gameData.user1.drawCount}</div>
                </>
              )}
            </div>
            <div className="col-sm-12 col-md-6 text-center">
              {' '}
              {gameData?.user2 && (
                <>
                  <div className="col-sm-12 h5 mb-3">username: {gameData.user2.username}</div>
                  <div className="col h6">score: {gameData.user2.score}</div>
                  <div className="col h6">winCount: {gameData.user2.winCount}</div>
                  <div className="col h6">lossCount: {gameData.user2.lossCount}</div>
                  <div className="col h6">drawCount: {gameData.user2.drawCount}</div>
                </>
              )}
            </div>
          </div>
          <div className="row my-3">
            <h5>Game Status</h5>
            <div className="col-3">round number: {gameData?.roundsCount}</div>
            <div className="col-3">user1 wins : {gameData?.user1Wins}</div>
            <div className="col-3">user2 wins : {gameData?.user2Wins}</div>
            <div className="col-3">draws: {gameData?.drawsCount}</div>
          </div>
        </div>

        <p>my turn: {myTurn}</p>
        <p>This is {turn} turn</p>
        {gameStatus && (
          <div className="alert alert-info m-3" role="alert">
            {gameStatus}
          </div>
        )}

        {gameDecision && (
          <div className="alert alert-warning m-3" role="alert">
            {gameDecision === 'continue' ? (
              'the other user decide to continue  :)'
            ) : (
              <p>
                the other user decide to finish the game, thanks for playing :), click <a href="/">here</a> to return
                home
              </p>
            )}
          </div>
        )}
        <div className={boardClassName.toString()}>
          {cells?.map((cell, index) => {
            return <Cell key={index} id={index} className={cellClassNames[index]} />;
          })}
        </div>

        <Messages
          gameId={gameId}
          socket={socket}
          username={
            (gameData?.user1?._id === user?.userId ? gameData?.user1?.username : gameData?.user2.username) || ''
          }
        ></Messages>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Game Is Over</Modal.Title>
          </Modal.Header>
          <Modal.Body>{gameStatus}, Do you want to continue?</Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={continueHandler}>
              Continue
            </Button>
            <Button variant="secondary" onClick={finishHandler}>
              Quit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
