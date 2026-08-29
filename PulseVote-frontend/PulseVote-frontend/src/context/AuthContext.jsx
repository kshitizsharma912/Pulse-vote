import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("pulsevote_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("pulsevote_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("pulsevote_token", token);
    } else {
      localStorage.removeItem("pulsevote_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("pulsevote_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pulsevote_user");
    }
  }, [user]);

  function login(authData) {
    setToken(authData.access_token);
    setUser(authData.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    isLoggedIn: Boolean(token && user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}