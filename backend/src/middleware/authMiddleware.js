// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import fs from "fs";
import path from "path";

const publicKey = fs.readFileSync(
  path.join(process.cwd(), "key", "public_key.pem"),
  "utf8",
);

export const protect = async (req, res, next) => {
  try {
    let token;

    // Kiểm tra header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });

    // Lấy user từ database (không lấy password)
    const user = await User.findById(decoded.id).select("-password").populate("role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Gán user vào request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
