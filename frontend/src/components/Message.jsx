import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const Message = ({ message, isOwn }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`} style={{ 
      animationDelay: '0.1s',
      backdropFilter: isOwn ? 'none' : 'blur(5px)'
    }}>
      {message.image && (
        <div style={{ position: 'relative', marginBottom: '8px', cursor: 'zoom-in' }}>
          <img 
            src={message.image} 
            alt="Shared media" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '12px', 
              display: 'block',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }} 
          />
        </div>
      )}
      <div style={{ wordBreak: 'break-word', fontSize: '15px' }}>{message.content}</div>
      <div className="message-meta">
        <span style={{ fontSize: '10px', opacity: 0.7 }}>{time}</span>
        {isOwn && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {message.status === 'seen' ? (
              <CheckCheck size={15} color="var(--secondary-color)" style={{ filter: 'drop-shadow(0 0 5px var(--secondary-glow))' }} />
            ) : message.status === 'delivered' ? (
              <CheckCheck size={15} style={{ opacity: 0.7 }} />
            ) : (
              <Check size={15} style={{ opacity: 0.5 }} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;
