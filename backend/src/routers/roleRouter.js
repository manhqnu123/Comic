import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  addPermissionsToRole,
  removePermissionsFromRole,
  deleteRole,
} from "../controllers/roleControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/checkPermission.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.post("/", checkPermission("permission:creates"), createRole);
router.put("/:id", checkPermission("permission:update"), updateRole);
router.patch(
  "/:id/add-permissions",
  checkPermission("permission:update"),
  addPermissionsToRole,
);
router.patch(
  "/:id/remove-permissions",
  checkPermission("permission:update"),
  removePermissionsFromRole,
);
router.delete("/:id", checkPermission("permission:delete"), deleteRole);

export default router;
