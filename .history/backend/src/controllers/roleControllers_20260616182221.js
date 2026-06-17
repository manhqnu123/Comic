import Role from "../model/Role.js";
import Permission from "../model/Permission.js";
import { up } from "../config/permissionCache.js";

// ── [GET] Lấy tất cả role ─────────────────────────────────
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate("permissions", "name")
      .sort({ name: 1 });

    res.json({ roles });
  } catch (error) {
    console.error("getAllRoles error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [GET] Lấy một role theo ID ────────────────────────────
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate(
      "permissions",
      "name",
    );

    if (!role)
      return res.status(404).json({ message: "Không tìm thấy vai trò" });

    res.json({ role });
  } catch (error) {
    console.error("getRoleById error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [POST] Tạo role mới ───────────────────────────────────
export const createRole = async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;

    if (!name || !name.trim())
      return res
        .status(400)
        .json({ message: "Tên vai trò không được để trống" });

    const normalized = name.trim().toLowerCase();

    const existing = await Role.findOne({ name: normalized });
    if (existing)
      return res.status(409).json({ message: "Tên vai trò đã tồn tại" });

    // Kiểm tra các permission ID có hợp lệ không
    if (permissions.length > 0) {
      const validPerms = await Permission.find({ _id: { $in: permissions } });
      if (validPerms.length !== permissions.length)
        return res.status(400).json({ message: "Một số quyền không hợp lệ" });
    }

    const role = await Role.create({ name: normalized, permissions });
    const populated = await role.populate("permissions", "name");

    res
      .status(201)
      .json({ message: "Tạo vai trò thành công", role: populated });
  } catch (error) {
    console.error("createRole error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [PUT] Cập nhật role (tên + danh sách quyền) ───────────
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role)
      return res.status(404).json({ message: "Không tìm thấy vai trò" });

    if (role.name === "admin_root")
      return res
        .status(403)
        .json({ message: "Không thể chỉnh sửa vai trò admin_root" });

    // Cập nhật tên nếu có
    if (name !== undefined) {
      const normalized = name.trim().toLowerCase();
      const duplicate = await Role.findOne({
        name: normalized,
        _id: { $ne: id },
      });
      if (duplicate)
        return res.status(409).json({ message: "Tên vai trò đã tồn tại" });
      role.name = normalized;
    }

    // Cập nhật danh sách quyền nếu có
    if (permissions !== undefined) {
      if (permissions.length > 0) {
        const validPerms = await Permission.find({ _id: { $in: permissions } });
        if (validPerms.length !== permissions.length)
          return res.status(400).json({ message: "Một số quyền không hợp lệ" });
      }
      role.permissions = permissions;
    }

    await role.save();
    await invalidatePermissionsCache(id);

    const populated = await role.populate("permissions", "name");

    res.json({ message: "Cập nhật vai trò thành công", role: populated });
  } catch (error) {
    console.error("updateRole error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [PATCH] Thêm quyền vào role ───────────────────────────
export const addPermissionsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; 

    if (!Array.isArray(permissions) || permissions.length === 0)
      return res.status(400).json({ message: "Danh sách quyền không hợp lệ" });

    const role = await Role.findById(id);
    if (!role)
      return res.status(404).json({ message: "Không tìm thấy vai trò" });

    if (role.name === "admin_root")
      return res
        .status(403)
        .json({ message: "Không thể chỉnh sửa vai trò admin_root" });

    // Chỉ thêm những quyền chưa có
    const toAdd = permissions.filter(
      (p) => !role.permissions.map((x) => x.toString()).includes(p.toString()),
    );

    role.permissions.push(...toAdd);
    await role.save();
    await invalidatePermissionsCache(id);

    const populated = await role.populate("permissions", "name");

    res.json({ message: "Thêm quyền thành công", role: populated });
  } catch (error) {
    console.error("addPermissionsToRole error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [PATCH] Gỡ quyền khỏi role ───────────────────────────
export const removePermissionsFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // mảng permission ID cần gỡ

    if (!Array.isArray(permissions) || permissions.length === 0)
      return res.status(400).json({ message: "Danh sách quyền không hợp lệ" });

    const role = await Role.findById(id);
    if (!role)
      return res.status(404).json({ message: "Không tìm thấy vai trò" });

    if (role.name === "admin_root")
      return res
        .status(403)
        .json({ message: "Không thể chỉnh sửa vai trò admin_root" });

    role.permissions = role.permissions.filter(
      (p) => !permissions.map((x) => x.toString()).includes(p.toString()),
    );

    await role.save();
    await invalidatePermissionsCache(id);

    const populated = await role.populate("permissions", "name");

    res.json({ message: "Gỡ quyền thành công", role: populated });
  } catch (error) {
    console.error("removePermissionsFromRole error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [DELETE] Xóa role ─────────────────────────────────────
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role)
      return res.status(404).json({ message: "Không tìm thấy vai trò" });

    if (role.name === "admin_root")
      return res
        .status(403)
        .json({ message: "Không thể xóa vai trò admin_root" });

    await invalidatePermissionsCache(id);
    await role.deleteOne();

    res.json({ message: "Xóa vai trò thành công" });
  } catch (error) {
    console.error("deleteRole error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
