import Notification from '../models/notifications.model.js'
import User from '../models/user.model.js'
import Tweet from '../models/tweets.model.js'
import Comment from '../models/comments.model.js'
import Message from '../models/messages.model.js'
import { getChatBetweenUsers, updatedUnreadChatsCount } from '../controllers/chats.controller.js'

let io
export let users = []

const addUser = (userId, socketId) => {
    if (!users.some((user) => user.userId === userId)) {
        users.push({ userId, socketId })
        console.log(`User added: ${userId} with socketId: ${socketId}`)
    } else {
        console.log(`User ${userId} already connected with socketId: ${socketId}`)
    }
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
    console.log(`User with socketId: ${socketId} removed`)
}

export const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}

export const ioInstance = (instance) => {
    io = instance
    
    io.on("connection", (socket) => {
        console.log(`User ${socket.id} has connected`)
        
        socket.on("addUser", (userId) => {
            addUser(userId, socket.id)
            io.emit("getUsers", users)
            console.log(`Current users: ${JSON.stringify(users)}`)
        })

        socket.on('setChatActive', ({ userId, chatId }) => {
            const user = users.find(user => user.userId === userId)
            if (user) {
                user.activeChatId = chatId
            }
        })

        socket.on("sendMessage", async ({ senderId, receiverId, message, file }) => {
            try {
            let chat = await getChatBetweenUsers(senderId, receiverId)
            const receiver = getUser(receiverId)
                console.log(receiver)
                console.log(chat)
                
                
            if (!receiver) {
                console.error(`Receiver with ID ${receiverId} is not found`)
                return
            }
        
            chat.updatedAt = new Date()
            await chat.save()
        
            console.log(`Sending message from: ${senderId} to ${receiverId}: ${message}`)
            console.log(`Sending file from: ${senderId} to ${receiverId}: ${file}`)
        
            const senderUser = await User.findById(senderId).select("name username provider profilePhoto")
            const lastMessage = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 })
        
            const lastMessageTxt = lastMessage ? lastMessage.message : ""
            const lastMessageFile = lastMessage ? lastMessage.file : ""
        
            const messageData = {
                chatId: chat._id,
                senderId,
                message,
                file: file,
                name: senderUser.name,
                username: senderUser.username,
                provider: senderUser.provider,
                profilePhoto: senderUser.profilePhoto,
                createdAt: new Date().toISOString(),
                lastMessage: lastMessageTxt,
                lastMessageFile: lastMessageFile,
                lastMessageDate: lastMessage.createdAt
            }
        
            io.to(receiver.socketId).emit("getMessage", messageData)
            
            const unreadMessagesCount = await Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: receiverId },
                read: false
            })
            
            io.to(receiver.socketId).emit("updateUnreadMessages", {
                chatId: chat._id,
                unreadMessagesCount
            }) 

            if (receiver.activeChatId !== chat._id.toString()) {
                const unreadChatsCount = await updatedUnreadChatsCount(receiverId)
                io.to(receiver.socketId).emit('updateUnreadChats', { unreadChatsCount })
            }
            
            io.to(receiver.socketId).emit('updateUnreadChats', { unreadChatsCount })
            
            io.to(receiver.socketId).emit("newNotification", {
                chatId: chat._id,
                senderId,
                message,
                file,
                senderName: senderUser.name
            })
        } catch (error) {
            console.error("Error sendingMessage: ", error)
        }
        })
        
        
        socket.on("markMessageAsRead", async ({ chatId, userId }) => {
            try {
            await Message.updateMany(
                { chatId, sender: { $ne: userId }, read: false },
                { $set: { read: true } }
            )
        
            const lastMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 })
        
            if (lastMessage && lastMessage.read) {
                const sender = getUser(lastMessage.sender)
                if (sender) {
                    io.to(sender.socketId).emit("messageSeen", {
                        chatId,
                        messageId: lastMessage._id
                    })
                }
            }
        
            const receiver = getUser(userId)
            if (receiver) {
                io.to(receiver.socketId).emit("updateUnreadMessages", {
                chatId,
                unreadMessagesCount: 0
                })
            }
        
            console.log(`Messages in chat ${chatId} marked as read by user ${userId}`)
            } catch (error) {
            console.error("Error marking messages as read: ", error)
            }
        })
        
        socket.on("updateMessage", async ({ messageId, newMessage, senderId, receiverId, chatId }) => {
            try {
                const messageUpdated = await Message.findByIdAndUpdate(messageId, {
                    $set: { message: newMessage, isEdited: true }
                }, { new: true })
        
                if (!messageUpdated) {
                console.error("Message not found")
                return
                }
        
                const lastMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 })
        
                const lastMessageData = {
                chatId,
                lastMessageId: lastMessage._id,
                lastMessage: lastMessage.message,
                lastMessageDate: lastMessage.createdAt
                }
        
                const sender = getUser(senderId)
                if (sender) {
                io.to(sender.socketId).emit("messageUpdated", {
                    messageId,
                    updatedMessage: messageUpdated.message,
                    edited: messageUpdated.isEdited
                })
                    
                io.to(sender.socketId).emit("getLastMessageAfterUpdate",lastMessageData)
                }
        
                const receiver = getUser(receiverId)
                if (receiver) {
                    io.to(receiver.socketId).emit("messageUpdated", {
                        messageId,
                        updatedMessage: messageUpdated.message,
                    })
                    io.to(receiver.socketId).emit("getLastMessageAfterUpdate", lastMessageData)
                }
            } catch (error) {
                console.error("Error updating message: ", error)
            }
        })
        
        socket.on("deleteMessage", async ({ messageId, senderId, chatId }) => {
            try {
            const deleteMessage = await Message.findByIdAndDelete(messageId)
        
            if (!deleteMessage) {
                console.error("Message not found")
                return
            }
        
                const lastMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 })
            const lastMessageData = {
                chatId,
                lastMessageId: lastMessage._id,
                lastMessage: lastMessage.message,
                lastMessageDate: lastMessage.createdAt
            }
        
            const sender = getUser(senderId)
            io.to(sender.socketId).emit("messageDeleted", { messageId })
            io.to(sender.socketId).emit("getLastMessageAfterDelete", lastMessageData)
        
            const receivers = users.filter((user) => user.userId !== senderId)
        
            receivers.forEach((receiver) => {
                io.to(receiver.socketId).emit("messageDeleted", { messageId })
                io.to(receiver.socketId).emit("getLastMessageAfterDelete", lastMessageData)
            })
        
            console.log(`Message ${messageId} deleted by user ${senderId}`)
            } catch (error) {
            console.error("Error deleting message: ", error)
            }
        })
        
        socket.on("resetTotalNotifications", async ({ userId }) => {
            try {
            await User.findByIdAndUpdate(userId, {
                $set: { totalNotifications: 0 },
            }, { new: true })
            } catch (error) {
            console.error("Error resetting total notifications: ", error)
            }
        })
        
        socket.on("likePost", async ({ postId, userId }) => {
            try {
            const post = await Tweet.findByIdAndUpdate(postId, {
                $addToSet: { likes: userId },
                }, { new: true }).populate("user")
        
            io.emit("likeUpdated", { postId, likes: post.likes })
        
            const postOwnerId = post.user._id.toString()
            if (postOwnerId !== userId) {
                await sendNotification({
                senderId: userId,
                receiverId: post.user._id,
                postId: postId,
                commentId: null,
                replyId: null,
                type: "like",
                message: "le gustó tu publicación"
                })
            }
            } catch (error) {
            console.error("Error adding like: ", error)
            }
        })
        
        socket.on("removeLike", async ({ postId, userId }) => {
            try {
            const post = await Tweet.findByIdAndUpdate(postId, {
                $pull: { likes: userId },
            },{ new: true })
        
            io.emit("likeUpdated", { postId, likes: post.likes })
            } catch (error) {
            console.error("Error removing like: ", error)
            }
        })
        
        socket.on("likeComment", async ({ postId, commentId, userId }) => {
            try {
                const comment = await Comment.findByIdAndUpdate(commentId, {
                    $addToSet: { likes: userId },
                }, { new: true })
        
                io.emit("likeCommentUpdated", { commentId, likes: comment.likes })
            
                const isReply = !!comment.parentComment
                const commentOwner = comment.user._id.toString()
                if (commentOwner !== userId) {
                    await sendNotification({
                        senderId: userId,
                        receiverId: comment.user._id,
                        postId: isReply ? null : postId,
                        commentId: isReply ? null : commentId,
                        replyId: isReply ? commentId : null,
                        type: isReply ? "like reply" : "like comment",
                        message: isReply ? "le gustó tu respuesta" : "le gustó tu comentario"
                    })
                }
            } catch (error) {
            console.error("Error adding comment like: ", error)
            }
        })
        
        socket.on("removeCommentLike", async ({ commentId, userId }) => {
            try {
            const comment = await Comment.findByIdAndUpdate(commentId, {
                $pull: { likes: userId },
            },{ new: true })
        
            io.emit("likeCommentUpdated", { commentId, likes: comment.likes })
            } catch (error) {
            console.error("Error removing comment like: ", error)
            }
        })
        
        socket.on("disconnect", () => {
            console.log("User has disconnected")
            removeUser(socket.id)
            io.emit("getUsers", users)
        })
    })
}

