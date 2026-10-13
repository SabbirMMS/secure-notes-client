import { createContext, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError("");
  }

  useEffect(() => {
    function expired() {
      logout();
    }
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api("/api/auth/me")
      .then(({ user }) => {
        if (active) setUser(user);
      })
      .catch((error) => {
        if (active) setError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError("");
  }

  async function register(name, email, password) {
    await api("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    await login(email, password);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
