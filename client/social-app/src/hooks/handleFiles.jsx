import { useEffect, useState } from "react";

export const useHandleFile = () => {
    const [files, setFiles] = useState([])
    const [file, setFile] = useState('')
    const [objectURLs, setObjectURLs] = useState({})
    const [fileTypes, setFileTypes] = useState({})
    const [galleryItems, setGalleryItems] = useState([])

    const renderFiles = (file) => {
        const fileType = file.type.split('/')[0]
        const fileURL = URL.createObjectURL(file)

        if (fileType === 'image') {
            return <img src={fileURL} alt="" />
        } else if (fileType === 'video') {
            return (
                <video src={fileURL} controls>
                    <source src={fileURL} type={file.type} />
                    El navegador que estás utilizando no soporta este tipo de archivo
                </video>
            )
        } else {
            <span>El archivo que intentas subir no está permitido</span>
        }
    }

    const handleFilesChange = e => {
        const mediaFiles = Array.from(e.target.files)
        const filesLimit = [...files, ...mediaFiles]
        setFiles(filesLimit)
    
        if (filesLimit.length <= 4) {
            const newGalleryItems = filesLimit.map((file) => {
            const fileURL = URL.createObjectURL(file)
            return {
                original: fileURL,
                thumbnail: fileURL,
                renderItem: () => renderFiles(file)
            }
            })
            setGalleryItems(newGalleryItems)
        } else {
            return <span>Solo se permite subir hasta 4 archivos por publicación</span>
        }
    }

    const handleFileChange = (e, index) => {
        const mediaFile = e.target.files[0]
        setFile(mediaFile)

        if (mediaFile) {
            deleteObjectUrlFile(index)
            console.log(mediaFile)
            
            const fileURL = URL.createObjectURL(mediaFile)
            const fileType = mediaFile.type.split('/')[1]
    
            setObjectURLs(prev => ({ ...prev, [index]: fileURL }))
            setFileTypes(prev => ({ ...prev, [index]: fileType }))
    
            console.log(fileURL)
            e.target.value = ''
        }
    }

    const deleteObjectUrlFile = index => {
        if (objectURLs[index]) {
            URL.revokeObjectURL(objectURLs[index])

            setObjectURLs(prev => {
                const updated = { ...prev }
                delete updated[index]
                return updated
            })
            setFile(null)

            setFileTypes(prev => {
                const updated = { ...prev }
                delete updated[index]
                return updated
            })
        }
    }

    useEffect(() => {
        return () => {
            Object.keys(objectURLs).forEach((key) => deleteObjectUrlFile(key))
        }
    }, [])

    return {
        files,
        setFiles,
        file,
        setFile,
        objectURLs,
        fileTypes,
        galleryItems,
        setGalleryItems,
        renderFiles,
        handleFilesChange,
        handleFileChange,
        deleteObjectUrlFile
    }
}
