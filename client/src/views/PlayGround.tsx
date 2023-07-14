import { useCallback, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
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

  console.log('#### cellClassNamse', cellClassNames);
  const x_Class = 'X';
  // const o_Class = 'O';

  const location = useLocation();
  const navigate = useNavigate();
  const gameId = location.state.gameId;
  const { user } = useAuth();

  console.log('### playground screen', user);

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
    const newClassNames = cells.map((cell) => {
      if (cell === 0) {
        return 'cell';
      } else if (cell === x_Class) {
        return 'cell X';
      } else {
        return 'cell O';
      }
    });

    console.log('#### cell class name in continue game', newClassNames);
    setCellClassNames(newClassNames);

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
    console.log('##### new game?', newGame);
    if (newGame) {
      startGame();
    } else {
      continueGame();
    }
  }, [cells, continueGame, startGame]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameDecision) setGameDecision('');
    if (gameStatus) setGameStatus('');
    console.log('#### e.target', e.target);
    const cell = e.target as Element;
    const cellIndex = cell.getAttribute('data-index') as unknown as number;
    console.log('### cellIndex', cellIndex, cells[cellIndex]);
    if (cells[cellIndex] !== 'X' && cells[cellIndex] !== 'O' && turn == myTurn) {
      console.log('#### here');
      cellClassNames[cellIndex] = `cell ${myTurn}`;
      console.log('#### updatd cellClass name', cellClassNames);
      setCellClassNames(cellClassNames);
      const data = {
        turn,
        index: cellIndex,
        gameId,
      };

      socket.emit('userMove', data);
      setHover();
    }
  };

  const continueHandler = () => {
    socket.emit('continue', { gameId });
    setShowModal(false);
  };

  const finishHandler = () => {
    socket.emit('finish', { gameId });
    setShowModal(false);
  };

  // socket logic

  socket.on('disconnect', () => {
    setError('unable to connect to server');
  });

  socket.on('gameData', (game: GameData) => {
    console.log('#### game data in playground', game);
    if (game?.user1?._id === user?.userId) {
      setMyTurn('X');
    } else {
      setMyTurn('O');
    }
    setGameData(game);
  });

  socket.on('gameMoves', (moves: Move[]) => {
    console.log('#### moves', moves);
    setCells(moves);
  });

  socket.on('gameTurn', (turn: 'X' | 'O') => {
    console.log('#### turn', turn);
    setTurn(turn);
  });

  socket.on('changesForUser', ({ moves, newTurn }: { moves: Move[]; newTurn: 'X' | 'O' }) => {
    setTurn(newTurn);
    setCells(moves);
    continueGame();
  });

  socket.on('endRound', ({ status }: { game: GameData; status: string }) => {
    setGameStatus(status);

    setShowModal(true);
  });

  socket.on('otherUserDecision', ({ decision }: { decision: 'continue' | 'finish' }) => {
    setGameDecision(decision);
  });

  socket.on('acceptContinue', ({ moves, turn, game }: { moves: Move[]; turn: 'X' | 'O'; game: GameData }) => {
    setCells(moves);
    setTurn(turn);
    setGameData(game);
    startGame();
  });

  socket.on('acceptFinish', () => {
    navigate('/', { replace: true });
  });

  // cell component
  const Cell = ({ id, cell, className }: { id: number; cell: Move; className: string }) => {
    console.log('#### cell', cell);
    console.log('#### classnames', className);

    return <div className={className} data-index={id} onClick={handleClick}></div>;
  };

  return (
    <>
      <div className="text-center min-vh-100">
        <h4 className="m-3">Play Gound</h4>
        {/* <p id="error-message" className="error-message"></p> */}
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
        {/* <h4>messages</h4>
    <ul id="messages"></ul>
    <p id="game-message" className="error-message"></p>
    <form id="messageForm" className="form">
      <h3>send message</h3>
      <p className="error-message"></p>
      <input
        type="text"
        name="msgInput"
        placeholder="message"
        required
        />
      <button type="submit">send</button>
    </form> */}
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
            return <Cell key={index} id={index} cell={cell} className={cellClassNames[index]} />;
          })}
        </div>
        {/* <script id="message-template" type="text/html">
      <li className="list-li">
        <span>{{nickName}}</span>
        <span>{{createdAt}}</span>
        <p>{{msg}}</p>
      </li>
    </script>

    <script id="message-history-template" type="text/html">
      <!-- this is a specific syntax for refering an array between this two tags we say what we want to do with array items -->
      {{#messages}}

      <li className="list-li">
        <span>{{nickName}}</span>
        <span>{{createdAt}}</span>
        <p>{{text}}</p>
      </li>
      {{/messages}}
    </script> */}

        {/* <div
          className="modal fade"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          show={showModal}
          onHide={handleCloseModal}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Game Is Over
                </h5>
              </div>
              <div className="modal-body">{gameStatus}, Do you want to continue?</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-dark" data-bs-dismiss="modal">
                  Continue
                </button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Quit
                </button>
              </div>
            </div>
          </div>
  </div> */}

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
