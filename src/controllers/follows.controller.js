import Follow from '../models/follow.model.js'
import User from '../models/user.model.js'
import { followUserIds } from '../services/followService.js'
import { sendNotification } from '../sockets/socket.js'
import { io } from '../index.js'

export const saveFollow = async (req, res) => {
    try {
        const userData = req.body
        const user = req.user

        if (!user) return res.status(404).json({
            message: 'User not found'
        })

        const existingFollow = await Follow.findOne({ user: user.id, following: userData.following })
        
        if (existingFollow) return res.status(400).json({
            message: 'You are already following this user'
        })

        const newFollow = new Follow({
            user: user.id,
            following: userData.following
        })

        const followSaved = await newFollow.save()

        await sendNotification({
            senderId: user.id,
            receiverId: userData.following,
            postId: null,
            commentId: null,
            replyId: null,
            type: 'follow',
            message: 'comenzó a seguirte',
            io
        })

        return res.json(followSaved)

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

// Función para obtener todos los usuarios que sigo
export const following = async (req, res) => {
    try {
        const username = req.params.username
        const followingId = req.params.id   

        if (followingId) {
            const findOneFollowing = await Follow.findOne({ following: followingId })
                .populate({
                    path: 'user following',
                    select: 'name username provider profilePhoto biography'
                })

            if (!findOneFollowing) return res.status(404).json({
                message: 'User not found'
            })
            return res.json(findOneFollowing)
        }
        
        const profileUser = await User.findOne({ username: username})

        const findFollowing = await Follow.find({ user: profileUser })
            .populate({
                path: "user following",
                select: "name username provider profilePhoto biography"
            })
            .sort({ followedDate: -1 })
    
        if (findFollowing.length === 0) return res.json({
            message: "You do not follow any users yet",
            findFollowing
        })

        const followUser = await followUserIds(profileUser)
    
        return res.json({
            message: 'List of users I following',
            findFollowing,
            usersFollowing: followUser.following,
            usersFollowMe: followUser.followers
        })
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

// Función para obtener todos los usuarios que me siguen
export const followers = async (req, res) => {
    try {
        const username = req.params.username
        const followerId = req.params.id
        
        if (followerId) {
            const findOneFollower = await Follow.findOne({ following: followerId })
            .populate({
                path: 'user',
                select: 'name username provider profilePhoto biography'
            })
            
            if (!findOneFollower) return res.status(404).json({
                message: "User not found"
            })
        return res.json(findOneFollower)
        }
    
        const profileUser = await User.findOne({ username: username })

        const findFollowers = await Follow.find({ following: profileUser })
            .populate({
                path: 'user',
                select: 'name username provider profilePhoto biography'
            })
            .sort({ followedDate: -1 })
        
        if (findFollowers.length === 0) return res.status(404).json({
            message: 'You do not have followers yet',
            findFollowers
        }) 
        
        const usersFollowers = await followUserIds(profileUser)

        return res.json({
            message: 'List of followers',
            total: findFollowers.length,
            findFollowers,
            usersFollowMe: usersFollowers.followers,
            usersFollowing: usersFollowers.following
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const unfollow = async (req, res) => {
    try {
        const userId = req.user.id
        const followId = req.params.id

        const deleteFollow = await Follow.findOneAndDelete({ user: userId, following: followId})

        if (!deleteFollow) return res.status(400).json({
            message: 'Error deleting followed'
        })

        return res.sendStatus(204)

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const followsCounter = async (req, res) => {
    try {
        const username = req.params.username

        const following = await Follow.countDocuments({ user: username })
        const followers = await Follow.countDocuments({ following: username })

        res.json({
            username,
            following: following,
            followers: followers
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const searchFollowers = async (req, res) => {
    const search = req.params.search
    const userSession = req.user.id
    const mutual = req.query.mutual 
    try {
        const usersFound = await User.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } }
                    ]
                },
                { _id: { $ne: userSession } }
            ]
        }).select('name username provider profilePhoto biography')

        if (!usersFound) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userWithFollowers = await Promise.all(usersFound.map(async (user) => {
            const isFollower = await Follow.findOne({ user: user._id, following: userSession }).sort({ followedDate: -1 })
            const isFollowing = await Follow.findOne({ user: userSession, following: user._id })

            if (mutual === 'true') {
                if (isFollower && isFollowing) {
                    return { ...user._doc }
                }
            } else if (mutual === 'false') {
                if (isFollower && !isFollowing) {
                    return { ...user._doc }
                }
            } else if (mutual === 'all') {
                if (isFollower && isFollowing || isFollower && !isFollowing) {
                    return {...user._doc }
                }
            }

            return null
        }))

        const filteredUsers = userWithFollowers.filter(user => user !== null)
        res.json({ users: filteredUsers })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const searchFollowings = async (req, res) => {
    const search = req.params.search
    const mutual = req.query.mutual
    const userSession = req.user.id
    try {
        const usersFound = await User.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { username: { $regex: search, $options: "i" } }
                    ]
                },
                { _id: { $ne: userSession } },
            ],
        }).select("name username provider profilePhoto biography")

        if (!usersFound) {
            return res.status(404).json({ message: "User not found" })
        }

        const userWithFollowings = await Promise.all(usersFound.map(async (user) => {
            const isFollowing = await Follow.findOne({ user: userSession, following: user._id }).sort({ followedDate: -1 })
            const isFollower = await Follow.findOne({ user: user._id, following: userSession })

            if (mutual === "true") {
                if (isFollowing && isFollower) {
                    return { ...user._doc }
                }
            } else if (mutual === "false") {
                if (isFollowing && !isFollower) {
                    return { ...user._doc }
                }
            } else if (mutual === "all") {
                if (isFollowing && isFollower || isFollowing && !isFollower) {
                    return { ...user._doc }
                }
            }

            return null
            })
        );

        const filteredUsers = userWithFollowings.filter((user) => user !== null)
        res.json({ users: filteredUsers })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}