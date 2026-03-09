import multer from "multer"

export const uploadFiles = () => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === "avatar") {
                cb(null, "./uploads/avatar/")
            } else if (file.fieldname === "background") {
                cb(null, "./uploads/background/")
            } else if (file.fieldname === "media") {
                cb(null, "./uploads/media/")
            } else if (file.fieldname === "file") {
                cb(null, "./uploads/file/")
            } else {
                throw new Error("Invalid file field")
            }
        },

        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname )
        }
    })
    
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 15 * 1024 * 1024,
            fieldSize: 60 * 1024 * 1024
        }
    })

    return upload
}
