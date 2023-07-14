import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

let waitingSocket: Socket;
let playgroundSocket: Socket;

export const getWaitingSocketClient = (gameId: string): Socket => {
  console.log('### gameIdddd', gameId);
  if (waitingSocket) {
    console.log('##### returning socketttt');
    return waitingSocket;
  }
  console.log('#### creating socketttt');
  waitingSocket = io(`${import.meta.env.VITE_URL as string}/playground`, {
    extraHeaders: {
      game: gameId,
      status: 'waiting',
    },
  });

  console.log('#### connecting to socket playgroundddd');

  waitingSocket.on('connect', () => {
    console.log('im connected to playgrounddddd');
  });

  return waitingSocket;
};

export const getPlaygroundSocketClient = (gameId: string): Socket => {
  console.log('### gameIdddddddddddddddddd', gameId);
  if (playgroundSocket) {
    console.log('##### returning sockettttt');
    return playgroundSocket;
  }
  console.log('#### creating sockettttt');
  playgroundSocket = io(`${import.meta.env.VITE_URL as string}/playground`, {
    extraHeaders: {
      game: gameId,
      status: 'play',
    },
  });

  console.log('#### connecting to socket playgroundddddddddddddd');

  playgroundSocket.on('connect', () => {
    console.log('im connected to playgroundddddddddddddddddd');
  });

  return playgroundSocket;
};
