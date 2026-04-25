import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/axios';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import { Send, Paperclip, Smile, MoreVertical, Search, MessageSquare, Phone, Video, ArrowLeft } from 'lucide-react';
import Message from './Message';
import Peer from 'simple-peer/simplepeer.min.js';
import CallWindow from './CallWindow';

const ChatBox = ({ conversation, setConversation, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState(null);
  const { user } = useAuth();
  const scrollRef = useRef();
  
  const otherUser = conversation.participants.find(p => p._id !== user._id);
  const isOnline = onlineUsers.includes(otherUser?._id);

  // WebRTC State
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState();
  const connectionRef = useRef();

  useEffect(() => {
    if (!conversation._id) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${conversation._id}`);
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [conversation._id]);

  useEffect(() => {
    const messageHandler = (message) => {
      const convId = message.conversation?._id || message.conversation;
      if (convId === conversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('getMessage', messageHandler);

    socket.on('callUser', (data) => {
      if(data.from !== user._id) {
        setReceivingCall(true);
        setInCall(true);
        setCaller(data.from);
        setCallerName(data.name);
        setCallerSignal(data.signal);
      }
    });

    socket.on('endCall', () => {
      leaveCall(false); // false means don't emit endCall again
    });

    return () => {
      socket.off('getMessage', messageHandler);
      socket.off('callUser');
      socket.off('endCall');
    };
  }, [conversation._id, user._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage && !image) return;

    const formData = new FormData();
    formData.append('receiverId', otherUser._id);
    if (conversation._id) {
      formData.append('conversationId', conversation._id);
    }
    if (newMessage) formData.append('content', newMessage);
    if (image) formData.append('image', image);

    try {
      const { data } = await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setMessages((prev) => [...prev, data]);
      socket.emit('sendMessage', { ...data, receiverId: otherUser._id });

      if (!conversation._id && data.conversation) {
        const convId = data.conversation._id || data.conversation;
        if (setConversation) {
          setConversation(prev => ({ ...prev, _id: convId }));
        }
      }

      setNewMessage('');
      setImage(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- WebRTC Functions ---
  const requestMedia = async (video = true) => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setStream(currentStream);
      return currentStream;
    } catch(err) {
      console.error("Camera access denied", err);
      alert("Camera or microphone access denied");
      return null;
    }
  }

  const callUser = async () => {
    const currentStream = await requestMedia(true);
    if(!currentStream) return;
    
    setInCall(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: currentStream
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: otherUser._id,
        signalData: data,
        from: user._id,
        name: user.name
      });
    });

    peer.on("stream", (stream) => {
      setRemoteStream(stream);
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const currentStream = await requestMedia(true);
    if(!currentStream) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      setRemoteStream(stream);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = (emitEnd = true) => {
    setCallEnded(true);
    setInCall(false);
    setReceivingCall(false);
    setCallAccepted(false);
    setRemoteStream(null);
    
    if(stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    
    if(emitEnd && otherUser) {
       socket.emit("endCall", { to: otherUser._id });
    }
    
    // Reset page basically
    window.location.reload();
  };

  return (
    <div className="chat-window">
      {inCall && (
        <CallWindow 
          localStream={stream} 
          remoteStream={remoteStream} 
          callAccepted={callAccepted} 
          callEnded={callEnded} 
          endCall={leaveCall} 
          name={receivingCall ? callerName : otherUser.name} 
          receivingCall={receivingCall} 
          answerCall={answerCall}
        />
      )}

      <div className="chat-header">
        <div className="mobile-back-btn" onClick={() => setConversation(null)} style={{ marginRight: '15px', cursor: 'pointer', display: 'none' }}>
          <ArrowLeft size={24} color="var(--primary-color)" />
        </div>
        <div style={{ position: 'relative', marginRight: '16px' }}>
          <img src={otherUser?.avatar} alt={otherUser?.name} className="avatar" style={{ width: '45px', height: '45px', margin: 0 }} />
          {isOnline && (
            <div style={{ 
              position: 'absolute', 
              bottom: '2px', 
              right: '2px', 
              width: '12px', 
              height: '12px', 
              backgroundColor: 'var(--primary-color)', 
              borderRadius: '50%', 
              border: '2px solid var(--bg-dark)',
              boxShadow: '0 0 10px var(--primary-glow)'
            }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="conv-name" style={{ fontSize: '17px' }}>{otherUser?.name}</div>
          <div style={{ fontSize: '12px', color: isOnline ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: isOnline ? '600' : '400' }}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)' }}>
          <Phone size={20} cursor="pointer" onClick={callUser} style={{ hover: { color: 'var(--primary-color)'} }} />
          <Video size={20} cursor="pointer" onClick={callUser} />
          <MoreVertical size={20} cursor="pointer" />
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={48} style={{ marginBottom: '10px' }} />
              <p>No messages yet. Say hi!</p>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div 
            key={msg._id || index} 
            className={`message-row ${msg.sender?._id === user._id || msg.sender === user._id ? 'sent' : 'received'}`} 
            ref={index === messages.length - 1 ? scrollRef : null}
          >
            <Message message={msg} isOwn={msg.sender?._id === user._id || msg.sender === user._id} />
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)' }}>
          <Smile size={24} cursor="pointer" />
          <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center' }}>
            <Paperclip size={24} cursor="pointer" />
          </label>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          hidden 
          onChange={(e) => setImage(e.target.files[0])} 
        />
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            className="chat-input" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {image && (
            <div style={{ 
              position: 'absolute', 
              top: '-40px', 
              left: '0', 
              background: 'var(--glass-bg)', 
              padding: '4px 12px', 
              borderRadius: '8px',
              fontSize: '12px',
              border: '1px solid var(--primary-color)'
            }}>
              📎 {image.name}
            </div>
          )}
        </div>
        <button 
          className="send-button"
          onClick={handleSend}
          disabled={!newMessage && !image}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
