import express from 'express';
import { getChapter, getChapterByComic, createChapter, updateChapter, deleteChapter, increaseView } from '../controllers/chapterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", protect, createChapter);
router.get("/comic/:comicId", getChapterByComic);
router.get("/:id", getChapter);
router.put("/:id", protect, updateChapter);
router.delete("/:id", protect, deleteChapter);
router.post("/:id/view", increaseView);

export default router;
