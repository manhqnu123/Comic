import { createComic, getComics, getDetailComic, updateComic, deleteComic, searchComics } from "../controllers/comicController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {checkPermission} from "../middleware/checkPermission.js";
import {uploadCloud} from "../config/cloudinary.js";

const router = express.Router();

router.post("/", protect, checkPermission("UPLOAD_COMIC"), uploadCloud.single("coverImg"), createComic);
router.put("/:id", protect, checkPermission("UPDATE_COMIC"), uploadCloud.single("coverImg"), updateComic);
router.delete("/:id", protect, checkPermission("DELETE_COMIC"), deleteComic);

router.get("/", getComics);
router.get("/search", searchComics);
router.get("/:slug", getDetailComic);

export default router;