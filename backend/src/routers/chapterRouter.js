import express from 'express';
import { getChapter, getChapterByComic, createChapter, updateChapter, deleteChapter, increaseView } from '../controllers/chapterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post("/", protect, isAdmin, createChapter);
router.get("/comic/:comicId", getChapterByComic);
router.get("/:id", getChapter);
router.put("/:id", protect, isAdmin, updateChapter);
router.delete("/:id", protect, isAdmin, deleteChapter);
router.post("/:id/view", increaseView);

export default router;
