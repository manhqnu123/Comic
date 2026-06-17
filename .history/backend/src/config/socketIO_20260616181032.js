import { Server } from "socket.io";
import User from "../model/User.js";
import Notifycation from "../model/Notifycations.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User kết nối socket, userId:", userId);
    if (!userId) return;

    //Đánh dấu user online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    //Gửi thông báo còn hạn chưa nhận
    const pendingNotifications = await Notifycation.find({
      expiresAt: { $gt: new Date() },
      receivedBy: { $nin: [userId] },
    }).populate("newComic");

    for (const notif of pendingNotifications) {
      socket.emit("new_notification", {
        id: notif._id,
        title: notif.title,
        message: notif.message,
        newComic: notif.newComic,
      });

      notif.receivedBy.push(userId);
      await notif.save();
    }

    //User ngắt kết nối → offline
    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      console.log(`User ${userId} đã ngắt kết nối`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO chưa được khởi tạo!");
  return io;
};
