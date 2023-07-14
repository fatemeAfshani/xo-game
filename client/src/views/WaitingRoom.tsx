import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWaitingSocketClient } from '../socket.js';

export default function WaitingRoom() {
  const location = useLocation();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const gameId = location.state.gameId;

  const socket = getWaitingSocketClient(gameId);

  socket.on('disconnect', () => {
    setError('unable to connect to server');
  });

  socket.on('someOneJoined', () => {
    console.log('###### on getting noticed that some one joind');
    // socket.disconnect();
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
