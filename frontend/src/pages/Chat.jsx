import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import { MessageSquare } from 'lucide-react';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socket.connect();

      // Wait for connection before emitting join
      socket.on('connect', () => {
        socket.emit('join', user._id);
      });

      // If already connected, emit immediately
      if (socket.connected) {
        socket.emit('join', user._id);
      }

      socket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('connect');
        socket.off('getOnlineUsers');
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <div className="app-container">
      <div className={`sidebar-container ${selectedConversation ? 'mobile-hidden' : 'mobile-active'}`} style={{ display: 'flex', flex: selectedConversation ? '0 0 380px' : '1', height: '100%' }}>
        <Sidebar 
          setSelectedConversation={setSelectedConversation} 
          selectedConversation={selectedConversation}
          onlineUsers={onlineUsers}
        />
      </div>
      
      <div className={`chat-container ${selectedConversation ? 'mobile-active' : 'mobile-hidden'}`} style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', maxWidth: '100%' }}>
        {selectedConversation ? (
          <ChatBox 
            conversation={selectedConversation} 
            setConversation={setSelectedConversation}
            onlineUsers={onlineUsers}
          />
        ) : (
          <div className="chat-window" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <MessageSquare size={80} style={{ marginBottom: '20px', color: 'var(--primary-color)' }} />
              <h1 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '24px' }}>Welcome to Chatrix</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
