import mongoose from "mongoose";

const searchedUsersSchema = mongoose.Schema(
    {
    user: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    searchedAt: {
        type: Date,
        default: Date.now
    }
    },
    { _id: false }
);

const historySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    searchedUsers: [searchedUsersSchema]
})

export default mongoose.model('History', historySchema)