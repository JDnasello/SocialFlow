import path from 'node:path'
import Message from '../models/messages.model.js'
import User from '../models/user.model.js'
import fs from 'node:fs'
import Chat from '../models/chats.model.js'
import { updatedUnreadChatsCount } from './chats.controller.js'
import { io } from '../index.js'
import { getUser } from '../sockets/socket.js'
import { followUserIds } from '../services/followService.js'

export const getMessages = async (req, res) => {

    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 20

    try {
        const chatFound = await Message.find({
            chatId: req.params.chatId
        }).sort({ createdAt: -1 }).skip(skip).limit(defaultNumber)

        if (!chatFound) return res.status(404).json({
            message: 'Chat not found'
        })

        const messageWithSenderPhoto = await Promise.all(chatFound.map(async (chat) => {
            const sender = await User.findById(chat.sender).select('_id name provider profilePhoto createdAt')

            if (!sender) return null     

            return {
                ...chat.toObject(),
                sender: {
                    senderId: sender._id.toString(),
                    name: sender.name,
                    provider: sender.provider,
                    profilePhoto: sender.profilePhoto,
                    createdAt: chat.createdAt
                }
            }
        }))

        res.json(messageWithSenderPhoto)
    } catch (error) { 
        return res.status(500).json({
            message: error.message
        })
    }
}

export const createMessage = async (req, res) => {
    const { sender, receiver, message } = req.body
    try {
        if (!sender || !receiver || !message) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        let chat = await Chat.findOne({ users: { $all: [sender, receiver] } })

        let file = ""

        if (!chat) {
            chat = new Chat({ users: [sender, receiver] })
            await chat.save()

            if (req.file) {
                file = req.file.filename
            }

            const newMessage = new Message({
                chatId: chat._id,
                sender,
                message,
                file: file
            })

            const savedMessage = await newMessage.save()
            chat.updatedAt = new Date()
            await chat.save()

            const receiverId = chat.users.find((userId) => userId !== sender)

            if (!receiverId) return res.status(500).json({
                message: "Receiver user not found"
            })
            

            const userToChat = await User.findById(receiverId).select("name username provider profilePhoto createdAt")

            const receiverFollowers = await followUserIds(receiverId)

            const unreadMessagesCount = await Message.countDocuments({
                chatId: chat._id,
                sender: receiverId,
                read: false
            })

            const detailedChat = {
                chat,
                userToChat,
                receiverFollowers: receiverFollowers.followers,
                lastMessage: savedMessage.message,
                lastMessageFile: savedMessage.file,
                lastMessageDate: savedMessage.createdAt,
                unreadMessagesCount
            };


            const senderUser = getUser(sender)
            const receiverUser = getUser(receiver)
            
            io.to(senderUser.socketId).emit('newChat', { ...detailedChat, autoOpen: true })
            io.to(receiverUser.socketId).emit('newChat', { ...detailedChat, autoOpen: false })

        } else {
            if (req.file) {
                file = req.file.filename
            }
            
    
            const newMessage = new Message({
                chatId: chat._id,
                sender,
                message,
                file: file,
            })
    
            const savedMessage = await newMessage.save()
            chat.updatedAt = new Date()
            await chat.save()
    
            res.json({ chat, savedMessage })
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getMessageFile = async (req, res) => {
    
    try {
        const file = req.params.file

        const fileLocation = `./uploads/file/${file}`
        fs.stat(fileLocation, (error, stats) => {
            if (error) {
                
                return res.status(404).json({
                    message: 'File does not exist'
                })
            } else {
                if (stats.isFile()) {
                    return res.sendFile(path.resolve(fileLocation))
                }
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params
        const { userId } = req.body

        const updatedMessages = await Message.updateMany(
            { chatId, sender: { $ne: userId }, read: false },
            { $set: { read: true } }
        )

        if (updatedMessages.nModified === 0) {
            return res.status(404).json({
                message: 'No unread messages'
            })
        }

        const unreadChatsCount = await updatedUnreadChatsCount(userId)

        res.json({
            message: `${updatedMessages.nModified} messages readed`,
            unreadChatsCount
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}