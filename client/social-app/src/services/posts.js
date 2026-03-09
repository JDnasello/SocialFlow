import { instance, multipart } from "./axios.js"


export const getPostsRequest = async (skip) => {
    try {
        const response = await instance.get(`/home?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getOnePostRequest = async (postId) => {
    try {
        const response = await instance.get(`/home/post/${postId}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getUserPostsRequest = async (username, skip) => {
    try {
        const response = await instance.get(`/profile/${username}/posts?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export const getFollowingUsersPostsRequest = async (skip) => {
    try {
        const response = await instance.get(`/following-posts?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export const getLikedPostsRequest = async (username, skip) => {
    try {
        const response = await instance.get(`/profile/${username}/likes?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
} 

export const createPostRequest = async (post) => {
    try {
        const response = await multipart.post('/home', post)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const updatePostRequest = async (id, post) => await multipart.put(`home/${id}`, post)

export const deletePostRequest = async (id) => await instance.delete(`/home/${id}`)

export const deleteFileRequest = async (id, filename) => await multipart.delete(`/post/${id}/file/${filename}`)
