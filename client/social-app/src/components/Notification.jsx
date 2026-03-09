import ReactTimeAgo from "react-time-ago"
import { API_BASE_URL } from "../config.js"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { Delete, Replay } from "@mui/icons-material"
import { deleteNotificationRequest, markNotificationAsReadRequest } from "../services/notifications.js"
import '../css/notifications.css'
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { removeNotification } from "../redux/slices/notificationSlice.js"
import { getCommentRequest } from "../services/comments.js"
import { useEffect, useState } from "react"
import RenderMedia from "./RenderMedia.jsx"

const Notification = ({ notification }) => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isDeleted, setIsDeleted] = useState(() => {
        const storedValue = localStorage.getItem(`isDeleted_${notification._id}`)
        return storedValue ? JSON.parse(storedValue) : false
    })
    const [undo, setUndo] = useState(false)

    useEffect(() => {
        if (notification && !localStorage.getItem(`isDeleted_${notification._id}`)) {
            setIsDeleted(false)
        }
    }, [notification])

    useEffect(() => {
        const handleDelete = async () => {
            if (isDeleted && !undo) {
                localStorage.removeItem(`isDeleted_${notification._id}`)
                await deletePermanently()
            } 
        }
        window.addEventListener('beforeunload', handleDelete)
        return () => window.removeEventListener('beforeunload', handleDelete)
    }, [isDeleted, notification._id, undo])

    
    const deletePermanently = async () => {
        if (notification._id) {
            await deleteNotificationRequest(notification._id)
            dispatch(removeNotification(notification._id))
    
            localStorage.removeItem(`isDeleted_${notification._id}`)
        }
    }

    const deleteNotification =  () => {
        setUndo(false)
        
        localStorage.setItem(`isDeleted_${notification._id}`, JSON.stringify(true))
        setIsDeleted(true)
    }

    const undoDeleteNotification = () => {
        setUndo(true)
        localStorage.removeItem(`isDeleted_${notification._id}`)
        setIsDeleted(false)
    }
    
    const markAsRead = async (id) => {
        
        if (notification.type === 'follow') {
            navigate(`/profile/${notification.sender.username}`)
        } else if (notification.type === 'like') {
            navigate(`/home/post/${notification.post._id}`)
        } else if (notification.type === 'reply') {
            const replyFound = await getCommentRequest(notification.reply._id)
            if (replyFound) {
                navigate(`/home/comment/${notification.reply._id}`)
            } else {
                console.log('Reply not found')
                navigate(-1, { state: { notFound: true } })
            }
        } else if (notification.type === 'comment') {
            const commentFound = await getCommentRequest(notification.comment._id)
            if (commentFound) {
                navigate(`/home/comment/${notification.comment._id}`)
            } else {
                console.log('Comment not found')
                navigate('/home', { state: { notFound: true } })  
            }
        } else if (notification.type === 'like comment') {
            navigate(`/home/comment/${notification.comment._id}`)
        } else if (notification.type === 'like reply') {
            navigate(`/home/comment/${notification.reply._id}`)
        }
        await markNotificationAsReadRequest(id)
    }

    return (
        <div className={`container-notification ${isDeleted && !undo ? 'deleting' : ''}`} onClick={() => markAsRead(notification._id)}>
            {
                notification && !isDeleted ? (
                    <article className={`notification ${!notification.read ? 'unread' : ''}`}>
                        {!notification.read && <div className="notification-circle"></div>}
                        <div className="notification-user-photo">
                            <Link to={`/profile/${notification.sender?.username}`}>
                            {
                                notification.sender?.profilePhoto && notification.sender.provider === 'local' ?
                                    <img src={`${API_BASE_URL}/image/${notification.sender.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                    
                                        : notification.sender?.profilePhoto && notification.sender.provider === 'google' ?
                                            <img src={notification.sender.profilePhoto} alt="Foto de perfil" />
                                        
                                            : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                            }
                            </Link>
                        </div>
                        <div className={`notification-text ${notification.type === 'follow' ? 'center' : ''}`}>
                            {
                                notification.type === 'like' || notification.type === 'like comment' || notification.type === 'like reply' ?
                                    <p>A <b>{notification.sender?.name}</b> {notification.message}</p>
                                        : notification.type === 'follow' ? <p><b>{notification.sender?.username}</b> {notification.message}</p>
                                            : <p><b>{notification.sender?.name}</b> {notification.message}</p>
                            }
                            {
                                notification.type === 'like' ? (
                                    <div className="notification-post">
                                        <div className="notification-post-profile-photo">
                                            {
                                                notification.post?.user?.profilePhoto && notification.post.user.provider === 'local' ?
                                                    <img src={`${API_BASE_URL}/image/${notification.post?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                    
                                                        : notification.post?.user?.profilePhoto && notification.post.user.provider === 'google' ?
                                                            <img src={notification.post.user.profilePhoto} alt="Foto de perfil" />

                                                            : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                            }
                                        </div>
                                        <div className="notification-content">
                                            {
                                                notification.post?.tweetText.length >= 100 ?
                                                    <p>{notification.post.tweetText.slice(0, 100)}...</p>
                                                    :
                                                    <p>{notification.post.tweetText}</p>
                                            }
                                            {
                                                notification.post?.media.length > 0 && 
                                                    <RenderMedia
                                                        post={notification.post}
                                                        type='post'
                                                    />  
                                                
                                            }
                                        </div>
                                    </div>
                                )
                                    : notification.type === 'like comment' ? (
                                        <div className="notification-post">
                                            <div className="notification-post-profile-photo">
                                                {
                                                    notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'local' ?
                                                        <img src={`${API_BASE_URL}/image/${notification.comment?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                        
                                                            : notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'google' ?
                                                                <img src={notification.comment.user.profilePhoto} alt="Foto de perfil" />

                                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                }
                                            </div>
                                            {
                                                notification.comment?.commentText.length >= 100 ?
                                                    <p>{notification.comment.commentText.slice(0, 100)}...</p>
                                                    :
                                                    <p>{notification.comment.commentText}</p>
                                            }
                                        </div>
                                    )
                                        : notification.type === 'like reply' ? (
                                            <div className="notification-post">
                                                <div className="notification-post-profile-photo">
                                                    {
                                                        notification.reply?.user?.profilePhoto && notification.reply.user.provider === 'local' ?
                                                            <img src={`${API_BASE_URL}/image/${notification.reply?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                            
                                                                : notification.reply?.user?.profilePhoto && notification.reply.user.provider === 'google' ?
                                                                    <img src={notification.reply.user.profilePhoto} alt="Foto de perfil" />
                                                            
                                                                    : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                    }
                                                </div>
                                                {
                                                    notification.reply?.commentText.length >= 100 ?
                                                        <p>{notification.reply.commentText.slice(0, 100)}...</p>
                                                        :
                                                        <p>{notification.reply.commentText}</p>
                                                }
                                            </div>
                                        )
                                            : notification.type === 'comment' ? (
                                                <div className="notification-post-comment">
                                                    <div className="notification-comment">
                                                        <div className="notification-post-profile-photo">
                                                            {
                                                                notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'local' ?
                                                                    <img src={`${API_BASE_URL}/image/${notification.comment?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                                    
                                                                    : notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'google' ?
                                                                        <img src={notification.comment.user.profilePhoto} alt="Foto de perfil" />
                                                                    
                                                                            : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                            }
                                                        </div>
                                                        {
                                                            notification.comment?.commentText.length >= 100 ?
                                                                <p>{notification.comment.commentText.slice(0, 100)}...</p>
                                                                :
                                                                <p>{notification.comment.commentText}</p>
                                                        }
                                                    </div>
                                                    <div className="notification-post">
                                                        <div className="notification-post-profile-photo">
                                                            {
                                                                notification.post?.user?.profilePhoto && notification.post.user.provider === 'local' ?
                                                                    <img src={`${API_BASE_URL}/image/${notification.post?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                                    
                                                                    : notification.post?.user?.profilePhoto && notification.post.user.provider === 'google' ?
                                                                        <img src={notification.post.user.profilePhoto} alt="Foto de perfil" />
                                                                        
                                                                            : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                            }
                                                        </div>
                                                        {
                                                            notification.post?.tweetText.length >= 100 ?
                                                                <p>{notification.post.tweetText.slice(0, 100)}...</p>
                                                                :
                                                                <p>{notification.post.tweetText}</p>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                                : notification.type === 'reply' && (
                                                    <div className="notification-post-comment">
                                                        <div className="notification-comment">
                                                            <div className="notification-post-profile-photo">
                                                                {
                                                                    notification.reply?.user?.profilePhoto && notification.reply.user.provider === 'local' ?
                                                                        <img src={`${API_BASE_URL}/image/${notification.reply?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                                        
                                                                        : notification.reply?.user?.profilePhoto && notification.reply.user.provider === 'google' ?
                                                                            <img src={notification.reply.user.profilePhoto} alt="Foto de perfil" />
                                                                        
                                                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                                }
                                                            </div>
                                                            {
                                                                notification.reply?.commentText.length >= 100 ?
                                                                    <p>{notification.reply.commentText.slice(0, 100)}...</p>
                                                                    :
                                                                    <p>{notification.reply.commentText}</p>
                                                            }
                                                        </div>
                                                        <div className="notification-post">
                                                            <div className="notification-post-profile-photo">
                                                                {
                                                                    notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'local' ?
                                                                        <img src={`${API_BASE_URL}/image/${notification.comment?.user?.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                                        
                                                                        : notification.comment?.user?.profilePhoto && notification.comment.user.provider === 'google' ?
                                                                            <img src={notification.comment.user.profilePhoto} alt="Foto de perfil" />
                                                                        
                                                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                                }
                                                            </div>
                                                            {
                                                                notification.comment?.commentText.length >= 100 ?
                                                                    <p>{notification.comment.commentText.slice(0, 100)}...</p>
                                                                    :
                                                                    <p>{notification.comment.commentText}</p>
                                                            }
                                                        </div>
                                                    </div>
                                                )
                            }
                        </div>
                        <div className="notification-date-and-delete">
                            {notification.createdAt && <span><ReactTimeAgo date={new Date(notification.createdAt)} locale="es-ES" timeStyle="twitter" /></span>}
                            <Delete onClick={(e) => { e.stopPropagation(); deleteNotification()}} />
                        </div>
                    </article>
                )
                    : isDeleted && (
                        <div className="container-undo" onClick={(e) => e.stopPropagation()}>
                            <span className="undo-txt">Notificación eliminada.</span>
                            <button onClick={undoDeleteNotification}>
                                <Replay fontSize="small" />
                                <span>Deshacer</span>
                            </button>
                        </div>
                    )
            }
        </div>
    )
}

export default Notification
