import mongoose from "mongoose"
import findOrCreatePlugin from "mongoose-findorcreate"

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    required: true,
    default: 'local'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function () { return this.provider === 'local' },
    sparse: true
  },
  birthDate: {
    type: Date,
    default: null
  },
  backgroundPhoto: {
    type: String
  },
  profilePhoto: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  biography: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  online: {
    type: Boolean,
    default: false
  },
  totalNotifications: {
    type: Number,
    default: 0
  }
})

userSchema.plugin(findOrCreatePlugin)

export default mongoose.model('User', userSchema)