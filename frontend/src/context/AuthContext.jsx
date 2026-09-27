import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('storix_token')
  );
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
  const response = await authApi.login(email, password);

  localStorage.setItem('storix_token', response.token);
  setToken(response.token);

  return response;
};

  const register = async (name, email, password) => {
  const response = await authApi.register(
    name,
    email,
    password
  );

  localStorage.setItem('storix_token', response.token);
  setToken(response.token);

  return response;
};

  const logout = () => {
  localStorage.removeItem('storix_token');
  setToken(null);
  setUser(null);
  navigate('/login');
};

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}