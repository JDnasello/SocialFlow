import express from 'express'
import { saveFollow, searchFollowers, searchFollowings, unfollow } from '../controllers/follows.controller.js'
import { authRequired } from '../middlewares/validateToken.js'

const router = express.Router()

router.get('/followers/search/:search', authRequired, searchFollowers)
router.get('/followings/search/:search', authRequired, searchFollowings)

router.post('/save-follow', authRequired, saveFollow)
router.delete('/unfollow/:id', authRequired, unfollow)

export default router