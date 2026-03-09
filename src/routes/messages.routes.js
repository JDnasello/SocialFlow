import { Router } from "express"
import { authRequired } from "../middlewares/validateToken.js"
import { createMessage, getMessageFile, getMessages, markMessagesAsRead } from "../controllers/messages.controller.js"
import { uploadFiles } from "../middlewares/Storage.js"


const router = Router()

router.get('/get-messages/:chatId', authRequired, getMessages)
router.get('/get-message/file/:file', authRequired, getMessageFile)

router.post('/add-message', [authRequired, uploadFiles().single('file')], createMessage)

router.put('/read-messages/:chatId', authRequired, markMessagesAsRead)

export default router