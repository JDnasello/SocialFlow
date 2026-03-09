import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import ReactTimeAgo from 'react-time-ago'
import { Comment, Delete, Favorite, FavoriteBorder } from '@mui/icons-material'
import { useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import ConfirmationCard from './ConfirmationCard'
import { PostContext } from '../context/Context'
import RenderMedia from './RenderMedia'

const CommentCard = ({ post, comment, user, mode, socket, isInProfilePath }) => {

    const { deleteComment } = useContext(PostContext)
    const sessionUserId = useSelector(state => state.registerUser.id)
    const navigate = useNavigate()
    const [showConfirmationCard, setShowConfirmationCard] = useState(false)

    const handleCancelConfirmation = () => {
        setShowConfirmationCard(false)
    }
    
    const handleConfirm = () => {
        deleteComment(comment._id)
        setShowConfirmationCard(false)
    }

    const handleLikeClick = async e => {
        e.stopPropagation()
        try {
            socket.emit('likeComment', ({ postId: post._id, commentId: comment._id, userId: sessionUserId }))
        } catch (error) {
            console.error(error)
        }
    }

    const handleRemoveLikeClick = async e => {
        e.stopPropagation()
        try {
            socket.emit('removeCommentLike', ({ commentId: comment._id, userId: sessionUserId }))
        } catch (error) {
            console.error(error)
        }
    } 
    
    return (
        <>
            {showConfirmationCard && <ConfirmationCard
                onCancel={handleCancelConfirmation}
                onConfirm={handleConfirm}
                titleConfirmation={'¿Desea borrar este comentario?'}
                descriptionConfirmation={'Si lo elimina, el comentario no volverá a mostrarse en la publicación.'} />}
            
            <article className='user-post' onClick={() => navigate(`/home/comment/${comment._id}`)}>
                <div className='container-post-profile-photo'>
                    {
                        user?.profilePhoto && user.provider === 'local' ?
                            <Link to={`/profile/${user.username}`}>
                                <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                            </Link>
                                : user?.profilePhoto && user.provider === 'google' ?
                                    <Link to={`/profile/${user?.username}`}>
                                        <img src={user.profilePhoto} alt="Foto de perfil" />
                                    </Link>
                                
                                    : <Link to={`/profile/${user?.username}`}>
                                        <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                    </Link>
                    }
                </div>
                <div className="post-content">
                    <div className="user-data comment-data">
                        <div className="user">
                            <span>{user?.name}</span>
                            {!isInProfilePath && post.user._id === user?._id && <span className='user-author'>Autor</span>}
                        </div>
                        <div className="username-postdate">
                            <span className="username">@{user?.username}</span>
                            <span>-</span>
                            {
                                comment?.createdAt && (
                                    <span className="created-at">
                                        <ReactTimeAgo date={new Date(comment.createdAt)} locale='es-ES' />
                                    </span>
                                )
                            }
                        </div>
                    </div>
                    <div className="post-text">
                        <p>{comment?.commentText}</p>
                        {
                            comment?.media.length > 0 &&
                                <RenderMedia
                                    post={comment}
                                    currentRoute={location.pathname}
                                    type='comment'
                                    />
                        }
                    </div>
                    <div className="interactions">
                        <div>
                            {
                                comment.likes.includes(sessionUserId) ? (
                                    <Favorite className={`like-icon ${comment.likes.includes(sessionUserId) ? 'clicked' : ''}`} onClick={handleRemoveLikeClick} />
                                )
                                : (
                                    <FavoriteBorder className={`unlike-icon ${!comment.likes.includes(sessionUserId) ? 'clicked' : ''}`} onClick={handleLikeClick} />
                                )
                            }
                            <span style={{ color: `${!mode ? '#333' : '#c5c5c5d3'}`, fontSize: '.8em', marginLeft: 2 }}>{comment.likes.length}</span>
                        </div>
                        <div>
                            <Comment className='comment-icon' />
                            <span style={{ color: `${!mode ? '#333' : '#c5c5c5d3'}`, fontSize: '.8em', marginLeft: 2 }}>{comment.total}</span>
                        </div>
                        {
                            sessionUserId === user?._id && (
                                <>
                                    <Delete className='delete-icon' onClick={(e) => { e.stopPropagation(); setShowConfirmationCard(true) }} />
                                </>
                            )
                        }
                    </div>
                </div>
                
            </article>
        </>
    )
}

export default CommentCard
