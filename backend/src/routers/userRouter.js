import express from "express";
import {
  getListUsers,
  deleteUser,
  changePassword,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserById);
router.put("/profile", protect, updateUser);
router.put("/change-password", protect, changePassword);

// Admin routes
router.get("/", protect, getListUsers);
router.delete("/:id", protect, deleteUser);

export default router;
