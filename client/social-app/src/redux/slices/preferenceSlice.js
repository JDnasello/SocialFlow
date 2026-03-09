import { createSlice } from "@reduxjs/toolkit";

const initialValues = () => {
    const storedPreferences = JSON.parse(localStorage.getItem('preferences'))
    return storedPreferences || { color: 0, fontSize: 2 }
}

const preferenceSlice = createSlice({
    name: "preferences",
    initialState: initialValues(),

    reducers: {
        setColor: (state, action) => {
        state.color = action.payload
            localStorage.setItem("preferences", JSON.stringify(state))
        },
        setFontSize: (state, action) => {
            state.fontSize = action.payload
            localStorage.setItem("preferences", JSON.stringify(state))
        }
    }
})

export const { setColor, setFontSize } = preferenceSlice.actions
export default preferenceSlice.reducer