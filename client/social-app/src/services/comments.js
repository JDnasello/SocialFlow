import { instance, multipart } from './axios.js'

export const getCommentsRequest = async (postId, skip) => {
    try {
        const response = await instance.get(`/home/post/${postId}/comments?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getCommentRequest = async (commentId) => {
    try {
        const response = await multipart.get(`/home/comment/${commentId}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        if (error.response.status === 404) {
            console.error('Comment not found')
            return null
        } else { 
            console.error(error)
        }
    }
}

export const getUserPostsCommentsRequest = async (username, skip) => {
    try {
        const response = await instance.get(`/profile/${username}/comments?skip=${skip}`)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const createCommentRequest = async (postId, parentComment, comment) => {
    try {
        const endpoint = parentComment ? `/home/comment/${parentComment}/reply` : `/home/post/${postId}/new-comment`
        const response = await multipart.post(endpoint, comment)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const deleteCommentRequest = async (commentId) => await instance.delete(`/comment/${commentId}`)

export const getRepliesRequest = async (parentCommentId, skip) => {
    try {
        const response = await instance.get(`/home/comment/${parentCommentId}/replies?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}