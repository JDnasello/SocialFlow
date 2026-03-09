import mongoose from "mongoose"

const twLikeSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tweet",
    required: true
  },
})
twLikeSchema.index({ user: 1, tweet: 1 }, { unique: true })

export default mongoose.model('Likes', twLikeSchema)