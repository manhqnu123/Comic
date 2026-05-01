import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Follow from "../model/Follow.js";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(
  path.join(process.cwd(), "key", "private_key.pem"),
  "utf8",
);
const publicKey = fs.readFileSync(
  path.join(process.cwd(), "key", "public_key.pem"),
  "utf8",
);

// tạo token ──────────────────────────────────────
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "1d",
    },
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "7d",
    },
  );

  return { accessToken, refreshToken };
};

// set cookie ─────────────────────────────────────
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false, //  TẮT cho localhost
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
  });
};

// ── Register ──────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── Login ─────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();
    // Gửi refresh token qua cookie
    setRefreshCookie(res, refreshToken);

    const follows = await Follow.find({ user: user._id }).select("comic");
    const followedComics = follows.map((f) => f.comic.toString());

    // Trả access token + thông tin user (không có password)
    const { password: _, refreshToken: __, ...userInfo } = user.toObject();
    res.json({ accessToken, user: userInfo, followedComics });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    const follows = await Follow.find({ user: user._id }).select("comic");

    const followedComics = follows.map((f) => f.comic.toString());

    res.json({
      ...user.toObject(),
      followedComics,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi getMe" });
  }
};

// ── Refresh Token ─────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({ message: "Không có refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Refresh token hết hạn hoặc không hợp lệ" });
    }

    // Tìm user theo id trước
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: "User không tồn tại" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res
      .status(403)
      .json({ message: "Refresh token hết hạn hoặc không hợp lệ" });
  }
};

// ── Logout ────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Xóa refresh token khỏi DB
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null },
      );
    }

    // Xóa cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // HTTPS khi production, localhost thì false
      sameSite: "lax", //localhost thì lax, production thì none
    });

    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
