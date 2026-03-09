import { Link } from 'react-router-dom'
import '../css/home.css'
import '../css/formPostCard.css'
import { useContext, useEffect, useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { useSelector } from 'react-redux'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { InsertPhotoOutlined, TagFaces } from '@mui/icons-material'
import { PostContext } from '../context/Context.jsx'
import { API_BASE_URL } from '../config.js'
import MediaFiles from './MediaFiles.jsx'
import { useHandleFile } from '../hooks/handleFiles.jsx'

const PostCard = ({ post, parentComment, isIndividualPostPath, isCommentPath, placeholder, mode }) => {

    const user = useSelector(state => state.registerUser)
    const { addPost, createComment } = useContext(PostContext)
    
    const refForm = useRef()
    
    const [message, setMessage] = useState({ tweetText: '' })
    const [commentMessage, setCommentMessage] = useState({ commentText: '' })
    const [count, setCount] = useState(0)
    const [pickerVisible, setPickerVisible] = useState(false)

    const { files, setFiles, galleryItems, setGalleryItems, handleFilesChange } = useHandleFile()
    
    const submit = async (e) => {
        e.preventDefault()
        
        if (!message.tweetText && files.length === 0 && !commentMessage.commentText && files.length === 0) return;
        
        const formData = new FormData()

        if (isIndividualPostPath) {
            formData.append('commentText', commentMessage.commentText)
            files.forEach(file => {
                formData.append('media', file)
            })

            await createComment(post._id, null, formData)
        } else if (isCommentPath) {
            formData.append('parentComment', parentComment)
            formData.append('commentText', commentMessage.commentText)
            files.forEach(file => {
                formData.append('media', file)
            })
            await createComment(null, parentComment, formData)
        } else {
            formData.append('tweetText', message.tweetText)
            files.forEach(file => {
                formData.append('media', file)
            })
            
            await addPost(formData)
        }
        
        setMessage({ tweetText: '' })
        setCommentMessage({ commentText: '' })
        setFiles([])
        setGalleryItems([])
        setCount(0)
        pickerVisible && setPickerVisible(false)
    }


    const handleEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji

        if (isIndividualPostPath || isCommentPath) {
            setCommentMessage(prevMessage => ({
                ...prevMessage,
                commentText: prevMessage.commentText + emoji
            }))
        } else {
            setMessage(prevMessage => ({
                ...prevMessage,
                tweetText: prevMessage.tweetText + emoji
            }))
        }

        const newCount = count + emoji.length
        setCount(newCount)
    }

    const handleMessageChange = (e) => {
        const { name, value } = e.target

        if (isIndividualPostPath || isCommentPath) {
            setCommentMessage(prevComment => ({
                ...prevComment,
                [name]: value
            }))
        } else {
            setMessage(prevMessage => ({
                ...prevMessage,
                [name]: value
            }))
        }

        const textLength = value.length
        const countSpan = document.querySelector('.span-counter')

        if (textLength < 1) return setCount(0)
        
        countSpan.style.color = (textLength >= 950) ? '#f13636'
            : (textLength >= 900) ? '#e68e2a'
                : null;

        setCount(textLength)
    }

    const pickerClick = () => {
        setPickerVisible(!pickerVisible)
    }

    useEffect(() => {
        const textarea = refForm.current.querySelector('#textarea-text')
        textarea.style.height = 'auto'
        textarea.style.height = (textarea.scrollHeight) + 'px'
    }, [message])

    useEffect(() => {
        return () => {
            galleryItems.forEach(file => URL.revokeObjectURL(file.original))
        }
    }, [galleryItems])

    const getProgressWidth = () => {
        const maxLength = 999
        return `${(count / maxLength) * 100}%`
    }

    return (
        <>
        <div className='container-post-content'>
            <div className='container-post-profile-photo'>
                    <Link to={`/profile/${user.username}`}>
                        {
                            user.profilePhoto && user.provider === 'local' ? 
                                <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                
                                : user.profilePhoto && user.provider === 'google' ? <img src={user.profilePhoto} alt="Foto de perfil" />
                                    
                                : <img src={DefaultProfilePhoto} alt='Foto de perfil' />
                        }
                    </Link>
            </div>
                <form className='container-post-text' ref={refForm} onSubmit={submit} encType='multipart/form-data'>
                <div className='post-text'>
                    <div>
                        <textarea type="text" name={`${isIndividualPostPath || isCommentPath ? 'commentText' : 'tweetText'}`} id='textarea-text' className='post-textarea'
                            placeholder={placeholder}
                            maxLength={999}
                            value={isIndividualPostPath || isCommentPath ? commentMessage.commentText : message.tweetText}
                            onChange={handleMessageChange}>
                        </textarea>
                    </div>
                </div>
                
                <MediaFiles galleryItems={galleryItems} />
                
                <div className='post-separate-line'>
                    <div style={{ width: getProgressWidth(), backgroundColor: 'var(--color-preference)', height: '100%'}}>
                    </div>    
                </div>
                <div className='container-icons-and-btn'>
                    <div className='post-icons'>
                        <div className='post-icon'>
                            <TagFaces fontSize='small' onClick={pickerClick} />
                        </div>
                        <div className='post-icon'>
                            <label htmlFor="input-file">
                                <InsertPhotoOutlined fontSize='small' />
                                    <input accept='image/*,video/*'
                                        type="file"
                                        name="media"
                                        id='input-file'
                                        multiple
                                        onChange={handleFilesChange}
                                    />   
                            </label>    
                        </div>
                    </div>
                    <div className='post-btn'>
                        <span className='span-counter'>{count}/999</span>
                        <button>Publicar</button>
                    </div>
                </div>
            </form>
        </div>
                    {
                        pickerVisible && (
                            <div className='container-emoji-picker'>
                            <EmojiPicker width={'80%'} height={500}
                                theme='dark'
                                value={isIndividualPostPath || isCommentPath ? commentMessage.commentText : message.tweetText}
                                onEmojiClick={handleEmojiClick}
                                className={`${pickerVisible ? 'emoji-picker-active' : 'emoji-picker'}`}
                                />    
                            </div>
                        )
                    }    
    </>
    )
}

export default PostCard
