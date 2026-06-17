import { invalidatPermissionsCache } from "../config/permissionCache.js";
import cache from "../config/cache.js";

export const checkPermission = (required) => {
  return async (req, res, next) => {
    try {
      // ── Root có tất cả quyền ──────────────────────
      if (req.user.isRoot) return next();

      const roleId = req.user.role._id ?? req.user.role;
      const cacheKey = `permissions:${roleId}`;

      let permissions = cache.get(cacheKey);

      // Cache không có thì load lại từ DB
      if (!permissions) {
        await invalidatePermissionsCache(roleId);
        permissions = cache.get(cacheKey);
      }

      if (!permissions || !permissions.includes(required)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }

      next();
    } catch (err) {
      console.error("Lỗi ở checkPermission:", err);
      res
        .status(500)
        .json({ message: "Lỗi kiểm tra quyền", error: err.message });
    }
  };
};
