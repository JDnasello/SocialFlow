import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: String,
            required: true
        },
        sender: {
            type: String,
            required: true,
        },
        message: {
        type: String
        },
        read: {
            type: Boolean,
            default: false
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        file: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
)

export default mongoose.model('Message', messageSchema)