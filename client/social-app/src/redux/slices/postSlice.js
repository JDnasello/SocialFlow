import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: [],
    userPosts: [],
    likes: [],
    onePost: {},
    followingPosts: []
}

const postSlice = createSlice({
    name: "posts",
    initialState: initialState,

    reducers: {
        getStatePosts: (state, action) => {
            if (!action.payload) {
                state.posts = []
            } else {
                const newPosts = action.payload.filter(
                post => !state.posts.some((exists) => exists._id === post._id)
                )

                state.posts = state.posts.concat(newPosts)
            }
        },

        getStateUserPosts: (state, action) => {
            console.log(action.payload);
            
            if (!action.payload) {
                state.userPosts = []
            } else {
                const newPosts = action.payload.filter(
                    post =>  !state.userPosts.some((exists) => exists._id === post._id)
                )

                state.userPosts = [...state.userPosts.filter(post => post.user.username === action.payload[0]?.user.username), ...newPosts]
            }
        },

        getStateLikes: (state, action) => {
            if (!action.payload) {
                state.likes = []
            } else {
                const newLikes = action.payload.filter(
                like => !state.likes.some((exists) => exists._id === like._id)
                )

                state.likes = state.likes.concat(newLikes)
            }
        },

        getStatePost: (state, action) => {
            console.log(action.payload)
            state.onePost = { ...action.payload }
        },

        getFollowingPosts: (state, action) => {
            const newPosts = action.payload.filter(
                post => !state.followingPosts.some((exists) => exists._id === post._id)
            )
            state.followingPosts = state.followingPosts.concat(newPosts)
        },

        newPost: (state, action) => {
            state.posts = [action.payload, ...state.posts]
        },

        editPost: (state, action) => {
            const index = state.posts.findIndex(
                post => post._id === action.payload._id
            )

            if (index !== -1) {
                state.posts[index] = action.payload
            }
        },

        removePost: (state, action) => {
            state.posts = state.posts.filter(post => post._id !== action.payload)
        },

        removeFile: (state, action) => {
            const { id, filename } = action.payload

            const postIndex = state.posts.findIndex((post) => post._id === id)
            if (postIndex !== -1) {
                const filteredFiles = state.posts[postIndex].media = state.posts[postIndex].media.filter(file => file !== filename)
                state.posts[postIndex] = {
                    ...state.posts[postIndex],
                    media: filteredFiles
                }
            }
        },

        clearPosts: (state) => {
            state.posts = []
        },

        clearUserPosts: (state) => {
            state.userPosts = []
        },

        removePostsByUserDeleted: (state, action) => {
            state.posts = state.posts.filter(post => post.user._id !== action.payload)
            state.followingPosts = state.followingPosts.filter(post => post.user._id)
        },

        updateLikes: (state, action) => {
            const { postId, likes } = action.payload

            const postIndex = state.posts.findIndex((post) => post._id === postId)
            if (postIndex !== -1) {
                state.posts[postIndex].likes = likes
            }

            const followingPostsIndex = state.followingPosts.findIndex(post => post._id === postId)

            if (followingPostsIndex !== -1) {
                state.followingPosts[followingPostsIndex].likes = likes
            }

            if (state.onePost._id === postId) state.onePost.likes = likes
        }
    }
})

export const {
    getStatePosts,
    getStateUserPosts,
    getStateLikes,
    getStatePost,
    getFollowingPosts,
    newPost,
    editPost,
    removePost,
    removeFile,
    clearUserPosts,
    clearPosts,
    removePostsByUserDeleted,
    updateLikes } = postSlice.actions
export default postSlice.reducer