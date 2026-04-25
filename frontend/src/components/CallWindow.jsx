import React, { useEffect, useRef } from 'react';
import { PhoneOff, MicOff, VideoOff, PhoneForwarded } from 'lucide-react';

const CallWindow = ({ 
  localStream, 
  remoteStream, 
  callAccepted, 
  callEnded, 
  endCall, 
  name, 
  receivingCall, 
  answerCall 
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 5, 15, 0.95)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      animation: 'fadeInApp 0.3s ease'
    }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        {receivingCall && !callAccepted ? `Incoming Call from ${name}...` : `In Call with ${name}`}
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ position: 'relative' }}>
          <video 
            playsInline 
            muted 
            ref={localVideoRef} 
            autoPlay 
            style={{ 
              width: '300px', 
              borderRadius: '20px', 
              border: '2px solid var(--primary-color)',
              boxShadow: '0 0 20px var(--primary-glow)'
            }} 
          />
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px' }}>You</div>
        </div>

        {callAccepted && !callEnded && (
          <div style={{ position: 'relative' }}>
            <video 
              playsInline 
              ref={remoteVideoRef} 
              autoPlay 
              style={{ 
                width: '500px', 
                borderRadius: '20px', 
                border: '2px solid var(--secondary-color)',
                boxShadow: '0 0 20px var(--secondary-glow)'
              }} 
            />
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px' }}>{name}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {receivingCall && !callAccepted ? (
          <button 
            onClick={answerCall}
            style={{
              background: 'var(--primary-color)',
              color: '#000',
              padding: '16px 32px',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 0 20px var(--primary-glow)'
            }}
          >
            <PhoneForwarded size={20} /> Answer Call
          </button>
        ) : null}

        <button 
          onClick={endCall}
          style={{
            background: 'var(--danger)',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: '30px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(255,0,60,0.5)'
          }}
        >
          <PhoneOff size={20} /> End Call
        </button>
      </div>
    </div>
  );
};

export default CallWindow;
