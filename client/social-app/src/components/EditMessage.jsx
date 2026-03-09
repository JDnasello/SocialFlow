import { Close, Send, TagFaces } from "@mui/icons-material"
import EmojiPicker from "emoji-picker-react"
import { useEffect, useRef, useState } from "react"
import '../css/editMessage.css'

const EditMessage = ({ socket, senderId, receiverId, message, setShowEditMessage, bodyScrollRef }) => {

    const [pickerVisible, setPickerVisible] = useState(false)
    const [msg, setMsg] = useState(message.message)
    const textareaRef = useRef(null)
    const [isClosed, setIsClosed] = useState(false)

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea !== null) {
            textarea.style.height = '10px'
            textarea.style.height = (textarea.scrollHeight) + 'px'
        }
    }, [msg])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!msg) return;
        
        

        socket.emit('updateMessage', {
            messageId: message._id,
            newMessage: msg,
            senderId,
            receiverId,
            chatId: message.chatId
        })

        handleCloseEditMsg()
    }

    const handleEnterPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const pickerClick = () => {
        setPickerVisible(!pickerVisible)
    }

    const handleEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji
        console.log(emoji)
        setMsg(prevMsg => prevMsg + emoji)
    }

    const handleCloseEditMsg = () => {
        setIsClosed(true)
        setTimeout(() => {
            setShowEditMessage(false)
        }, 500)
    }

    return (
        <div className={`container-edit-message ${isClosed ? 'closed' : ''}`}>
            <div className={`edit-message-card ${isClosed ? 'closed' : ''}`}>
                <header className="edit-message-header">
                    <Close onClick={handleCloseEditMsg} />
                    <h2>Editar mensaje</h2>
                </header>
                <div className="container-edit-message-body">
                    <div className="edit-message-body">
                        <div className="message-body own-message">
                            <div className="container-message-txt without-file">
                                <span className="text-left-space"></span>
                                <span className="text">{message.message}</span>
                                <span className="empty-text"></span>
                            </div>
                            <div className="container-message-date date-without-file">
                                <span className="message-date">
                                    {message.createdAt && message.createdAt.split('T')[1].slice(0, 5)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="chat-footer">
                    <div className="container-send-message">
                        <div className="emojis-and-files">
                            <TagFaces onClick={pickerClick} />
                        </div>
                        <form className='chat-form' onSubmit={handleSubmit}>
                            <div className="input-message">
                                <textarea
                                    ref={textareaRef}
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    onKeyDown={handleEnterPress}
                                    />
                            </div>
                            <button className={`send-message ${msg.length === 0 ? 'disabled-send-message' : ''}`}>
                                <Send fontSize="large" />
                            </button>
                        </form>
                    </div>
                    {
                        pickerVisible && (
                            <div className='container-emoji-picker'>
                                <EmojiPicker width={'100%'} height={400}
                                    theme='dark'
                                    value={msg}
                                    onEmojiClick={handleEmojiClick}
                                    className={`${pickerVisible ? 'emoji-picker-active' : 'emoji-picker'}`}
                                    />    
                            </div>
                        )
                    }
                </footer>
            </div>
        </div>
    )
}

export default EditMessage
