import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import { createAccessToken } from '../libs/jwt.js'
import jwt from "jsonwebtoken"
import { followUserIds } from "../services/followService.js"

export const register = async (req, res) => {
    const { name, username, email, password, birthDate } = req.body
    
    try {
        const usernameFound = await User.findOne({ username })
        if (usernameFound) return res.status(400).json(['Nombre de usuario ya en uso'])

        const emailFound = await User.findOne({ email })
        if (emailFound) return res.status(400).json(['Correo electrónico ya en uso'])

        const passwordHashed = await bcrypt.hash(password, 10)
    
        const newUser = new User({
            name,
            username,
            email,
            password: passwordHashed,
            birthDate,
            provider: 'local'
        })
        const userSaved = await newUser.save()
        const token = await createAccessToken({ id: userSaved._id })

        res.cookie('token', token)
        res.status(201).json({
            id: userSaved._id,
            name: userSaved.name,
            username: userSaved.username,
            birthDate: userSaved.birthDate,
            createdAt: userSaved.createdAt
        })
    } catch (err) {
        res.status(500).json({
            "message": err.message
        })
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const userFound = await User.findOne({ email })
        if (!userFound) {
            return res.status(400).json(["Usuario no encontrado"])
        }
        const isSame = await bcrypt.compare(password, userFound.password)
        if (!isSame) {
            return res.status(400).json(["Contraseña incorrecta"])
        }

        const token = await createAccessToken({ id: userFound._id })
        
        console.log(userFound)
        

        res.cookie('token', token)
        res.json({
            id: userFound._id,
            name: userFound.name,
            username: userFound.username,
            provider: userFound.provider,
            backgroundPhoto: userFound.backgroundPhoto,
            profilePhoto: userFound.profilePhoto,
            createdAt: userFound.createdAt
        });
    } catch (err) {
        res.status(500).json({
            "message": err.message
        })
    }
}

export const logout = async (req, res) => {
    const { username } = req.body
    try {
        const userFound = await User.findOne({ username })
        if (!userFound) return res.status(404).json({
            message: 'User not found'
        })

        res.cookie('token', '', {
            expiresIn: new Date(0)
        })
        res.sendStatus(200)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }

}

export const profile = async (req, res) => {

    const userFound = await User.findOne({ username: req.params.username })
    if (!userFound) {
        return res.status(404).json({
            "message": "User not found"
        })
    }

    const { following, followers } = await followUserIds(userFound._id)
    const followingCount = following.length
    const followersCount = followers.length

    res.json({
        id: userFound._id,
        name: userFound.name,
        username: userFound.username,
        provider: userFound.provider,
        backgroundPhoto: userFound.backgroundPhoto,
        profilePhoto: userFound.profilePhoto,
        biography: userFound.biography,
        location: userFound.location,
        createdAt: userFound.createdAt,
        following,
        followingCount,
        followers,
        followersCount
    });
}

export const verifyToken = async (req, res, next) => {
    
    try {
        const { token } = req.cookies

        if (!token)
            return res.status(403).json({ message: "Usuario no autorizado" })

        jwt.verify(token, process.env.SECRET_TOKEN, async (err, user) => {
            if (err) return res.status(403).json({
                message: "Usuario no posee los permisos necesarios"
            })

            const userFound = await User.findById(user.id)
            if (!userFound) return res.status(401).json({
                message: "Usuario no autorizado"
            })

            const userFollowers = await followUserIds(userFound)

            res.json({
                id: userFound._id,
                name: userFound.name,
                username: userFound.username,
                provider: userFound.provider,
                birthDate: userFound.birthDate,
                backgroundPhoto: userFound.backgroundPhoto,
                profilePhoto: userFound.profilePhoto,
                createdAt: userFound.createdAt,
                userFollowers: userFollowers.followers,
                userFollowing: userFollowers.following
            })
        })
    } catch (error) {
        return res.status(404).json({
            message: 'Token inválido',
            error: error.message
        })
    }
}

export const completeUser = async (req, res) => {
    const userId = req.params.id
    const { username } = req.body
    try {

        const usernameFound = await User.findOne({ username })

        if (usernameFound) return res.status(400).json(['Nombre de usuario ya en uso'])

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true })

        res.json(updatedUser)

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}