import React from 'react';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

const RequestsModal = ({ onClose }) => {
  const { user, refreshUser } = useAuth();

  const handleAccept = async (id) => {
    try {
      await API.post(`/users/accept/${id}`);
      await refreshUser();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/users/reject/${id}`);
      await refreshUser();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '30px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Connection Requests</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {(!user?.connectionRequests || user.connectionRequests.length === 0) ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
              No pending requests.
            </div>
          ) : (
            user.connectionRequests.map(reqUser => (
              <div key={reqUser._id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <img src={reqUser.avatar} alt={reqUser.name} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{reqUser.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Wants to connect</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAccept(reqUser._id)} style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Check size={18} />
                  </button>
                  <button onClick={() => handleReject(reqUser._id)} style={{ background: 'rgba(255, 0, 60, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsModal;
