import { instance } from "./axios.js"


export const getNotificationsRequest = async (skip) => {
    try {
        const response = await instance.get(`/get-notifications?skip=${skip}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const getTotalNotificationsRequest = async () => {
    try {
        const response = await instance.get('/total-notifications')
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export const deleteNotificationRequest = async (id) => {
    try {
        const response = await instance.delete(`/notification/${id}`)
        console.log(response)
        
    } catch (error) {
        console.error(error)
    }
}

export const deleteAllNotificationsRequest = async () => {
    try {
        await instance.delete('/notifications/delete-all')
    } catch (error) {
        console.error(error)
    }
}

export const markNotificationAsReadRequest = async (id) => {
    try {
        await instance.patch(`/read-notification/${id}`)
    } catch (error) {
        console.error(error)
    }
}

export const updateTotalNotificationsRequest = async () => {
    try {
        await instance.patch('/reset-notifications')
    } catch (error) {
        console.error(error)
    }
}

export const getTotalChatsNotificationsRequest = async (id) => {
    try {
        const response = await instance.get(`/get-chat/${id}`)
        console.log(response.data.unreadChatsCount)
        return response.data.unreadChatsCount

    } catch (error) {
        console.error(error)
    }
}