import axios from "axios";
import { API_BASE_URL } from "../config.js";

export const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
});


export const multipart = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "multipart/form-data"
    },
    withCredentials: true
})