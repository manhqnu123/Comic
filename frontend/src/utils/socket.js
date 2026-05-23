import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {

  if (socket?.connected) return socket;

  socket = io("http://localhost:3000", {
    query: { userId },
    withCredentials: true,
  });
  socket.on("connect", () => {
    console.log("Socket đã kết nối, id:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("Socket lỗi kết nối:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
