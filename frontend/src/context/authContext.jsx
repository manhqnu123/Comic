import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { connectSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const setToken = useCallback((token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, []);

  // Kết nối socket và lắng nghe thông báo
 const setupSocket = useCallback((userId) => {
   const socket = connectSocket(userId);
   socket.on("new_notification", (notif) => {
     setNotifications((prev) => [notif, ...prev]);
   });
 }, []);

  //chạy khi app load để restore session nếu có refresh token hợp lệ
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post("/auth/refresh-token");
        const newToken = res.data.accessToken;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        const decoded = jwtDecode(newToken);
        setUser(decoded);
        setupSocket(decoded.id);
      } catch {
        localStorage.removeItem("token"); // xóa token nếu refresh không thành công
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [setToken, setupSocket]);

  // Login — lưu token + user
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.accessToken);
    setToken(res.data.accessToken);
    setUser(res.data.user); // backend trả về đầy đủ user object
    setupSocket(res.data.user._id);
    return res.data;
  }, [setupSocket]);

  // Logout — xóa cookie phía server
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Có lỗi cũng vẫn logout phía client
    } finally {
      disconnectSocket();
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, notifications, setNotifications }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}
