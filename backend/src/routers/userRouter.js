import express from "express";
import {
  getListUsers,
  deleteUser,
  changePassword,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserById);
router.put("/profile", protect, updateUser);
router.put("/change-password", protect, changePassword);

// Admin routes
router.get("/", protect, isAdmin, getListUsers);
router.delete("/:id", protect, isAdmin, deleteUser);

export default router;
