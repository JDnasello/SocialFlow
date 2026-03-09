import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config.js"
import { Close, Edit } from "@mui/icons-material"
import { useRef } from "react"
import { useHandleFile } from "../hooks/handleFiles.jsx"

const RenderMedia = ({ post, showIcons, onHandleEditFile, onHandleDeleteFile, type }) => {
    
    const navigate = useNavigate()  
    const inputFileRef = useRef(null)

    const { objectURLs, fileTypes, handleFileChange, deleteObjectUrlFile } = useHandleFile()

    const handleFileClick = (file, fileIndex) => {
        
        navigate(`/home/${post._id}/${type}-media/${file}`, {
            state: { files: post.media, objectURLs, fileTypes, currentIndex: fileIndex, from: type }
        })
        
        console.log(post.media)
    }

    const handleEditFileClick = (index) => {
        inputFileRef.current.click()
        inputFileRef.current.dataset.index = index
    }

    const onFileChange = (e) => {
        const index = parseInt(inputFileRef.current.dataset.index)
        
        console.log(index)
        
        if (index >= 0) {
            const newFile = e.target.files[0]
            handleFileChange(e, index)
            onHandleEditFile([{ index, file: newFile }])
        }
    }

    const onFileDelete = index => {
        if (objectURLs[index]) {
            deleteObjectUrlFile(index)
        } else {
            onHandleDeleteFile(index)
        }
    }

    const renderImage = (fileURL, index) => {
        return (
            <>
                {showIcons && (
                    <div className="container-edit-file-icons">
                    <Edit
                        className="edit-file-icon"
                        fontSize={window.innerWidth >= 768 ? "large" : "small"}
                        onClick={(e) => {
                        e.stopPropagation();
                        handleEditFileClick(index)
                        }}
                    />
                        <Close
                            className="delete-file-icon"
                            fontSize={window.innerWidth >= 768 ? "large" : "small"}
                            onClick={(e) => { e.stopPropagation(); onFileDelete(index)}}
                            />
                    </div>
                )}
                <img src={fileURL} alt="Previsualización de la imágen" />
            </>
        )
    }

    const renderVideo = (fileURL, fileType, index) => {
        return (
            <>
                {showIcons && (
                    <div className="container-edit-file-icons">
                    <Edit
                        className="edit-file-icon"
                        fontSize={window.innerWidth >= 768 ? "large" : "small"}
                        onClick={(e) => {
                        e.stopPropagation();
                        handleEditFileClick(index)
                        }}
                    />
                        <Close
                            className="delete-file-icon"
                            fontSize={window.innerWidth >= 768 ? "large" : "small"}
                            onClick={(e) => { e.stopPropagation(); onFileDelete(index)}}
                            />
                    </div>
                )}
                <video key={fileURL} controls muted autoPlay loop>
                    <source src={fileURL} type={`video/${fileType}`} />
                    El navegador que estás utilizando no soporta este tipo de archivo
                </video>
            </>
        )
    }

    const renderFiles = () => {
        return post.media.map((file, index) => {

            const fileURL = objectURLs[index] || `${API_BASE_URL}/home/${post._id}/${type}-media/${file}`

            const extension = objectURLs[index]
                ? fileTypes[index]
                : file.split(".").pop().toLowerCase()

            const isImage = ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)
            const isVideo = ["mp4", "mov", "webm", "ogv", "avi"].includes(extension)
    
            return (
                <div
                    key={index}
                    onClick={() => handleFileClick(file, index)}
                    style={{ border: "1px solid #4242428a" }}
                >   
                    {isImage ? renderImage(fileURL, index)
                        : isVideo ? renderVideo(fileURL, extension, index)
                            : !isImage && !isVideo && (
                                <span className="file-not-allowed">
                                    El archivo que intentas subir no puede cargarse en la página.
                                </span>
                            )
                    }
                </div>
            )
        })
    }
    return (
        <>
            <div className="container-post-media" onClick={(e) => e.stopPropagation()}>
                <div className={`files ${post.media.length === 3 ? 'post-media-3' : post.media.length === 4 ? 'post-media-4' : 'post-media'}`}>
                    {post.media && renderFiles()}
                </div>
            </div>
            <input
                type="file"
                accept="image/*,video/*"
                ref={inputFileRef}
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
            
        </>
    )
}

export default RenderMedia