import Follow from '../models/follow.model.js'

export const followUserIds = async (userId) => {
    try {

        // Obtener información de usuarios que sigo
        const following = await Follow.find(
            { user: userId }
        ).select({
            "_id": 0,
            "following": 1
        })

        // Obtener información de usuarios que me siguen
        const followers = await Follow.find(
            { following: userId }
        ).select({
            "_id": 0,
            "user": 1
        })

        // Procesar array de identificadores

        const followingArray = following.map(follow => follow.following)
        const followersArray = followers.map(follow => follow.user)

        return {
            following: followingArray,
            followers: followersArray
        }

    } catch (error) {
        throw new Error('Error finding users', error)
    }
}
