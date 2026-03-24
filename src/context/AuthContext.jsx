import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [isAuth, setIsAuth] = useState(!!token);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('adminUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      setIsAuth(true);
      // Update instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('adminToken');
      setIsAuth(false);
      delete axios.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      // Use the api instance to ensure consistent baseURL and headers
      const res = await api.post('/user/login', credentials);
      
      // More robust token extraction handling various backend response structures
      const data = res.data;
      const receivedToken = data.token || 
                           (data.data && typeof data.data === 'string' ? data.data : data.data?.token) || 
                           data.accessToken;
      
      if (receivedToken) {
        // SET IMMEDIATELY to avoid race conditions
        localStorage.setItem('adminToken', receivedToken);
        
        // Update both api and axios instances (axios as fallback)
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        
        setToken(receivedToken);
        setIsAuth(true); // Immediate update for UI
        
        // Try to save user info
        const userData = data.data && typeof data.data === 'object' ? data.data : (data.user || data);
        if (userData && (userData.name || userData.email || userData.role !== undefined)) {
          localStorage.setItem('adminUser', JSON.stringify(userData));
          setUser(userData);
        }

        return true;
      } else {
        console.error("Login response structure unknown:", data);
        throw new Error('No token received from API. Please check backend response.');
      }
    } catch (error) {
      console.error("Login failed:", error?.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
