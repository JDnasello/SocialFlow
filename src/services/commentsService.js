import Comment from '../models/comments.model.js'

export const postCommentsIds = async (postId) => {
    try {
        const postComments = await Comment.find({ tweet: postId })
        return postComments.length
    } catch (error) {
        throw new Error('Error finding comments: ', error)
    }
}

export const postRepliesIds = async (parentCommentId) => {
    try {
        const replies = await Comment.find({ parentComment: parentCommentId })
        return replies.length
    } catch (error) {
        throw new Error('Error finding replies: ', error)
    }
}