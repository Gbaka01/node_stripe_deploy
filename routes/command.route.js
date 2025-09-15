
import { Router } from "express";
import { createCommand, getAllCommands, getCommandById, updateCommand, deleteCommand, getPanier, getMyCommandes } from "../controllers/command.controller.js"
import { authMiddleware } from "../middlewares/auth.js"

const router = Router()

router.post('/new', createCommand)
router.get('/panier',authMiddleware, getPanier)
router.get('/all', getAllCommands)
router.get('/historique', getMyCommandes)
router.get('/:id', getCommandById)
router.put('/:id', updateCommand)
router.delete('/:id', deleteCommand)

export default router