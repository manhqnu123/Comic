import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { toggleFollow, getFollowedComics, checkFollow } from "../controllers/followController.js";
const router = express.Router();

router.post("/", protect, toggleFollow);
router.get("/followed", protect, getFollowedComics);
router.get("/check/:comicId", protect, checkFollow);
export default router;