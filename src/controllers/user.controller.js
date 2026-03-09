import User from '../models/user.model.js'
import Chat from '../models/chats.model.js'
import History from '../models/history.model.js'
import Tweet from '../models/tweets.model.js'
import Comment from '../models/comments.model.js'
import Notification from '../models/notifications.model.js'
import Follow from '../models/follow.model.js'
import path from 'node:path'
import fs from 'node:fs'
import { followUserIds } from '../services/followService.js'
import { io } from '../index.js'
import { getUser as getUserStatus } from '../sockets/socket.js'

export const getUser = async (req, res) => {
    try {
        const userId = req.params.id
        
        const userFound = await User.findById(userId)

        if (!userFound) return res.status(404).json({
            message: 'User not found'
        })

        const userFollowers = await followUserIds(userFound)

        const isOnline = !!getUserStatus(userId)

        res.json({
            id: userFound._id,
            name: userFound.name,
            username: userFound.username,
            provider: userFound.provider,
            profilePhoto: userFound.profilePhoto,
            createdAt: userFound.createdAt,
            userFollowers: userFollowers.followers,
            online: isOnline
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const updateUser = async (req, res) => {
    const username = req.params.username
    try {
        const user = await User.findOneAndUpdate( { username: username }, req.body, {
            new: true
        })
    
        if (!user) return res.status(404).json({
            "message": "User not found"
        })

        if (!user.name || !user.username || !user.birthDate) {
            return res.status(400).json({
                message: "Fields required"
            })
        }

        res.json({
            backgroundPhoto: user.backgroundPhoto,
            profilePhoto: user.profilePhoto,
            name: user.name,
            biography: user.biography,
            location: user.location,
            birthDate: user.birthDate
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const uploadImage = async (req, res) => {
    try {
        const user = req.user
        const file = req.file
        const fileType = req.body.fileType

        const image = file.originalname
        const accepetedExtension = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.bmp'] // Arreglo con extensiones de imágen válidas
        const extension = path.extname(image).toLowerCase() // Aseguramos que la extension sea en minúsculas

        if (!accepetedExtension.includes(extension)) {
            const filePath = file.path
            fs.unlink(filePath, (err) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Something wrong happened removing the file',
                        error: err.message
                    })
                }

                return res.status(400).json({
                    message: 'Invalid file extension'
                })
            })
        } else {

            const updateFile = fileType === 'avatar' ? 'profilePhoto' : 'backgroundPhoto'
            const updatedUser = await User.findOneAndUpdate({ _id: user.id }, { [updateFile]: file.filename }, {
                new: true
            })
                
            if (!updatedUser) return res.status(500).json({
                message: `Failed to update user ${updateFile}`
            })
    
            return res.status(201).json({
                user,
                file
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getImage = async (req, res) => {
    try {
        const file = req.params.file
        let filePath;

        console.log(req.query.type)

        if (req.query.type === 'avatar') {
            filePath = `./uploads/avatar/${file}`
        } else if (req.query.type === 'background') {
            filePath = `./uploads/background/${file}`
        } else {
            return res.status(400).json({ message: 'Invalid file path' })
        }

        fs.stat(filePath, (error, stats) => {
            if (error) {
                return res.status(404).json({
                    message: 'Image does not exist'
                })
            } else {
                if (stats.isFile()) {
                    return res.sendFile(path.resolve(filePath))
                }
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const searchUsers = async (req, res) => {
    const search = req.params.search
    const userSession = req.user.id
    try {
        const usersFound = await User.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } }
                    ]
                },
                { _id: { $ne: userSession }}
            ]
        }).select('name username provider biography profilePhoto createdAt online').sort({ createdAt: -1 })
        
        if (!usersFound || usersFound.length === 0) return res.status(404).json({
            message: 'User not found'
        })

        const usersWithFollowersAndChats = await Promise.all(usersFound.map(async (user) => {
            const followsData = await followUserIds(user._id)
            const chatFound = await Chat.findOne({ users: { $all: [userSession, user._id.toString()] } })

            return {
                ...user._doc,
                receiverFollowers: followsData.followers,
                chat: chatFound
            }
        }))
        
        res.json({ users: usersWithFollowersAndChats })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const pushHistory = async (req, res) => {
    const { userId, searchedUserId, type } = req.body
    console.log(req.body)
    try {
        if (!userId || !searchedUserId || !type) {
            return res.status(400).json({
                message: "Missing fields"
            })
        }

        let history = await History.findOne({ user: userId })

        if (!history) {
            history = new History({
                user: userId,
                searchedUsers: [{ user: searchedUserId, type }]
            })
        } else {
            const alreadySearched = history.searchedUsers.some(
                search => search.user === searchedUserId && search.type === type
            )

            if (!alreadySearched) {
                history.searchedUsers.push({ user: searchedUserId, type })
            } else {
                const userIndex = history.searchedUsers.findIndex(
                    search => search.user === searchedUserId && search.type === type
                )
                history.searchedUsers[userIndex].searchedAt = new Date().toISOString()
                await history.save()
            }
        }
        
        const savedHistory = await history.save()

        res.json(savedHistory)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
} 

export const getHistory = async (req, res) => {
    const userSession = req.user.id
    const type = req.query.type
    try {
        const history = await History.findOne({ user: userSession })
        
        if (!history) return res.status(404).json({
            message: 'Empty history'
        })

        const historyData = await Promise.all(history.searchedUsers
            .filter(historyUser => historyUser.type === type)
            .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
            .map(async (user) => {
                const userData = await User.findById(user.user).select('name username provider profilePhoto biography createdAt')
            
                if (!userData) return null

                const followsData = await followUserIds(userData._id)
                const chatFound = await Chat.findOne({ users: { $all: [userSession, userData._id.toString()] } })
                
                const { _id, ...restOfUserData } = userData._doc

                return {
                    ...user._doc,
                    userData: {
                        ...restOfUserData,
                        receiverFollowers: followsData.followers,
                        chat: chatFound
                    }
                }
        }))
        
        res.json({ searches: historyData })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteOneInHistory = async (req, res) => {
    const userId = req.params.id
    const type = req.query.type
    try {
        const deleteUser = await History.findOneAndUpdate(
            { "searchedUsers.user": userId },
            { $pull: { searchedUsers: { user: userId, type: type } } },
            { new: true }
        )

        if (!deleteUser) return res.status(404).json({
            message: `User ${userId} or type ${type} not found`
        })

        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteHistory = async (req, res) => {
    const userId = req.params.id
    const type = req.query.type
    try {
        const deleteHistory = await History.findOneAndUpdate(
            { user: userId },
            { $pull: { searchedUsers: { type: type } } },
            { new: true }
        )

        if (!deleteHistory) return res.status(404).json({
            message: `User ${userId} or type ${type} not found`
        })

        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteAccount = async (req, res) => {
    const userId = req.user.id
    try {
        await Tweet.deleteMany({ user: userId })

        io.emit('deletePosts', { userId })

        await Comment.deleteMany({ user: userId })

        io.emit('deleteComments', { userId })

        await Notification.deleteMany({ $or: [{ user: userId }, { sender: userId }] })

        io.emit('deleteNotifications', { userId })

        await History.findOneAndDelete({ user: userId })

        await Follow.deleteMany({ user: userId })
        await Follow.deleteMany({ following: userId })

        io.emit('deleteFollows', { userId })

        const chats = await Chat.find({ users: { $in: [userId] } })

        for (const chat of chats) {
            await chat.deleteOne()
        }

        io.emit('deleteChats', { userId })

        await User.findByIdAndDelete(userId)

        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}