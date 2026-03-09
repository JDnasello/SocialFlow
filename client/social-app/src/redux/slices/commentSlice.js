import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    comments: [],
    userComments: [],
    comment: {},
    replies: []
}

const commentsSlice = createSlice({
    name: 'comments',
    initialState: initialState,

    reducers: {
        getStateComments: (state, action) => {
            state.comments = action.payload || []
        },

        getStateUserComments: (state, action) => {
            if (!action.payload) {
                state.userComments = []
            } else {
                const newComments = action.payload.filter(
                    comment => !state.userComments.some(exists => exists._id === comment._id)
                )

                state.userComments = state.userComments.concat(newComments)
            }
        },

        getStateComment: (state, action) => {
            console.log(action.payload)
            state.comment = { ...action.payload }
        },

        addComment: (state, action) => {
            state.comments = [action.payload, ...state.comments]
        },

        removeComment: (state, action) => {
            state.comments = state.comments.filter(comment => comment._id !== action.payload )
            state.replies = state.replies.filter(reply => reply._id !== action.payload )
        },

        clearComments: (state) => {
            state.comments = []
        },

        removeCommentsByUserDeleted: (state, action) => {
            state.comments = state.comments.filter(comment => comment.user !== action.payload)
        },

        getStateReplies: (state, action) => {
            state.replies = action.payload.replies || []
        },

        addReply: (state, action) => {
            state.replies = [action.payload, ...state.replies]
        },

        updateCommentLikes: (state, action) => {
            const { commentId, likes } = action.payload

            const commentIndex = state.comments.findIndex(c => c._id === commentId)
            if (commentIndex !== -1) {
                state.comments[commentIndex].likes = likes
            }

            const replyIndex = state.replies.findIndex(r => r._id === commentId)
            if (replyIndex !== -1) {
                state.replies[replyIndex].likes = likes
            }

            if (state.comment._id === commentId) state.comment.likes = likes
        }
    }
})

export const {
    getStateComments,
    getStateComment,
    addComment,
    removeComment,
    clearComments,
    removeCommentsByUserDeleted,
    getStateReplies,
    addReply,
    updateCommentLikes } = commentsSlice.actions

export default commentsSlice.reducer