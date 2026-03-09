import { Router } from "express"
import { authRequired } from "../middlewares/validateToken.js"
import { deleteAllNotifications, deleteNotification, getNotifications, getTotalNotifications, markNotificationAsRead, updateTotalNotifications } from "../controllers/notifications.controller.js"

const router = Router()

router.get('/get-notifications', authRequired, getNotifications)
router.get('/total-notifications', authRequired, getTotalNotifications)

router.delete('/notification/:id', authRequired, deleteNotification)
router.delete('/notifications/delete-all', authRequired, deleteAllNotifications)

router.patch('/read-notification/:id', authRequired, markNotificationAsRead)
router.patch('/reset-notifications', authRequired, updateTotalNotifications)

export default router