import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    email: '',
    password: '',
    token: '',
}

const loginSlice = createSlice({
    name: 'loginUser',
    initialState: initialState,

    reducers: {
        signInUser: (state, action) => {
            state.email = action.payload.email
            state.password = action.payload.password
            state.token = action.payload.token
        },
        logoutUser: (state) => {
            state.email = ''
            state.password = ''
            state.token = ''
        }
    }
})

export const { signInUser, logoutUser } = loginSlice.actions

export default loginSlice.reducer