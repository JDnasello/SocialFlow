import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport"
import User from '../models/user.model.js'

export const googleMiddleware = () => {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:8080/api/auth/google/create"
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const { doc: user } = await User.findOrCreate(
                    { googleId: profile.id },
                {
                    name: profile.displayName,
                    profilePhoto: profile.photos[0].value,
                    email: profile.emails[0].value,
                    provider: 'google'
                })  
                
                return cb(null, user)
            } catch (error) {
                return cb(error, null)
            }
        }
    ))

    passport.serializeUser((user, done) => {
        console.log(user)
        
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user) 
        } catch (error) {
            done(error, null)
        }
    })
}
