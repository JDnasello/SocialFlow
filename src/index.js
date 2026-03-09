import { connectDB } from './db.js'
import express from 'express'
import { Server as SocketIoServer } from 'socket.io'
import http from 'node:http'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { corsMiddleware } from './middlewares/cors.js'
import authRoutes from './routes/auth.routes.js'
import tweetRoutes from './routes/tweets.routes.js'
import followRoutes from './routes/follow.routes.js'
import chatRoutes from './routes/chats.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import { ioInstance } from './sockets/socket.js'
import session from 'express-session'
import passport from 'passport'
import User from './models/user.model.js'
import { googleMiddleware } from './middlewares/google.js'

connectDB()

    const app = express()
    const server = http.createServer(app)
    const io = new SocketIoServer(server, {
        cors: {
            origin: process.env.FRONT_HOST,
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    })

    app.use(corsMiddleware())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use('/api', authRoutes, tweetRoutes, chatRoutes, messagesRoutes, notificationsRoutes)
    app.use('/api/follow', followRoutes)
    googleMiddleware()
    
    ioInstance(io)
    export { io }

    const PORT = process.env.PORT ?? 3000
    server.listen(PORT, () => {
        console.log(`Listening on port http://localhost:${PORT}`)
    })

