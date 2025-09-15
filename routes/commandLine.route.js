
import { Router } from "express";
import { createCommandLine, getAllCommandLines, getCommandLineById, updateCommandLine, deleteCommandLine } from "../controllers/commandLine.controller.js"
import { authMiddleware } from "../middlewares/auth.js"
const router = Router()

router.post('/new',authMiddleware, createCommandLine)
router.get('/all', getAllCommandLines)
router.get('/:id', getCommandLineById)
router.put('/:id', updateCommandLine)
router.delete('/:id', deleteCommandLine)

export default router