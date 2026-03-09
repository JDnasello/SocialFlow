import { instance } from "./axios.js"

export const registerRequest = async (user) => {
    try {
        const response = await instance.post("/register", user)
        //console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.response)
        throw error
    }
}

export const loginRequest = async (user) => {
    try {
        const response = await instance.post("/login", user)
        //console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.response)
        throw error
    }
}

export const verifyTokenRequest = async () => {
    try {
        const response = await instance.get("/verify")
        //console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.response)
        throw error
    }
}

export const completeUserRequest = async (id, data) => {
    try {
        const response = await instance.put(`/complete-user/${id}`, data)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error.response)
        throw error
    }
}

export const logoutRequest = async (username) => {
    try {
        await instance.post('/logout', { username })
    } catch (error) {
        console.error(error)
    }
}