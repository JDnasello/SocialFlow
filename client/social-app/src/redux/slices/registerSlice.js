import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    users: [],
    initialUsers: [],
    id: "",
    name: "", 
    username: "",
    email: "",
    provider: '',
    birthDate: "",
    backgroundPhoto: "",
    profilePhoto: "../../img/profile-starter-photo.png",
    biography: "",
    location: "",
    createdAt: "",
    profileUser: null,
    followingCount: '',
    followersCount: '',
    followers: [],
    following: [],
    userFollowers: [],
    userFollowing: [],
    searchHistory: [],
    sessionUsername: '',
    online: false
}

const registerSlice = createSlice({
    name: "registerUser",
    initialState: initialState,

    reducers: {
        
        getUsers: (state, action) => {
            state.users = [...action.payload]
        },

        getInitialUsers: (state, action) => {
            state.initialUsers = [...action.payload]
        },

        removeUser: (state, action) => {
            state.initialUsers = state.initialUsers.filter(user => user._id !== action.payload)
        },

        setUser: (state, action) => {
            const { id,
                name,
                username,
                email,
                provider,
                birthDate,
                backgroundPhoto,
                profilePhoto,
                biography,
                location,
                createdAt,
                userFollowers,
                userFollowing,
                online } = action.payload
            
            state.id = id
            state.name = name
            state.username = username
            state.email = email
            state.provider = provider
            state.birthDate = birthDate
            state.backgroundPhoto = backgroundPhoto
            state.profilePhoto = profilePhoto
            state.biography = biography
            state.location = location
            state.createdAt = createdAt
            state.userFollowers = userFollowers
            state.userFollowing = userFollowing
            state.online = online
        },

        editUser: (state, action) => {
            const updateUser = state.profileUser
            updateUser.backgroundPhoto = action.payload.backgroundPhoto
            updateUser.profilePhoto = action.payload.profilePhoto
            updateUser.name = action.payload.name
            updateUser.biography = action.payload.biography
            updateUser.location = action.payload.location
            updateUser.birthDate = action.payload.birthDate
        },

        completeUserState: (state, action) => {
            const { username, birthDate } = action.payload
            state.username = username
            state.birthDate = birthDate
        },

        setProfileUser: (state, action) => {
            state.profileUser = action.payload
        },

        checkSessionUsername: (state, action) => {
            state.username = action.payload
        },

        getFollowers: (state, action) => {
            state.followers = [...action.payload]
        },

        getFollowing: (state, action) => {
            state.following = [...action.payload]
        },

        setFollower: (state, action) => {
            state.following = [...state.following, action.payload]
            state.userFollowing = [...state.userFollowing, action.payload.following]
        },

        clearFollows: (state) => {
            state.followers = []
            state.following = []
        },

        deleteFollowByUserDeleted: (state, action) => {
            state.following = state.following.filter(follow => follow.following._id !== action.payload)
        },

        deleteFollowersByUserDeleted: (state, action) => {
            state.followers = state.followers.filter(follower => follower.usersFollowing.includes(action.payload))
        },

        deleteFollow: (state, action) => {
            state.userFollowing = state.userFollowing.filter(follow => follow !== action.payload)
        },

        addInHistory: (state, action) => {
            state.searchHistory = [...state.searchHistory, action.payload]
        },

        getHistoryReducer: (state, action) => {
            state.searchHistory = [...action.payload]
        },

        removeOneInHistory: (state, action) => {
            state.searchHistory = state.searchHistory.filter(user => user.user !== action.payload)
        },

        removeHistory: (state) => {
            state.searchHistory = []
        }
    }
})

export const {
    getUsers,
    getInitialUsers,
    removeUser,
    setUser,
    editUser,
    completeUserState,
    setProfileUser,
    checkSessionUsername,
    getFollowers,
    getFollowing,
    setFollower,
    clearFollows,
    deleteFollowByUserDeleted,
    deleteFollowersByUserDeleted,
    deleteFollow,
    addInHistory,
    getHistoryReducer,
    removeOneInHistory,
    removeHistory } = registerSlice.actions

export default registerSlice.reducer
