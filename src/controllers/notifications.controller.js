import Notification from '../models/notifications.model.js'
import User from '../models/user.model.js'

export const getNotifications = async (req, res) => {
    const userId = req.user.id
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 6
    try {
        const notifications = await Notification.find({ user: userId }).skip(skip).limit(defaultNumber)
            .populate({
                path: 'user',
                select: 'totalNotifications'
            })
            .populate({
                path: 'sender',
                select: 'name username provider profilePhoto'
            })
            .populate({
                path: 'post',
                select: 'tweetText media',
                populate: {
                    path: 'user',
                    select: 'provider profilePhoto'
                }
            })
            .populate({
                path: 'comment',
                select: 'commentText media',
                populate: {
                    path: 'user',
                    select: 'provider profilePhoto'
                }
            })
            .populate({
                path: 'reply',
                select: 'commentText media',
                populate: {
                    path: 'user',
                    select: 'provider profilePhoto'
                }
            })
            .sort({ createdAt: -1 })

        res.json({ notifications: notifications })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getTotalNotifications = async (req, res) => {
    const userId = req.user.id
    try {
        const user = await User.findById(userId)
        res.json({ totalNotifications: user.totalNotifications })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteNotification = async (req, res) => {
    const notificationId = req.params.id
    try {
        const notification = await Notification.findByIdAndDelete(notificationId)

        if (notification) {
            const deleteNotification = await notification.deleteOne()
            if (!deleteNotification) {
                return res.status(404).json({
                    message: 'Notification not found'
                })
            }
            return res.sendStatus(204)
        } else {
            const notifications = await Notification.find({ post: notificationId })
            if (notifications.length > 0) {
                await Notification.deleteMany({ post: notificationId })
                return res.sendStatus(204)
            } else {
                return res.status(404).json({
                    message: 'Post not found'
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id })
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const markNotificationAsRead = async (req, res) => {
    const notificationId = req.params.id
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, {
            $set: { read: true }
        }, { new: true })

        res.status(200).json({ notificationRead: notification.read })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const updateTotalNotifications = async (req, res) => {
    const userId = req.user.id
    try {
        await User.findByIdAndUpdate(userId, {
            $set: { totalNotifications: 0 }
        }, { new: true })
        
        res.json({ message: 'totalNotifications have been reset to 0' })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}