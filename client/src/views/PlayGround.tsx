import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
import '../css/playground.css';
import { getPlaygroundSocketClient } from '../socket.js';
import { GameData } from '../types.js';

export default function PlayGround() {
  const [error, setError] = useState('');
  const [gameData, setGameData] = useState<GameData | null>();
  const [myTurn, setMyTurn] = useState<'X' | 'O' | null>();
  const location = useLocation();
  const gameId = location.state.gameId;
  const { user } = useAuth();
  console.log('### playground screen', user);
  // socket logic
  const socket = getPlaygroundSocketClient(gameId);

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

  // game logic
  // const [cells, setCells] = useState(Array(9).fill(''));

  const handleClick = (index: number) => {
    console.log('#### index', index);
  };

  const Cell = ({ index }: { index: number }) => {
    return <div className="cell" data-index={index} onClick={() => handleClick(index)}></div>;
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
        <div className="board mx-auto">
          <Cell index={0} />
          <Cell index={1} />
          <Cell index={2} />
          <Cell index={3} />
          <Cell index={4} />
          <Cell index={5} />
          <Cell index={6} />
          <Cell index={7} />
          <Cell index={8} />
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
        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
          Launch demo modal
        </button>
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Game Is Over
                </h5>
              </div>
              <div className="modal-body">Do you want to continue?</div>
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
        </div>
      </div>
    </>
  );
}
