import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../socket.js';
const socket = getSocket();

export default function WaitingRoom() {
  const location = useLocation();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const gameId = location.state.gameId;

  useEffect(() => {
    socket.emit('join', {
      gameId,
      status: 'waiting',
    });
  }, [gameId]);

  socket.on('disconnect', () => {
    setError('unable to connect to server');
  });

  socket.on('someOneJoined', () => {
    console.log('###### on getting noticed that some one joind');
    navigate('/playground', { state: { gameId }, replace: true });
  });

  //get game ttl
  //   useEffect(() => {

  //   }, [])

  return (
    <>
      <div className="container vh-100">
        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}
        <div className="h5 my-5">Waiting for someone to join ... </div>
        {/*  implement timer */}
      </div>
    </>
  );
}
