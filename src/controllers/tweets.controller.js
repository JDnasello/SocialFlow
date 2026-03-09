import Tweet from '../models/tweets.model.js'
import User from '../models/user.model.js'
import Comment from '../models/comments.model.js'
import { followUserIds } from '../services/followService.js'
import fs from 'node:fs'
import path from 'node:path'
import { postCommentsIds } from '../services/commentsService.js'

export const getPosts = async (req, res) => {

    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5

    try {
        const posts = await Tweet.find().skip(skip).limit(defaultNumber).populate({
            path: 'user',
            select: 'name username provider profilePhoto totalNotifications'
        }).sort({ createdAt: -1})

        if (posts.length === 0) {
            return res.sendStatus(204)
        }

        
        const postWithCommentsCount = await Promise.all(posts.map(async (post) => {
            const commentsCount = await postCommentsIds(post._id)
            return {
                ...post._doc,
                totalComments: commentsCount
            }
        }))

        res.json({
            posts: postWithCommentsCount
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            "message": error.message
        })
    }
}

export const getOnePost = async (req, res) => {
    const post = await Tweet.findById(req.params.id).populate({
        path: 'user',
        select: 'name username provider profilePhoto totalNotifications'
    })

    if (!post) {
        return res.status(404).json({
            "message": "Tweet not found"
        })
    }

    res.json(post)
}

export const userPosts = async (req, res) => {
    const username = req.params.username
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5
    try {
        if (!username) return res.status(404).json({
            message: 'User not found'
        })

        console.log(username)
        

        const user = await User.findOne({ username })

        if (!user) return res.status(404).json({
            message: "User not found"
        })

        const posts = await Tweet.find({ user: user._id })
            .skip(skip)
            .limit(defaultNumber)
            .populate({
                path: 'user',
                select: 'name username provider profilePhoto totalNotifications'
            }).sort({ createdAt: -1 })

        if (posts.length === 0) return res.json({
            message: 'No tweets yet'
        })

        const postWithCommentsCount = await Promise.all(
            posts.map(async (post) => {
                const commentsCount = await postCommentsIds(post._id)
                return {
                ...post._doc,
                totalComments: commentsCount
                }
            })
            )

            res.json({
            posts: postWithCommentsCount
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getLikedPosts = async (req, res) => {
    const username = req.params.username
    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5
    try {
        const user = await User.findOne({ username: username })
        
        if (!user) return res.status(404).json({
            message: 'User not found'
        })

        const likedPosts = await Tweet.find({ likes: user._id })
            .skip(skip)
            .limit(defaultNumber)
            .populate({
            path: 'user',
            select: 'name username provider profilePhoto'
        })

        res.json({ posts: likedPosts })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const createPost = async (req, res) => {
    const { tweetText, createdAt } = req.body
    const userId = req.user.id
    
    try {

        const files = req.files
        let filesArray = []
        if (files && Array.isArray(files)) {
            files.forEach(file => {
                filesArray.push(file.filename)
            })
        }
        const newPost = new Tweet({
            user: userId,
            tweetText: tweetText,
            media: filesArray,
            createdAt: createdAt
        })

        const postSaved = await newPost.save()
        
        if (!postSaved) return res.status(400).json({
            message: 'The post was not saved'
        })

        const populatedPost = await Tweet.findById(postSaved._id).populate({
            path: 'user',
            select: 'name username profilePhoto'
        })

        if (!populatedPost) return res.status(400).json({
            message: "User was not populated"
        })

        res.json(populatedPost)

    } catch (error) {
        res.status(500).json({
            "message": error.message
        })
    }
}

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id
        const { tweetText, mediaIndexes } = req.body
        const indexes = mediaIndexes ? JSON.parse(mediaIndexes) : []

        console.log('Req headers: ', req.headers)
        console.log('Req body: ', req.body)
        console.log('Req files: ', req.files)

        const post = await Tweet.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: "Tweet not found"
            })
        }
        
        if (tweetText) post.tweetText = tweetText

        if (indexes.length > 0 && req.files?.length > 0) {
            indexes.forEach((index, i) => {
                if (index >= 0 && index < post.media.length && req.files[i]) {
                    post.media[index] = req.files[i].filename
                } else {
                    console.warn(`Invalid index: ${index}`);
                    
                }
            })
        }

        const updatedPost = await post.save()
        const populatedPost = await updatedPost.populate({
            path: 'user',
            select: 'name username profilePhoto'
        })

        res.json(populatedPost)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deleteFile = async (req, res) => {
    const { id, filename } = req.params
    try {
        const filePath = path.join('uploads', filename)

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        
        const updatedPost = await Tweet.findByIdAndUpdate(id,
            { $pull: { media: filename } },
            { new: true }
        )

        if (!updatedPost) return res.status(404).json({
            message: 'Post not found'
        })

        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Tweet.findByIdAndDelete(req.params.id)

        if (!post) {
            return res.status(404).json({
                "message": "Tweet not found"
            })
        }

        await Comment.deleteMany({ tweet: req.params.id })

        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({
            "message": error.message
        })
    }
}

export const getMediaContent = async (req, res) => {
    try {
        const tweetId = req.params.id
        const tweet = await Tweet.findById(tweetId)

        if (!tweet) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        const file = req.params.file
        const mediaFile = `./uploads/media/${file}`
        fs.stat(mediaFile, (error, stats) => {
            if (error) {
                return res.status(404).json({
                    message: 'File does not exist'
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
}

export const getFollowingUsersPosts = async (req, res) => {

    const skip = req.query.skip ? Number(req.query.skip) : 0
    const defaultNumber = 5

    try {
        const userId = req.user.id

        const myFollows = await followUserIds(userId)

        if (myFollows.following.length === 0) return res.status(400).json({
            message: 'You do not follow any user'
        })

        const foundPosts = await Tweet.find({
            user: myFollows.following
        }).skip(skip).limit(defaultNumber).populate({
            path: 'user',
            select: 'name username provider profilePhoto totalNotifications'
            })
            .sort({ createdAt: -1 })
        
        if (foundPosts.length === 0) return res.status(204).json({
            message: 'The users you follow do not have any post',
            following: myFollows.following,
            followingPosts: foundPosts
        })

        const postsWithCommentsCount = await Promise.all(foundPosts.map(async (post) => {
            const commentsCount = await postCommentsIds(post._id)
            return {
                ...post._doc,
                totalComments: commentsCount
            }
        }))

        return res.json({
            following: myFollows.following,
            followingPosts: postsWithCommentsCount
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

