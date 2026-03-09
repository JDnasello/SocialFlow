import Comment from '../models/comments.model.js'
import User from '../models/user.model.js'
import Tweet from '../models/tweets.model.js'
import Notification from '../models/notifications.model.js'
import fs from 'node:fs'
import path from 'node:path'
import { postRepliesIds } from '../services/commentsService.js'
import { io } from '../index.js'
import { sendNotification } from '../sockets/socket.js'

export const getComments = async (req, res) => {
    const postId = req.params.id
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5

    try {
        
        const comments = await Comment.find({ tweet: postId })
            .skip(skip)
            .limit(defaultNumber)
            .populate({
            path: 'user',
            select: '_id name username provider profilePhoto'
        }).sort({ createdAt: -1 })

        if (!comments) return res.status(400).json({
            message: 'This post does not have comments'
        })

        const commentsWithCount = await Promise.all(comments.map(async (comment) => {
            const commentCount = await postRepliesIds(comment._id)
            
            return {
                ...comment._doc,
                total: commentCount
            }
        }))

        return res.json({ comments: commentsWithCount })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getComment = async (req, res) => {
    const commentId = req.params.id
    try {
        const comment = await Comment.findById(commentId).populate({
            path: 'user',
            select: '_id name username provider profilePhoto'
        }).sort({ createdAt: -1 })

        if (!comment) return res.status(404).json({
            message: 'Comment not found'
        })

        res.json(comment)

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getUserPostsComments = async (req, res) => {
    const username = req.params.username
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5
    try {
        const user = await User.findOne({ username: username })

        if (!user) return res.status(404).json({
            message: 'User not found'
        })

        const userComments = await Comment.find({ user: user._id })
            .skip(skip)
            .limit(defaultNumber)
            .populate({
            path: 'user',
            select: 'name username provider profilePhoto'
        }).sort({ createdAt: -1 })

        res.json({ comments: userComments })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const createComment = async (req, res) => {
    const { parentComment, commentText } = req.body

    try {
        const user = await User.findById(req.user.id)

        let tweet = null
        let parentCommentId = null

        if (req.params.id) {
            tweet = await Tweet.findById(req.params.id)
            if (!tweet) return res.status(400).json({
                message: 'Tweet not found'
            })
        }
        
        if (parentComment) {
            parentCommentId = await Comment.findById(parentComment)
            if (!parentCommentId) return res.status(400).json({
                message: 'Parent comment not found'
            })
        } 

        const files = req.files
        let filesArray = []
        if (files && Array.isArray(files)) {
            files.forEach(file => {
                filesArray.push(file.filename)
            })
        }

        const newComment = new Comment({
            user: user,
            tweet: tweet ? tweet._id : null,
            parentComment: parentCommentId ? parentCommentId._id : null,
            commentText: commentText,
            media: filesArray
        })

        const commentSaved = await newComment.save()

        if (!commentSaved) return res.status(400).json({
            message: 'The comment was not saved'
        })

        const populateComment = await Comment.findById(commentSaved._id).populate({
            path: 'user',
            select: '_id name username provider profilePhoto'
        })

        
        if (parentCommentId) {
            const replyCount = await postRepliesIds(parentCommentId._id)
            io.emit('getReply', {
                comment: populateComment,
                parentComment: parentCommentId._id,
                totalReplies: replyCount
            })

            if (parentCommentId.user._id.toString() !== user._id.toString()) {
                await sendNotification({
                    senderId: user.id,
                    receiverId: parentCommentId.user._id,
                    postId: null,
                    commentId: parentCommentId._id,
                    replyId: commentSaved._id,
                    type: "reply",
                    message: "respondió a tu comentario",
                    io,
                })       
            }

        } else {
            io.emit('getComment', {
                postId: tweet._id,
                comment: populateComment
            })

            if (tweet.user._id.toString() !== user._id.toString()) {
                await sendNotification({
                    senderId: user.id,
                    receiverId: tweet.user._id,
                    postId: tweet._id,
                    commentId: commentSaved._id,
                    type: 'comment',
                    message: 'comentó tu publicación'
                })
            }
            
        }


        res.status(201).json({ comments: populateComment })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }

}

export const deleteComment = async (req, res) => {
    const commentId = req.params.id
    
    try {
        const comment = await Comment.findByIdAndDelete(commentId)
        
        if (!comment) return res.status(404).json({
            message: 'Comment not found'
        })

        const notification = await Notification.findOne({
            $or: [
                { comment: commentId },
                { reply: commentId }
            ]
        })
        
        if (notification) {
            if (notification.comment?.toString() === commentId) {
                await Notification.findOneAndDelete({ comment: commentId })
            } else if (notification.reply?.toString() === commentId) {
                await Notification.findOneAndDelete({ reply: commentId })
            }
        }

        await Comment.deleteMany({ parentComment: commentId })
        io.emit('deleteNotification', { commentId: commentId })
        io.emit('deleteComment', { commentId: commentId })
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getCommentMediaContent = async (req, res) => {
    try {
        const commentId = req.params.commentId
        const comment = await Comment.findById(commentId)

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            })
        }

        const file = req.params.file
        const mediaFile = `./uploads/media/${file}`
        fs.stat(mediaFile, (error, stats) => {
            if (error) {
                return res.status(404).json({
                    message: "File does not exist"
                })
            } else {
                if (stats.isFile()) {
                    return res.sendFile(path.resolve(mediaFile))
                }
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
};

export const getReplies = async (req, res) => {
    const parentCommentId = req.params.id
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5

    try {
        const parentCommentReplies = await Comment.find({ parentComment: parentCommentId })
            .skip(skip)
            .limit(defaultNumber)
            .populate({
            path: 'user',
            select: '_id name username provider profilePhoto'
        }).sort({ createdAt: -1 })

        const repliesCount = await Promise.all(parentCommentReplies.map(async (reply) => {
            const totalReplies = await postRepliesIds(reply._id)
            return {
                ...reply._doc,
                total: totalReplies
            }
        }))

        res.json({ replies: repliesCount })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

