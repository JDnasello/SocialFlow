import { Router } from "express"
import { authRequired } from "../middlewares/validateToken.js"
import { getChat } from "../controllers/chats.controller.js"
import { getUser } from "../controllers/user.controller.js"


const router = Router()

router.get('/get-chat/:id', authRequired, getChat)
router.get('/user/:id', authRequired, getUser)

export default router