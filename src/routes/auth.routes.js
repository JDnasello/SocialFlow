import { Router } from 'express'
import { register, login, logout, verifyToken, profile, completeUser } from '../controllers/auth.controller.js'
import { followers, following, followsCounter } from '../controllers/follows.controller.js'
import { authRequired } from '../middlewares/validateToken.js'
import { validateSchema } from '../middlewares/validator.middleware.js'
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js'
import { deleteAccount, deleteHistory, deleteOneInHistory, getHistory, getImage, pushHistory, searchUsers, updateUser, uploadImage } from '../controllers/user.controller.js'
import { uploadFiles } from '../middlewares/Storage.js'
import passport from 'passport'
import { createAccessToken } from '../libs/jwt.js'

const router = Router()

router.post('/register', validateSchema(registerSchema), register)
router.post('/login', validateSchema(loginSchema) ,login)
router.post('/logout', logout)
router.post('/upload/avatar', [authRequired, uploadFiles().single('avatar')], uploadImage)
router.post('/upload/background', [authRequired, uploadFiles().single('background')], uploadImage)
router.post('/history-add/', authRequired, pushHistory)

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/create',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = await createAccessToken({ id: req.user._id })
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
    
            if (!req.user.username || !req.user.birthDate) {
                res.redirect(`${process.env.FRONT_HOST}/complete-user`)
            } else {
                res.redirect(`${process.env.FRONT_HOST}/home`)
            }
            
        } catch (error) {
            console.error("Error seting token:", error)
            res.status(500).send("Error to authenticate with Google")
        }
    }
)

router.get('/verify', verifyToken)
router.get('/profile/:username', authRequired, profile, followsCounter)
router.get('/profile/:username/following/:id?', authRequired, following)
router.get('/profile/:username/followers/:id?', authRequired, followers)
router.get('/image/:file', authRequired, getImage)
router.get('/search-user/:search', authRequired, searchUsers)
router.get('/history', authRequired, getHistory)

router.put('/complete-user/:id', authRequired, completeUser)
router.put('/profile/:username/settings', authRequired, updateUser)

router.delete('/delete-user/:id', authRequired, deleteOneInHistory)
router.delete('/delete-history/:id', authRequired, deleteHistory)
router.delete('/delete-account', authRequired, deleteAccount)

export default router