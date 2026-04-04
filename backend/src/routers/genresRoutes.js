import express from "express";
import { createGenre, getGenres, updateGenre } from "../controllers/genresController.js";

const router = express.Router();

router.post("/", createGenre);
router.get("/", getGenres)
router.put("/:id", updateGenre)

export default router;