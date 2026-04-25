import React, { useState, useEffect } from 'react';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MoreVertical, MessageSquare } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Sidebar = ({ setSelectedConversation, selectedConversation, onlineUsers }) => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await API.get('/conversations');
        setConversations(data);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };
    fetchConversations();
  }, [selectedConversation]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
      setShowUsers(true);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const startNewChat = (otherUser) => {
    const existingConv = conversations.find(conv => 
      conv.participants.some(p => p._id === otherUser._id)
    );

    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      setSelectedConversation({
        _id: null,
        participants: [user, otherUser],
        messages: []
      });
    }
    setShowUsers(false);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants?.find(p => p._id !== user?._id);
    if (!otherParticipant) return false;
    return otherParticipant.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="sidebar">
      {showProfileInfo && <ProfileModal onClose={() => setShowProfileInfo(false)} />}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowProfileInfo(true)}>
          <img src={user?.avatar} alt="Me" className="avatar" style={{ width: '45px', height: '45px', border: '2px solid var(--primary-color)' }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--primary-color)' }}>Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
          <MessageSquare 
            size={22} 
            style={{ cursor: 'pointer', transition: 'color 0.3s' }}
            onClick={fetchUsers} 
          />
          <MoreVertical 
            size={22} 
            style={{ cursor: 'pointer' }}
            onClick={logout} 
            title="Logout" 
          />
        </div>
      </div>

      <div className="sidebar-search">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            className="search-input" 
            placeholder="Search or start new chat..." 
            style={{ paddingLeft: '42px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="conversation-list">
        {showUsers ? (
          <>
            <div 
              style={{ 
                padding: '12px 20px', 
                color: 'var(--primary-color)', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }} 
              onClick={() => setShowUsers(false)}
            >
              <span>←</span> Back to Conversations
            </div>
            {users.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No other users found
              </div>
            )}
            {users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u._id} className="conversation-item" onClick={() => startNewChat(u)}>
                <img src={u.avatar} alt={u.name} className="avatar" />
                <div className="conv-info">
                  <div className="conv-name">{u.name}</div>
                  <div className="conv-last-msg">{u.email}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {filteredConversations.length === 0 && !search && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <MessageSquare size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p style={{ fontSize: '14px' }}>No conversations yet.<br/>Click the icon above to start one!</p>
              </div>
            )}
            {filteredConversations.map((conv) => {
              const otherUser = conv.participants?.find(p => p._id !== user?._id);
              if (!otherUser) return null;
              const isOnline = onlineUsers.includes(otherUser._id);
              
              return (
                <div 
                  key={conv._id} 
                  className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={otherUser.avatar} alt={otherUser.name} className="avatar" />
                    {isOnline && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '4px', 
                        right: '18px', 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: 'var(--primary-color)', 
                        borderRadius: '50%', 
                        border: '2px solid var(--bg-dark)',
                        boxShadow: '0 0 10px var(--primary-glow)'
                      }} />
                    )}
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <span className="conv-name">{otherUser.name}</span>
                      <span className="conv-time">
                        {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="conv-last-msg" style={{ color: isOnline ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {conv.lastMessage?.content || 'Started a conversation'}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
