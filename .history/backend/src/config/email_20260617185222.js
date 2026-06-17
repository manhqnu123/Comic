import nodemailer from "nodemailer";

import User from "../model/User.js";
import Role from "../model/Role.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // 1. Import nodemailer

// Cấu hình transporter để gửi mail (Nên đưa các biến cấu hình này vào file .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Email của bạn
    pass: process.env.EMAIL_PASS || "your-app-password", // Mật khẩu ứng dụng Gmail
  },
});

// ==========================================
// 1. HÀM GỬI MÃ OTP QUÊN MẬT KHẨU
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email." });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trên hệ thống." });
    }

    // Tạo mã OTP ngẫu nhiên gồm 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Đặt thời gian hết hạn cho OTP (Ví dụ: 5 phút kể từ bây giờ)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Lưu OTP và thời gian hết hạn vào DB
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Nội dung mail gửi đi
    const mailOptions = {
      from: `"Hỗ trợ hệ thống" <${process.env.EMAIL_USER || "your-email@gmail.com"}>`,
      to: user.email,
      subject: "Mã OTP khôi phục mật khẩu của bạn",
      html: `
        <h3>Yêu cầu đặt lại mật khẩu</h3>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn. Mã OTP của bạn là:</p>
        <h2 style="color: #4CAF50; letter-spacing: 2px;">${otp}</h2>
        <p>Mã này có hiệu lực trong vòng <b>5 phút</b>. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    };

    // Tiến hành gửi email
    await transporter.sendMail(mailOptions);

    res.json({ message: "Mã OTP đã được gửi đến email của bạn." });
  } catch (err) {
    console.error("Lỗi ở forgotPassword:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};

// ==========================================
// 2. HÀM XÁC NHẬN OTP VÀ ĐỔI MẬT KHẨU MỚI
// ==========================================
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          message: "Vui lòng nhập đầy đủ thông tin (Email, OTP, Mật khẩu mới).",
        });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra mã OTP có khớp không
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác." });
    }

    // Kiểm tra OTP đã hết hạn chưa
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    // Mã hóa mật khẩu mới và lưu vào DB
    user.password = await bcrypt.hash(newPassword, 10);

    // Xóa OTP cũ sau khi đổi mật khẩu thành công để tránh dùng lại
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Đổi mật khẩu mới thành công!" });
  } catch (err) {
    console.error("Lỗi ở verifyOtpAndResetPassword:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};