import React, { useState } from 'react';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Upload, RefreshCw, X, User as UserIcon } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      // Create a random hash to get a new Bottts avatar
      const randomSeed = Math.random().toString(36).substring(2, 15);
      const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
      
      const { data } = await API.put('/users/profile', { avatar: newAvatarUrl });
      updateUser({ avatar: data.avatar });
    } catch (err) {
      console.error('Failed to regenerate avatar:', err);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', image);

    try {
      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
      setImage(null);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 5, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'rgba(15, 15, 30, 0.9)',
        border: '1px solid var(--primary-color)',
        borderRadius: '24px',
        padding: '40px',
        width: '450px',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <X 
          size={24} 
          style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
          onClick={onClose}
        />
        
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px var(--primary-glow)' }}>
          Profile Matrix
        </h2>

        {/* Current Avatar Display */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <img 
            src={user?.avatar} 
            alt="Profile Matrix"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              border: '3px solid var(--primary-color)',
              boxShadow: '0 0 30px var(--primary-glow)',
              objectFit: 'cover'
            }}
          />
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>
          Alter your digital representation in the network.
        </p>

        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          <button 
            onClick={handleRegenerate}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid var(--secondary-color)',
              color: 'var(--secondary-color)',
              padding: '12px',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 15px var(--secondary-glow)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <RefreshCw size={18} className={loading && !image ? "spin" : ""} /> Scramble
          </button>

          <form onSubmit={handleUpload} style={{ flex: 1, display: 'flex' }}>
            {image ? (
              <button 
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'var(--primary-color)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px var(--primary-glow)'
                }}
              >
                <Upload size={18} /> Save
              </button>
            ) : (
              <label 
                style={{
                  flex: 1,
                  background: 'rgba(0, 243, 255, 0.1)',
                  color: 'var(--primary-color)',
                  border: '1px solid var(--primary-color)',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 15px var(--primary-glow)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <UserIcon size={18} /> Upload
                <input 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => {
                    if(e.target.files[0]) setImage(e.target.files[0]);
                  }} 
                />
              </label>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