export const sendNotification = async ({ senderId, receiverId, postId, commentId, replyId, type, message }) => {
    const receiver = getUser(receiverId.toString())
    console.log(receiverId)
    
    console.log(receiver)
    
    try {
        if (type !== "follow") {
        const notificationExists = await Notification.findOne({
            sender: senderId,
            post: postId,
            comment: commentId,
            reply: replyId,
            type,
        });

        if (notificationExists) {
            console.log("Notification has already been sent once");
            return;
        }
        }

        const newNotification = new Notification({
            user: receiverId,
            sender: senderId,
            post: postId,
            comment: commentId,
            reply: replyId,
            type: type,
            message: message,
        });

        await newNotification.save()

        const user = await User.findById(receiverId)
        user.totalNotifications += 1;
        await user.save()

        const senderInfo = await User.findById(senderId).select("name username provider profilePhoto")
        const postInfo = await Tweet.findById(postId).populate({ path: "user", select: "provider profilePhoto" })
        const commentInfo = await Comment.findById(commentId).populate({ path: "user", select: "provider profilePhoto" })
        const replyInfo = await Comment.findById(replyId).populate({ path: "user", select: "provider profilePhoto" })

        const notificationData = {
            _id: newNotification._id,
            sender: {
                name: senderInfo.name,
                username: senderInfo.username,
                provider: senderInfo.provider,
                profilePhoto: senderInfo.profilePhoto
            },
            post: postId ? {
                _id: postInfo._id,
                tweetText: postInfo.tweetText,
                media: postInfo.media,
                user: {
                    provider: postInfo.user.provider,
                    profilePhoto: postInfo.user.profilePhoto
                }
            } : null,
            comment: commentId ? {
                _id: commentInfo._id,
                user: {
                    provider: commentInfo.user.provider,
                    profilePhoto: commentInfo.user.profilePhoto
                },
                commentText: commentInfo.commentText,
                media: commentInfo.media
            } : null,
            reply: replyId ? {
                _id: replyInfo._id,
                user: {
                    provider: replyInfo.user.provider,
                    profilePhoto: replyInfo.user.profilePhoto
                },
                commentText: replyInfo.commentText,
                media: replyInfo.media
            } : null,
            message: message,
            type: type,
            createdAt: new Date().toISOString(),
            totalNotifications: user.totalNotifications
        }

        if (receiver) {
            console.log('Value of receiver socketId: ', receiver.socketId)
            
            io.to(receiver.socketId).emit("getNotification", notificationData)
        } else {
            console.log('Receiver not connected or socketId not found')
            
        }
    } catch (error) {
        console.error("Error sending notification: ", error)
    }
}
