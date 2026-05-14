
import Role from "../model/Role.js";
import cache from "../config/cache.js";

// Đây là module quản lý cache cho permissions của các role.
// Khi checkPermission được gọi, nó sẽ cố gắng lấy permissions từ cache trước.
// Nếu cache không có, nó sẽ truy vấn DB, sau đó lưu kết quả vào cache để lần sau nhanh hơn.
export const initPermissionsCache = async () => {
  try {
    const roles = await Role.find().populate("permissions");

    for (const role of roles) {
      const cacheKey = `permissions:${role._id}`;
      const permissions = role.permissions.map((p) => p.name);
      cache.set(cacheKey, permissions);
    }

    console.log(`Đã load ${roles.length} role(s) vào cache.`);
  } catch (err) {
    console.error("Lỗi khi khởi tạo permissions cache:", err);
    throw err;
  }
};

export const invalidatePermissionsCache = async (roleId) => {
  try {
    const cacheKey = `permissions:${roleId}`;

    // Xóa cache cũ
    cache.del(cacheKey);

    // Load lại từ DB
    const role = await Role.findById(roleId).populate("permissions");
    if (!role) {
      console.warn(`Role ${roleId} không tồn tại, bỏ qua cache.`);
      return;
    }

    const permissions = role.permissions.map((p) => p.name);
    cache.set(cacheKey, permissions);

    console.log(`Đã cập nhật cache cho role: ${role.name || roleId}`);
  } catch (err) {
    console.error("Lỗi khi invalidate permissions cache:", err);
    throw err;
  }
};
