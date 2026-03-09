export const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body)
        next()
    } catch (err) {
        const formatedErrors = err.errors.reduce((acc, error) => {
            const key = Object.keys(error.message)[0]
            acc[key] = error.message[key]
            return acc
        }, {})

        res.status(400).json(formatedErrors)
    }
}