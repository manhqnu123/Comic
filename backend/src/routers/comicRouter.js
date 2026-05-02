import { createComic, getComics, getDetailComic, updateComic, deleteComic, searchComics } from "../controllers/comicController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {checkPermission} from "../middleware/checkPermission.js";
import {uploadCloud} from "../config/cloudinary.js";

const router = express.Router();

router.post("/", protect, checkPermission("UPLOAD_COMIC"), uploadCloud.single("image"), createComic);
router.put("/:id", protect, uploadCloud.single("image"), updateComic);
router.delete("/:id", protect, deleteComic);

router.get("/", getComics);
router.get("/search", searchComics);
router.get("/:slug", getDetailComic);

export default router;