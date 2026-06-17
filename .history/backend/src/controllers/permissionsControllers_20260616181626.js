import Permission from "../model/Permission.js";
import Role from "../model/Role.js";
import { invPermissionsCa } from "../config/permissionCache.js";

// ── [GET] Lấy tất cả quyền ────────────────────────────────
export const getAllPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const [permissions, total] = await Promise.all([
      Permission.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Permission.countDocuments(filter),
    ]);

    res.json({
      permissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllPermissions error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [GET] Lấy một quyền theo ID ───────────────────────────
export const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission)
      return res.status(404).json({ message: "Không tìm thấy quyền" });

    res.json({ permission });
  } catch (error) {
    console.error("getPermissionById error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [POST] Tạo quyền mới ──────────────────────────────────
export const createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Tên quyền không được để trống" });

    const normalized = name.trim().toLowerCase();

    const existing = await Permission.findOne({ name: normalized });
    if (existing)
      return res.status(409).json({ message: "Tên quyền đã tồn tại" });

    const permission = await Permission.create({ name: normalized });

    res.status(201).json({ message: "Tạo quyền thành công", permission });
  } catch (error) {
    console.error("createPermission error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [PUT] Cập nhật quyền ──────────────────────────────────
export const updatePermission = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Tên quyền không được để trống" });

    const normalized = name.trim().toLowerCase();

    const permission = await Permission.findById(id);
    if (!permission)
      return res.status(404).json({ message: "Không tìm thấy quyền" });

    const duplicate = await Permission.findOne({
      name: normalized,
      _id: { $ne: id },
    });
    if (duplicate)
      return res.status(409).json({ message: "Tên quyền đã tồn tại" });

    permission.name = normalized;
    await permission.save();

    // Refresh cache cho tất cả role đang dùng permission này
    const rolesAffected = await Role.find({ permissions: id }).select("_id");
    await Promise.all(
      rolesAffected.map((r) => invalidatePermissionsCache(r._id)),
    );

    res.json({ message: "Cập nhật quyền thành công", permission });
  } catch (error) {
    console.error("updatePermission error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ── [DELETE] Xóa quyền ────────────────────────────────────
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);
    if (!permission)
      return res.status(404).json({ message: "Không tìm thấy quyền" });

    // Lấy danh sách role bị ảnh hưởng trước khi xóa
    const rolesAffected = await Role.find({ permissions: id }).select("_id");

    // Gỡ permission khỏi tất cả role đang dùng
    await Role.updateMany({ permissions: id }, { $pull: { permissions: id } });

    // Refresh cache
    await Promise.all(
      rolesAffected.map((r) => invalidatePermissionsCache(r._id)),
    );

    await permission.deleteOne();

    res.json({
      message: "Xóa quyền thành công",
      removedFromRoles: rolesAffected.length,
    });
  } catch (error) {
    console.error("deletePermission error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
