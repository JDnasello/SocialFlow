import jwt from 'jsonwebtoken'

export const authRequired = (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return res.status(401).json({
            "message": "Unauthorized access"
        })
    }
    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if (err) {
            return res.status(403).json({
                "message": "The user doesn't have the necessary permissions"
            })
        }
        req.user = user
        next()
    })
}

