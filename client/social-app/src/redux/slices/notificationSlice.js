import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    totalNotifications: 0,
    totalChatsNotifications: 0
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState: initialState,

    reducers: {
        getNotifications: (state, action) => {
            
            const payload = Array.isArray(action.payload) ? action.payload : [action.payload]

            const newNotifications = payload.filter(
                n => !state.notifications.some(exists => exists._id === n._id)
            )
            state.notifications = state.notifications
                .concat(newNotifications)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        },

        getTotalNotifications: (state, action) => {
            console.log(action.payload)
            
            state.totalNotifications = action.payload
        },

        getTotalChatsNotifications: (state, action) => {
            state.totalChatsNotifications = action.payload
        },

        updateTotalChatsNotifications: (state, action) => {
            state.totalChatsNotifications = action.payload 
        },

        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n._id !== action.payload)
        },

        removeAllNotifications: (state) => {
            state.notifications = []
        },

        deleteNotificationsByUserDeleted: (state, action) => {
            state.notifications = state.notifications.filter(n => n.user !== action.payload)
        },

        resetTotalNotifications: (state) => {
            state.totalNotifications = 0
        }
    }
})

export const {
    getNotifications,
    getTotalNotifications,
    getTotalChatsNotifications,
    updateTotalChatsNotifications,
    removeNotification,
    removeAllNotifications,
    deleteNotificationsByUserDeleted,
    resetTotalNotifications } = notificationSlice.actions
export default notificationSlice.reducer