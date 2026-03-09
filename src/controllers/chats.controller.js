import Chat from '../models/chats.model.js'
import User from '../models/user.model.js'
import Message from '../models/messages.model.js'
import { followUserIds } from '../services/followService.js'

export const getChat = async (req, res) => {
    const userId = req.user.id
    try {
        const chats = await Chat.find({
            users: { $in: [req.params.id] }
        }).sort({ updatedAt: -1 })

        if (!chats) return res.status(404).json({
            message: 'Chat not found'
        })

        const mapChats = await Promise.all(chats.map(async (chat) => {
            const receiverId = chat.users.find(userId => userId !== req.params.id)

            if (!receiverId) return null

            const userToChat = await User.findById(receiverId)
                .select('name username provider profilePhoto createdAt')
            
            const receiverFollowers = await followUserIds(receiverId)
            
            const lastMessage = await Message.findOne({ chatId: chat._id })
                .sort({ createdAt: -1 })
            
            const lastMessageTxt = lastMessage ? lastMessage.message : ""
            const lastMessageFile = lastMessage ? lastMessage.file : ""

            const lastMessageDate = lastMessage && lastMessage.createdAt

            const unreadMessagesCount = await Message.countDocuments({
                chatId: chat._id,
                sender: receiverId,
                read: false
            })
            
            return {
                chat,
                userToChat,
                receiverFollowers: receiverFollowers.followers,
                lastMessage: lastMessageTxt,
                lastMessageFile: lastMessageFile,
                lastMessageDate,
                unreadMessagesCount
            }
        }))

        const validChats = mapChats.filter(chat => chat !== null)

        const unreadChatsCount = await updatedUnreadChatsCount(userId)

        res.json({
            chats: validChats,
            unreadChatsCount
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getChatBetweenUsers = async (senderId, receiverId) => {
    let chat = await Chat.findOne({
        users: { $all: [senderId, receiverId] }
    })

    if (!chat) {
        throw new Error('Chat does not exists. Please create one.')
    }

    return chat;
}

export const updatedUnreadChatsCount = async (userId) => {
    try {
        const chats = await Chat.find({ users: { $in: [userId] } })

        const unreadChatsCount = await Promise.all(
            chats.map(async (chat) => {
                const unreadMessagesCount = await Message.countDocuments({
                    chatId: chat._id,
                    sender: { $ne: userId },
                    read: false
                })

                return unreadMessagesCount > 0
            })
        )

        return unreadChatsCount.filter(Boolean).length
    } catch (error) {
        throw new Error('Error updating unread chats count')
    }
}