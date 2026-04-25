const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables IMMEDIATELY
const envPath = path.join(__dirname, 'config.env');
dotenv.config({ path: envPath });

const connectDB = require('./config/db');

// Main Startup Function
const start = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB Connected successfully!');

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Middleware
    app.use(express.json());
    app.use(cors({
      origin: (origin, callback) => callback(null, true),
      credentials: true
    }));

    // Basic Route
    app.get('/', (req, res) => {
      res.send('Chat API is running...');
    });

    // Register Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/messages', require('./routes/messages'));
    app.use('/api/conversations', require('./routes/conversations'));

    // Error Handler
    app.use((err, req, res, next) => {
      console.error('SERVER ERROR:', err.stack);
      res.status(500).json({ message: err.message });
    });

    // Socket.IO logic
    let onlineUsers = new Map();
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} joined with socket ${socket.id}`);
      });

      socket.on('sendMessage', (message) => {
        const receiverSocketId = onlineUsers.get(message.receiverId || message.receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('getMessage', message);
        }
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
      });

      // WebRTC Signaling
      socket.on('callUser', ({ userToCall, signalData, from, name }) => {
        const receiverSocketId = onlineUsers.get(userToCall);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('callUser', { signal: signalData, from, name });
        }
      });

      socket.on('answerCall', (data) => {
        const callerSocketId = onlineUsers.get(data.to);
        if (callerSocketId) {
          io.to(callerSocketId).emit('callAccepted', data.signal);
        }
      });

      socket.on('endCall', ({ to }) => {
        const socketId = onlineUsers.get(to);
        if (socketId) {
          io.to(socketId).emit('endCall');
        }
      });
    });

    const PORT = process.env.PORT || 5555;
    
    // Serve frontend static files in production
    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend/dist")));

      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
      });
    }

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('CRITICAL ERROR DURING STARTUP:', err);
    process.exit(1);
  }
};

start();
