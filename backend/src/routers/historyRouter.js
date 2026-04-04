import {
  addReadHistory,
  getHistory,
  deleteHistory,
} from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/", protect, addReadHistory);
router.get("/", protect, getHistory);
router.delete("/:comicId", protect, deleteHistory);

export default router;
