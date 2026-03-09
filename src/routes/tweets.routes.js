import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js"
import {
    createPost,
    deleteFile,
    deletePost,
    getFollowingUsersPosts,
    getLikedPosts,
    getMediaContent,
    getOnePost,
    getPosts,
    updatePost,
    userPosts
} from "../controllers/tweets.controller.js"
import { uploadFiles } from "../middlewares/Storage.js"
import { createComment, deleteComment, getComment, getCommentMediaContent, getComments, getReplies, getUserPostsComments } from "../controllers/comments.controller.js";

const router = Router()

router.get('/home', authRequired, getPosts)
router.get('/home/post/:id', authRequired, getOnePost)
router.get('/home/post/:id/comments', authRequired, getComments)
router.get('/home/comment/:id', authRequired, getComment)
router.get('/home/comment/:id/replies', authRequired, getReplies)
router.get('/profile/:username/posts', authRequired, userPosts)
router.get('/profile/:username/likes', authRequired, getLikedPosts)
router.get('/profile/:username/comments', authRequired, getUserPostsComments)
router.get('/home/:id/post-media/:file', authRequired, getMediaContent)
router.get('/home/:commentId/comment-media/:file', authRequired, getCommentMediaContent)

router.get('/following-posts', authRequired, getFollowingUsersPosts)

router.post('/home', [authRequired, uploadFiles().array('media', 4)], createPost)
router.post('/upload/media', [authRequired, uploadFiles().array('media', 4)])
router.post('/home/post/:id/new-comment', [authRequired, uploadFiles().array('media', 4)], createComment)
router.post("/home/comment/:parentCommentId/reply", [authRequired, uploadFiles().array("media", 4)], createComment)

router.put('/home/:id', [authRequired, uploadFiles().array('media', 4)], updatePost)

router.delete('/home/:id', authRequired, deletePost)
router.delete('/comment/:id', authRequired, deleteComment)
router.delete('/post/:id/file/:filename', authRequired, deleteFile)

export default router