import { configureStore } from '@reduxjs/toolkit'
import registerSlice from './slices/registerSlice.js'
import loginSlice from './slices/loginSlice.js'
import postSlice from './slices/postSlice.js'
import followSlice from './slices/followSlice.js'
import commentsSlice from './slices/commentSlice.js'
import notificationSlice from './slices/notificationSlice.js'
import preferenceSlice from './slices/preferenceSlice.js'

const store = configureStore({
    reducer: {
        registerUser: registerSlice,
        loginUser: loginSlice,
        posts: postSlice,
        follows: followSlice,
        comments: commentsSlice,
        notification: notificationSlice,
        preferences: preferenceSlice
    }
})

export default store