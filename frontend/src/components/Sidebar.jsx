import React, { useState, useEffect } from 'react';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, MessageSquare, UserPlus, Bell } from 'lucide-react';
import ProfileModal from './ProfileModal';
import RequestsModal from './RequestsModal';

const Sidebar = ({ setSelectedConversation, selectedConversation, onlineUsers }) => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const { user, logout, refreshUser } = useAuth();

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
      await refreshUser(); // refresh current user profile to get latest contacts
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const sendConnectionRequest = async (targetUserId) => {
    try {
      await API.post(`/users/request/${targetUserId}`);
      await refreshUser();
    } catch (err) {
      console.error('Failed to send request:', err);
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
      {showRequests && <RequestsModal onClose={() => setShowRequests(false)} />}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowProfileInfo(true)}>
          <img src={user?.avatar} alt="Me" className="avatar" style={{ width: '45px', height: '45px', border: '2px solid var(--primary-color)' }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--primary-color)' }}>Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowRequests(true)}>
            <Bell size={22} style={{ transition: 'color 0.3s' }} />
            {user?.connectionRequests?.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.connectionRequests.length}
              </span>
            )}
          </div>
          <UserPlus 
            size={22} 
            style={{ cursor: 'pointer', transition: 'color 0.3s' }}
            onClick={fetchUsers} 
            title="Find Users"
          />
          <LogOut 
            size={22} 
            style={{ cursor: 'pointer', color: 'var(--danger)', transition: 'opacity 0.3s' }}
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
            {users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map(u => {
              const isContact = user?.contacts?.some(c => (c._id || c) === u._id);
              const isPending = user?.sentRequests?.some(r => (r._id || r) === u._id);
              const hasIncoming = user?.connectionRequests?.some(r => (r._id || r) === u._id);

              return (
                <div key={u._id} className="conversation-item" style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                  <img src={u.avatar} alt={u.name} className="avatar" />
                  <div className="conv-info">
                    <div className="conv-name">{u.name}</div>
                    <div className="conv-last-msg">{u.email}</div>
                  </div>
                  <div>
                    {isContact ? (
                      <button onClick={() => startNewChat(u)} style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px' }}>Chat</button>
                    ) : hasIncoming ? (
                      <button onClick={() => setShowRequests(true)} style={{ background: 'var(--secondary-color)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px' }}>Review</button>
                    ) : isPending ? (
                      <button disabled style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', opacity: 0.7 }}>Pending</button>
                    ) : (
                      <button onClick={() => sendConnectionRequest(u._id)} style={{ background: 'var(--primary-color)', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Add</button>
                    )}
                  </div>
                </div>
              );
            })}
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
