import mongoose from "mongoose"

const followSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  followedDate: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Follow', followSchema)