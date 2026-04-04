import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, []);

  // Khi app load → thử refresh để khôi phục session từ cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post("/auth/refresh-token");
        setToken(res.data.accessToken);

        const userRes = await api.get("/auth/me");
        setUser(userRes.data);
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [setToken]);

  // Login — trả về user để LoginPage biết role mà redirect
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user); // backend trả về đầy đủ user object
    return res.data.user;
  }, []);

  // Logout — xóa cookie phía server
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return ctx;
}
