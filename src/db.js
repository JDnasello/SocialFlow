import mongoose from "mongoose"

const secretKey = process.env

export const connectDB = async () => {
    try {
        await mongoose.connect(secretKey.DBCONNECTION)
        console.log('DB connection successfully')
    } catch (error) {
        throw new Error('Failed to connect DB', error.message)
    }
}
