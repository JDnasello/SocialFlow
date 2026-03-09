import { instance, multipart } from "./axios"

export const getUserByUsernameRequest = async (username) => {
    try {
        const response = await instance.get(`/profile/${username}`)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const updateUserRequest = async (username, user) => await instance.put(`/profile/${username}/settings`, user)

export const uploadAvatarRequest = async (avatar) => {
    try {
        const response = await multipart.post('/upload/avatar', avatar)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const uploadBackgroundRequest = async (background) => {
    try {
        const response = await multipart.post('/upload/background', background)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getFollowersRequest = async (username) => {
    try {
        const response = await instance.get(`/profile/${username}/followers`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const getFollowingRequest = async (username) => {
    try {
        const response = await instance.get(`/profile/${username}/following`)
        console.log(response.data.findFollowing)
        return response.data.findFollowing
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const followUserRequest = async (user) => {
    try {
        const response = await instance.post('/follow/save-follow', { following: user })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const unfollowRequest = async (userId) => await instance.delete(`/follow/unfollow/${userId}`)

export const searchUsersRequest = async (search) => {
    try {
        const response = await instance.get(`/search-user/${search}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const pushInHistoryRequest = async (userId, searchedUserId, type) => {
    try {
        const response = await instance.post('/history-add', { userId, searchedUserId, type })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const getHistoryRequest = async (type) => {
    try {
        const response = await instance.get(`/history?type=${type}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const deleteOneInHistoryRequest = async (id, type) => {
    try {
        await instance.delete(`/delete-user/${id}?type=${type}`)
    } catch (error) {
        console.error(error)
    }
}

export const deleteHistoryRequest = async (id, type) => {
    try {
        await instance.delete(`/delete-history/${id}?type=${type}`)
    } catch (error) {
        console.error(error)
    }
}

export const deleteAccountRequest = async () => {
    try {
        const response = await instance.delete('/delete-account')
        console.log(response)
    } catch (error) {
        console.error(error)
    }
}