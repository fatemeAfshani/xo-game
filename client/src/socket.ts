import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

let socket = io(`${import.meta.env.VITE_URL as string}/playground`);

socket.on('connect', () => {
  console.log('im connected to playgrounddddd');
});
export const getSocket = (): Socket => {
  if (socket) {
    console.log('##### returning socketttt');
    return socket;
  }
  console.log('#### creating socketttt');
  socket = io(`${import.meta.env.VITE_URL as string}/playground`);
  return socket;
};
