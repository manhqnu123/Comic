import nodemailer from "nodemailer";

// Cấu hình transporter (Khuyến khích dùng hoàn toàn biến môi trường .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Email của bạn
    pass: process.env.EMAIL_PASS || "your-app-password", // Mật khẩu ứng dụng Gmail
  },
});

// Export transporter để các nơi khác có thể import sử dụng
export default transporter;
