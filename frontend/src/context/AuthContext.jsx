import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setUser({ ...user, ...data });
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Fetch fresh profile in background to update contacts/requests
      API.get('/users/profile').then(({ data }) => {
        setUser(prev => ({ ...prev, ...data }));
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(storedUser), ...data }));
      }).catch(err => console.error(err));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
