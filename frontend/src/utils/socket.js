import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5555';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
