
import { Router } from "express";
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js"
const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/all', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)


export default router