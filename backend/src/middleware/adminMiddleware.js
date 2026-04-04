export const isAdmin = (req, res, next) => {
  // ❌ Code cũ của bạn bị ngược — !== "admin" sẽ chặn tất cả trừ admin
  // nhưng điều kiện if(req.user && req.user.role !== "admin") lại next() khi không có user

  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });

  next();
};
