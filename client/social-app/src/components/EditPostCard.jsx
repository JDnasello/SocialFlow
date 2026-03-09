import { Close, TagFaces, InsertPhotoOutlined } from "@mui/icons-material"
import '../css/formPostCard.css'
import { useContext, useState } from "react"
import { PostContext } from "../context/Context"
import EmojiPicker from 'emoji-picker-react'
import { formattedDate } from "../utilities/functions.js"
import RenderMedia from "./RenderMedia.jsx"

const EditPostCard = ({ onCancel, onSubmit, post }) => {

    const { updatePost, deleteFile } = useContext(PostContext)

    const tweetText = post.tweetText

    const [message, setMessage] = useState({ tweetText })
    const [media, setMedia] = useState(post.media)
    const [fileName, setFileName] = useState('')
    const [counter, setCounter] = useState(0)
    const [pickerVisible, setPickerVisible] = useState(false)

    const submit = async (e) => {
        e.preventDefault()

        if (!message.tweetText && media.length < 1) return;
        
        const formData = new FormData()
        formData.append('tweetText', message.tweetText)

        const indexes = []
        media.forEach((file, index) => {
            if (file instanceof File) {
                formData.append('media', file)  
                indexes.push(index)
            }
        })

        formData.append('mediaIndexes', JSON.stringify(indexes))

        console.log(media)
        
        try {

            await updatePost(post._id, formData)
            
            if (fileName) {
                await deleteFile(post._id, fileName)
            }
            
            setMessage({ tweetText: '' })
            setMedia([])
            setCounter(0)
            pickerVisible && setPickerVisible(false)
    
            onSubmit()
            
        } catch (error) {
            console.error('Error updating post: ', error)
        }
    }

    const handleMessageChange = (e) => {
        const { name, value } = e.target
        setMessage(prevMessage => ({
            ...prevMessage,
            [name]: value
        }))
        console.log(message)

        const textLength = value.length
        const countSpan = document.querySelector('.span-counter-edit')

        if (textLength < 1) return setCounter(0)
        
        countSpan.style.color = (textLength >= 950) ? '#f13636'   
                        : (textLength >= 900) ? '#e68e2a'   
                        : '#fff';

        setCounter(textLength)
    }

    const handleEditFile = (files) => {
        const updatedMedia = media.map((item, index) => {
            const update = files.find(f => f.index === index)
            return update ? update.file : item
        })

        setMedia(updatedMedia)
    }

    const handleDeleteFile = index => {
        setMedia(prev => {
            const updatedMedia = prev.filter((_, i) => i !== index)
            return updatedMedia
        })
        setFileName(media[index])
    }

    const handleEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji
        setMessage(prevMessage => ({
            ...prevMessage,
            tweetText: prevMessage.tweetText + emoji
        }))
        const newCount = counter + emoji.length
        setCounter(newCount)
    }

    const pickerClick = () => {
        setPickerVisible(!pickerVisible)
    }


    return (
        <div className="container-edit-post">
            <div style={{ maxWidth: post.media.length > 0 && '800px' }} className="edit-post-card">
                <div className="close-icon">
                    <Close fontSize="medium" onClick={onCancel} />
                </div>
                <div className="edit-post-text">
                    <h2>Editar publicación</h2>
                    <form className="container-post-text" onSubmit={submit} encType="multipart/form-data">
                        <span name='createdAt' style={{ color: '#c5c5c5d3', fontSize: '0.8em'}}>{formattedDate(post.createdAt)}</span>
                        <div className="post-text">
                            <div>
                                <textarea type="text" name='tweetText' id='textarea-text' className='post-textarea'
                                    maxLength={999}
                                    value={message.tweetText}
                                    onChange={handleMessageChange}
                                >
                                </textarea>
                            </div>
                            {post.media?.length > 0 &&
                                <RenderMedia
                                    key={post._id}
                                    post={post}
                                    showIcons={true}
                                    onHandleEditFile={handleEditFile}
                                    onHandleDeleteFile={handleDeleteFile}
                                    type='post' />
                            }
                        </div>

                        <div className='post-separate-line'></div>
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
                                                name='media'
                                                id='input-file'
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files)
                                                    const updates = files.map((file, i) => ({
                                                        index: media.length + i,
                                                        file: file
                                                    }))
                                                    handleEditFile(updates)
                                                }}
                                            />   
                                    </label>    
                                </div>
                            </div>
                            <div className='post-btn'>
                                <span className='span-counter-edit'>{counter}/999</span>
                                <button>Confirmar cambios</button>
                            </div>
                        </div>        
                    </form>
                    {
                        pickerVisible && (
                            <div className='container-emoji-picker'>
                            <EmojiPicker width={'100%'} style={{ maxWidth: '400px' }} height={300}
                                theme='dark'
                                value={message.tweetText}
                                        onEmojiClick={handleEmojiClick}
                                        className={`${pickerVisible ? 'emoji-picker-active' : 'emoji-picker'}`}
                                />    
                            </div>
                        )
                    }  
                </div>  
            </div>
        </div>
    )
}

export default EditPostCard
