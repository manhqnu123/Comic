import Role from "../model/Role.js";
import './authMiddleware.js';
import cache from '../config/cache.js';

export const checkPermission = (required) => {
    return async (req, res, next) => {
        try {
            const RoleId = req.user.role;
            const cacheKey = `permissions:${RoleId}`;

            //Thử lấy cache trước
            let permissions = await cache.get(cacheKey);

            //cache không có thì truy vấn DB
            if (!permissions) {
                const role = await Role.findById(RoleId).populate("permissions");
                if (!role) {return res.status(403).json({ message: "Role không tồn tại" });}
                permissions = role.permissions.map(p => p.name);

                //lưu vào cache
                cache.set(cacheKey, permissions);
            }

            //kiểm tra quyền 
            if (!permissions.includes(required)) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập" });
            }
            next();
        } catch (err) {
            console.error("Lỗi ở checkPermission:", err);
            res.status(500).json({ message: "Lỗi kiểm tra quyền", error: err.message });
        }
    }
}