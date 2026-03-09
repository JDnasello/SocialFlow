import jwt from "jsonwebtoken"

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.SECRET_TOKEN,
            {
                expiresIn: "30d"
            },
            (err, token) => {
                err ? reject(err.message) : resolve(token)
            }
        )
    })
}