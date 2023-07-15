import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../socket.js';
const socket = getSocket();

export default function WaitingRoom() {
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(-1);

  const location = useLocation();
  const navigate = useNavigate();
  const gameId = location.state.gameId;

  useEffect(() => {
    socket.emit('join', {
      gameId,
      status: 'waiting',
    });

    socket.on('gameTtl', (ttl: number) => {
      setTimer(ttl);
    });
  }, [gameId]);

  useEffect(() => {
    socket.on('disconnect', () => {
      setError('unable to connect to server');
    });
  }, []);

  useEffect(() => {
    socket.on('someOneJoined', () => {
      navigate('/playground', { state: { gameId }, replace: true });
    });
  }, [gameId, navigate]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      clearInterval(countdown);
      navigate('/', { replace: true });
    }

    return () => {
      clearInterval(countdown);
    };
  }, [timer, navigate]);

  const minutes = Math.floor(timer / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timer % 60).toString().padStart(2, '0');

  return (
    <>
      <div className="container vh-100">
        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}
        <div className="h4 my-5">Waiting for someone to join ... </div>
        <div>
          <h4>
            Countdown: {minutes} : {seconds}{' '}
          </h4>
        </div>
      </div>
    </>
  );
}
