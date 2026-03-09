import mongoose from "mongoose";
import Messages from '../models/messages.model.js'

const chatSchema = new mongoose.Schema(
    {
        users: { type: Array }
    },
    {
        timestamps: true
    }
)


chatSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const chatId = this._id
        await Messages.deleteMany({ chatId })
        next()
    } catch (error) {
        next(error)
    }
})


export default mongoose.model('Chat', chatSchema)