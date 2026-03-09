import mongoose from "mongoose";


const responsesSchema = mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    responseText: {
        type: String
    },
    responseFiles: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Response', responsesSchema)