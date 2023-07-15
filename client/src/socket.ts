import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

let socket = io(`${import.meta.env.VITE_URL as string}/playground`);

socket.on('connect', () => {
  console.log('im connected to playground socket');
});
export const getSocket = (): Socket => {
  if (socket) {
    console.log('##### returning socket');
    return socket;
  }
  console.log('#### creating socket');
  socket = io(`${import.meta.env.VITE_URL as string}/playground`);
  return socket;
};
