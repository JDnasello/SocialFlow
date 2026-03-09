import { useEffect, useRef, useState } from "react"
import { API_BASE_URL } from "../config.js"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { Delete, MoreVert, PlayArrow } from "@mui/icons-material"
import ChatFile from "./ChatFile.jsx"
import ConfirmationCard from "./ConfirmationCard.jsx"
import MessageDeleted from "./MessageDeleted.jsx"
import EditMessage from "./EditMessage.jsx"

const Chat = ({ socket, message, sessionUser, receiverId, lastMessage, setShowMessageDeleted, showMessageDeleted, bodyScrollRef }) => {
    const [openFile, setOpenFile] = useState(false)
    const [visible, setIsVisible] = useState(false)
    const [options, setOptions] = useState(null)
    const optionsRef = useRef(null)
    const [showConfirmationCard, setShowConfirmationCard] = useState(false)
    const [showEditMessage, setShowEditMessage] = useState(false)

    useEffect(() => {
        const otherOptionsOpened = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setOptions(null)
            }
        }

        document.addEventListener('mousedown', otherOptionsOpened)
        return () => document.removeEventListener('mousedown', otherOptionsOpened)
    }, [])

    const handleDeleteMessage = async () => {
        const chatBody = bodyScrollRef.current
        const oldScrollTop = chatBody.scrollTop
        try {
            
            socket.emit('deleteMessage', {
                messageId: message._id,
                chatId: message.chatId,
                senderId: sessionUser.id
            })

            setTimeout(() => {
                chatBody.scrollTop = oldScrollTop
            }, 0)

            setShowConfirmationCard(false)
            setShowMessageDeleted(true)

        } catch (error) {
            console.error('Error al eliminar el mensaje ', error)
        }
    }

    const handleOptionsClick = (id) => {
        setOptions(prev => prev === id ? null : id)
    }

    return (
        <>
            <div className={`container-message ${message.sender === sessionUser.id ? 'message-end' : 'message-start'}`}>
                {
                    message.sender !== sessionUser.id && message.profilePhoto && message.provider === 'local' ?
                        <img src={`${API_BASE_URL}/image/${message.profilePhoto}?type=avatar`} alt="Foto de perfil" className="user-chat-photo" />

                        : message.sender !== sessionUser.id && message.profilePhoto && message.provider === 'google' ?
                            <img src={message.profilePhoto} alt="Foto de perfil" className="user-chat-photo"  />

                            : !sessionUser && <img src={DefaultProfilePhoto} alt="Foto de perfil" className="user-chat-photo"  />
                }
                {message.sender !== sessionUser.id && (
                    <div className="container-tail">
                        <PlayArrow fontSize="large" className="receiver-message-tail" />
                    </div>
                    )
                }
                <div
                    className={`message-body ${message.sender === sessionUser.id ? 'own-message' : 'receiver-message'}`}
                    onMouseEnter={() => setIsVisible(true)}
                    onMouseLeave={() => setIsVisible(false)}>
                    {
                        message.sender === sessionUser.id && (
                            !message.file ? (
                                <div className={`message-actions ${visible || options === message._id ? 'visible' : ''}`} onClick={() => handleOptionsClick(message._id)}>
                                    <MoreVert className={`${visible ? 'icon-visible' : ''}`} />
                                </div>
                            )
                                : message.file && (
                                    <div className={`message-actions ${visible ? 'visible' : ''}`} onClick={() => setShowConfirmationCard(true)}>
                                        <Delete className={`${visible ? 'icon-visible' : ''}`} />
                                    </div>
                                )
                        )
                    }
                    <div className={`container-message-txt ${message.file ? 'with-file' : 'without-file'}`}>
                        {
                            message.file && (
                                <div className="container-message-file">
                                    <img
                                        src={`${API_BASE_URL}/get-message/file/${message.file}`}
                                        alt=""
                                        className="message-file"
                                        onClick={() => setOpenFile(true)}/>
                                </div>
                            )
                        }
                        {message.message && (
                            <> 
                                <span className="text-left-space"></span>
                                <span className="text">{message.message}</span>
                                <span className="empty-text"></span>
                            </>
                        )}   
                    </div>
                    <div className={`container-message-date ${!message.file ? 'date-without-file' : ''}`}>
                        {message.isEdited && <span className="message-edited">Editado</span>}
                        <span
                            className={
                                message.file && !message.message ? 'message-date-for-photo'
                                    : message.message && 'message-date'}>
                            {message.createdAt && message.createdAt.split('T')[1].slice(0, 5)}
                        </span>
                    </div>
                    {message.sender === sessionUser.id && lastMessage && message.read && (
                        <div className="container-message-seen">
                            <span className="message-seen">Visto</span>
                        </div>
                    )}
                </div>
                {message.sender === sessionUser.id && <PlayArrow fontSize="large" className="own-message-tail" />}
                {
                    message.sender === sessionUser.id && options === message._id && (
                        <div ref={optionsRef} className="message-options">
                            {!message.file && <span onClick={() => setShowEditMessage(true)}>Editar</span>}
                            <span onClick={() => setShowConfirmationCard(true)}>Eliminar</span>
                        </div>
                    )
                }
            </div>
            {showConfirmationCard && 
                <ConfirmationCard
                    onConfirm={handleDeleteMessage}
                    onCancel={() => setShowConfirmationCard(false)}
                    titleConfirmation={'Desea eliminar el mensaje?'}
                    descriptionConfirmation={'En caso de eliminarlo, el mismo será borrado de la plataforma.'}
                />
            } 
            {openFile && <ChatFile
                file={message.file}
                message={message.message}
                setOpenFile={setOpenFile}
                />
            }
            {showMessageDeleted && <MessageDeleted setShowMessageDeleted={setShowMessageDeleted} />}
            {showEditMessage &&
                <EditMessage
                socket={socket}
                message={message}
                senderId={message.sender}
                receiverId={receiverId}
                setShowEditMessage={setShowEditMessage}
                showEditMessage={showEditMessage}
                bodyScrollRef={bodyScrollRef}
                />}
        </>
    )
}

export default Chat
