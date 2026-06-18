import { createClient } from "redis";

const redisClient = createClient({
  // Mặc định chạy ở localhost:6379, nếu có mật khẩu hoặc dùng dịch vụ Cloud thì cấu hình thêm ở đây
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Kết nối thành công tới Redis!"));

// Tiến hành kết nối
await redisClient.connect();

export default redisClient;
