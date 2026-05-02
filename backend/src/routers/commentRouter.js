import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createComment, getCommentsByChapter, getCommentsByComic, likeComment, deleteComment, getReplies } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", protect, createComment);
router.get("/chapter/:chapterId", getCommentsByChapter);
router.get("/comic/:slug", getCommentsByComic);
router.post("/:commentId/like", protect, likeComment);
router.delete("/:commentId", protect, deleteComment);
router.get("/:commentId/replies", getReplies);

export default router;