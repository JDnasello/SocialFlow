import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId: '',
    following: '',
    followers: '',
    searchFollowers: [],
    searchFollowings: [],
}

const followSlice = createSlice({
    name: 'follows',
    initialState: initialState,

    reducers: {
        getFollowsCounter: (state, action) => {
            const { userId, following, followers } = action.payload
            state.userId = userId
            state.following = following
            state.followers = followers
        },

        getSearchFollowers: (state, action) => {
            state.searchFollowers = [...action.payload]
        },
        getSearchFollowings: (state, action) => {
            state.searchFollowings = [...action.payload]
        }
    }
})

export const { getFollowsCounter, getSearchFollowers, getSearchFollowings } = followSlice.actions
export default followSlice.reducer