import { io } from 'socket.io-client';

// Hardcoded for Vercel/Render production, fallback to localhost for development
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://chattrix-chat-application.onrender.com' 
  : 'http://localhost:5555';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
