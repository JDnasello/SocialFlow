import { useParams, useLocation, useNavigate } from 'react-router-dom'
import '../css/individualFile.css'
import { API_BASE_URL } from '../config.js'
import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material'
import { useEffect, useState } from 'react'

const IndividualFile = ({ mode }) => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { files, objectURLs, fileTypes, currentIndex, from } = location.state

    const [currentFileIndex, setCurrentFileIndex] = useState(currentIndex)
    const [addSlideLeftClass, setAddSlideLeftClass] = useState('')
    const [addSlideRightClass, setAddSlideRightClass] = useState('')

    const mediaFileType = from.includes('post') ? 'post-media' : 'comment-media'
    const currentFile = files[currentFileIndex].split('/').pop()

    const fileURL = objectURLs?.[currentFileIndex] || `${API_BASE_URL}/home/${id}/${mediaFileType}/${currentFile}`
    
    const extension = objectURLs[currentFileIndex]
        ? fileTypes[currentFileIndex]
        : currentFile.split('.').pop().toLowerCase()
    
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)
    const isVideo = ['mp4', 'mov', 'webm', 'ogv', 'avi'].includes(extension)


    useEffect(() => {
        const arrowLeft = document.querySelector('.arrow-left')
        const arrowRight = document.querySelector('.arrow-right')
        
        if (files.length === 1) {
            arrowLeft.style.visibility = 'hidden'
            arrowRight.style.visibility = 'hidden'
        } else {
            arrowLeft.style.visibility = currentFileIndex === 0 ? 'hidden' : 'visible'
            arrowRight.style.visibility = currentFileIndex === files.length - 1 ? 'hidden' : 'visible'
        }

    }, [files, currentFileIndex])

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAddSlideLeftClass('')
            setAddSlideRightClass('')
        }, 300)

        return () => clearTimeout(timeout)
    }, [addSlideLeftClass, addSlideRightClass])

    const goBack = () => {
        setAddSlideRightClass('')
        setAddSlideLeftClass('slide-left')
        setCurrentFileIndex(prevIndex => (prevIndex === 0 ? files.length - 1 : prevIndex - 1))
    }

    const goNext = () => {
        setAddSlideLeftClass('')
        setAddSlideRightClass('slide-right')
        setCurrentFileIndex(prevIndex => (prevIndex === files.length - 1 ? 0 : prevIndex + 1))
    }

    return (
        <div className={`container-individual-mediafile ${!mode ? 'light-mode' : ''}`}>
            <Close
                className='close-individual-file'
                fontSize='large'
                onClick={() => navigate(-1)}
            />
            <ArrowBackIos className='arrow arrow-left' style={{ position: 'relative', left: '10px' }} onClick={goBack} />
            <div className={`individual-file ${addSlideLeftClass && addSlideLeftClass} ${addSlideRightClass && addSlideRightClass}`}>
                {
                    isImage ? <img src={fileURL} alt="" />
                        : isVideo ?
                            <video controls>
                                <source src={fileURL} type={`video/${extension}`} />
                            </video>
                            : !isImage && !isVideo && (
                                <span className="file-not-allowed">
                                    El archivo que intentas subir no puede cargarse en la página.
                                </span>
                            )
                }
            </div>
            <ArrowForwardIos className='arrow arrow-right' onClick={goNext} />
        </div>
    )
}

export default IndividualFile
