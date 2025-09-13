
import { Router } from "express";
import { createCommand, getAllCommands, getCommandById, updateCommand, deleteCommand, getPanier, getMyCommandes } from "../controllers/command.controller.js"


const router = Router()

router.post('/new', createCommand)
router.get('/panier', getPanier)
router.get('/all', getAllCommands)
router.get('/historique', getMyCommandes)
router.get('/:id', getCommandById)
router.put('/:id', updateCommand)
router.delete('/:id', deleteCommand)

export default router