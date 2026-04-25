import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, PhoneForwarded, Phone, Video, Mic, MicOff } from 'lucide-react';

const CallWindow = ({ 
  localStream, 
  remoteStream, 
  callAccepted, 
  callEnded, 
  endCall, 
  name, 
  receivingCall, 
  answerCall,
  callType = 'video'
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const ringtoneRef = useRef(null);
  const [ringPulse, setRingPulse] = useState(0);

  const isVideo = callType === 'video';
  const isRinging = receivingCall && !callAccepted;
  const isWaiting = !receivingCall && !callAccepted;

  // Ringtone using Web Audio API
  useEffect(() => {
    if (!isRinging && !isWaiting) {
      if (ringtoneRef.current) {
        ringtoneRef.current.close();
        ringtoneRef.current = null;
      }
      return;
    }

    let audioCtx;
    let intervalId;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ringtoneRef.current = audioCtx;

      const playRingTone = () => {
        if (audioCtx.state === 'closed') return;
        
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = isRinging ? 440 : 400;
        osc2.type = 'sine';
        osc2.frequency.value = isRinging ? 480 : 450;

        gainNode.gain.value = 0.12;

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        osc1.start(now);
        osc2.start(now);
        
        // Ring pattern: 0.4s on, 0.2s off, 0.4s on
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.setValueAtTime(0, now + 0.4);
        gainNode.gain.setValueAtTime(0.12, now + 0.6);
        gainNode.gain.setValueAtTime(0, now + 1.0);
        
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      };

      playRingTone();
      intervalId = setInterval(playRingTone, 2000);
    } catch (err) {
      console.error('Ringtone error:', err);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
      ringtoneRef.current = null;
    };
  }, [isRinging, isWaiting]);

  // Pulse animation for ringing
  useEffect(() => {
    if (!isRinging && !isWaiting) return;
    const interval = setInterval(() => {
      setRingPulse(prev => (prev + 1) % 3);
    }, 600);
    return () => clearInterval(interval);
  }, [isRinging, isWaiting]);

  // Stop ringtone when call is accepted
  useEffect(() => {
    if (callAccepted && ringtoneRef.current && ringtoneRef.current.state !== 'closed') {
      ringtoneRef.current.close();
      ringtoneRef.current = null;
    }
  }, [callAccepted]);

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
      background: 'linear-gradient(135deg, rgba(5,5,15,0.98) 0%, rgba(10,10,30,0.98) 100%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(20px)',
      animation: 'fadeInApp 0.3s ease'
    }}>

      {/* Ringing / Waiting State */}
      {(isRinging || isWaiting) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* Pulsing avatar ring */}
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${140 + i * 30}px`,
                height: `${140 + i * 30}px`,
                borderRadius: '50%',
                border: `2px solid ${isRinging ? 'var(--primary-color)' : 'var(--secondary-color)'}`,
                opacity: ringPulse === i ? 0.6 : 0.15,
                transition: 'opacity 0.5s ease',
              }} />
            ))}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px', height: '100px',
              borderRadius: '50%',
              background: isRinging 
                ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' 
                : 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRinging 
                ? '0 0 40px var(--primary-glow)' 
                : '0 0 40px var(--secondary-glow)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              {isVideo ? <Video size={40} color="#000" /> : <Phone size={40} color="#000" />}
            </div>
          </div>

          <h2 style={{ 
            color: '#fff', 
            marginTop: '10px', 
            fontSize: '24px', 
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            {name}
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {isRinging 
              ? `Incoming ${isVideo ? 'Video' : 'Voice'} Call...` 
              : `Calling... Ringing`}
          </p>

          <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
            {isRinging && (
              <button 
                onClick={answerCall}
                style={{
                  background: 'linear-gradient(135deg, #00f3ff, #00c853)',
                  color: '#000',
                  padding: '18px 36px',
                  borderRadius: '40px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 30px rgba(0, 200, 83, 0.4)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                <PhoneForwarded size={20} /> Accept
              </button>
            )}

            <button 
              onClick={endCall}
              style={{
                background: 'linear-gradient(135deg, #ff003c, #ff4444)',
                color: '#fff',
                padding: '18px 36px',
                borderRadius: '40px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 0 30px rgba(255, 0, 60, 0.4)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <PhoneOff size={20} /> {isRinging ? 'Decline' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Active Call State */}
      {callAccepted && !callEnded && (
        <>
          <h2 style={{ 
            color: 'var(--primary-color)', 
            marginBottom: '20px', 
            fontSize: '18px',
            textTransform: 'uppercase', 
            letterSpacing: '2px' 
          }}>
            {isVideo ? '📹' : '🎙️'} In Call with {name}
          </h2>

          {isVideo ? (
            /* Video Call Layout */
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <video 
                  playsInline 
                  muted 
                  ref={localVideoRef} 
                  autoPlay 
                  style={{ 
                    width: '250px', 
                    borderRadius: '20px', 
                    border: '2px solid var(--primary-color)',
                    boxShadow: '0 0 20px var(--primary-glow)'
                  }} 
                />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '10px', fontSize: '12px' }}>You</div>
              </div>

              <div style={{ position: 'relative' }}>
                <video 
                  playsInline 
                  ref={remoteVideoRef} 
                  autoPlay 
                  style={{ 
                    width: '450px', 
                    maxWidth: '80vw',
                    borderRadius: '20px', 
                    border: '2px solid var(--secondary-color)',
                    boxShadow: '0 0 20px var(--secondary-glow)'
                  }} 
                />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '10px', fontSize: '12px' }}>{name}</div>
              </div>
            </div>
          ) : (
            /* Audio Call Layout */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <div style={{
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px var(--primary-glow)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <Mic size={50} color="#000" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Voice call connected</p>
              {/* Hidden audio elements for voice call */}
              <audio ref={localVideoRef} autoPlay muted style={{ display: 'none' }} />
              <audio ref={remoteVideoRef} autoPlay style={{ display: 'none' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '30px' }}>
            <button 
              onClick={endCall}
              style={{
                background: 'linear-gradient(135deg, #ff003c, #ff4444)',
                color: '#fff',
                padding: '16px 36px',
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(255,0,60,0.5)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <PhoneOff size={20} /> End Call
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CallWindow;
