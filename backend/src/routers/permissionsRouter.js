import express from "express";
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permissionsControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/checkPermission.js";

const router = express.Router();

router.use(protect); // Tất cả route đều yêu cầu đăng nhập

router.get("/", checkPermission("permission:read"), getAllPermissions);
router.get("/:id", checkPermission("permission:read"), getPermissionById);
router.post("/", checkPermission("permission:create"), createPermission);
router.put("/:id", checkPermission("permission:update"), updatePermission);
router.delete("/:id", checkPermission("permission:delete"), deletePermission);

export default router;
