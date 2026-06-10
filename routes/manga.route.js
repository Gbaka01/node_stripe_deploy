
import { Router } from "express";
import { createManga, getAllMangas, getMangaById, updateManga, deleteManga, addImages, removeImages } from "../controllers/manga.controller.js"

const router = Router()

router.post('/new', createManga)
router.get('/all', getAllMangas)
router.get('/:id', getMangaById)
router.put('/:id', updateManga)
router.delete('/:id', deleteManga)
router.put('/add/:id', addImages)
router.put('/remove/:id', removeImages)


export default router