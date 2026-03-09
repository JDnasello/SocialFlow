import { useContext, useEffect, useRef, useState } from "react"
import { PostContext } from "../context/Context.jsx"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ArrowBack, Delete, Favorite, FavoriteBorder } from "@mui/icons-material"
import PostCard from "../components/PostCard.jsx"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { API_BASE_URL } from "../config.js"
import ReactTimeAgo from "react-time-ago"
import RenderMedia from "../components/RenderMedia.jsx"
import ConfirmationCard from "../components/ConfirmationCard.jsx"
import CommentCard from "../components/CommentCard.jsx"
import { addReply, getStateReplies, removeComment, updateCommentLikes } from "../redux/slices/commentSlice.js"
import RenderNotFound from "../components/RenderNotFound.jsx"
import Loader from '../components/Loader.jsx'

const Comment = ({ mode, socket }) => {

    const { getComment, deleteComment, getReplies, loading } = useContext(PostContext)
    const dispatch = useDispatch()
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isCommentPath = location.pathname === `/home/comment/${id}`
    const notFound = location.state?.notFound
    const comment = useSelector(state => state.comments.comment)
    const replies = useSelector(state => state.comments.replies)
    const sessionUserId = useSelector(state => state.registerUser.id)
    const [showConfirmationCard, setShowConfirmationCard] = useState(false)
    const [showNotFound, setShowNotFound] = useState(notFound)
    const [skip, setSkip] = useState(0)

    const scrollRef = useRef(null)

    useEffect(() => {
        const fetchComment = async () => {
            await getComment(id)
        }
        fetchComment()
    }, [id])

    useEffect(() => {
        const fetchReplies = async () => {
            await getReplies(id, skip)
        }
        fetchReplies()
    }, [id, skip])

    useEffect(() => {
        socket.on('getReply', data => {
            if (data.parentComment === id) {
                dispatch(addReply(data.comment))
            }
            
        })
        
        return () => socket.off('getReply')
    }, [id, socket, dispatch])

    useEffect(() => {
        socket.on('likeCommentUpdated', ({ commentId, likes }) => {
            dispatch(updateCommentLikes({ commentId, likes }))
        })

        return () => socket.off('likeCommentUpdated')
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('deleteComment', ({ commentId }) => {
            dispatch(removeComment({ commentId }))
        })

        return () => socket.off('likeCommentUpdated')
    }, [socket, dispatch])

    useEffect(() => {
        if (notFound) {
            const timeout = setTimeout(() => {
                setShowNotFound(false)
            }, 2000)

            return () => clearTimeout(timeout)
        }
    }, [notFound])

    const handleScroll = () => {
        const { offsetHeight, scrollTop, scrollHeight } = scrollRef.current
            
        if (offsetHeight + scrollTop >= scrollHeight) {
            setSkip(replies.length)
        }
    }

    const handleCancelConfirmation = () => {
        setShowConfirmationCard(false)
    }
    
    const handleConfirm = () => {
        deleteComment(comment._id)
        setShowConfirmationCard(false)
        navigate(-1)
    }

    const handleLikeClick = async () => {
        try {
            socket.emit('likeComment', ({ commentId: comment._id, userId: sessionUserId}))
        } catch (error) {
            console.error(error)
        }
    }

    const handleRemoveLikeClick = async () => {
        try {
            socket.emit('removeCommentLike', ({ commentId: comment._id, userId: sessionUserId }))
        } catch (error) {
            console.error(error)
        }
    }
    
    return (
        <div className="container-home container-individual-post" ref={scrollRef} onScroll={handleScroll}>
            <div className="close-individual-post">
                <span className="close-icon" onClick={() => navigate(-1)}>
                    <ArrowBack />
                </span>
                <span>Post</span>
            </div>
            {
                comment &&
                <div className="container-post individual">
                    {showConfirmationCard && <ConfirmationCard
                        onCancel={handleCancelConfirmation}
                        onConfirm={handleConfirm}
                        titleConfirmation={'¿Desea borrar este comentario?'}
                        descriptionConfirmation={'Si lo elimina, el comentario no volverá a mostrarse en la publicación.'}
                        />}
                    <article className="user-post">
                        <div className='container-post-profile-photo'>
                            {
                                comment.user?.profilePhoto && comment.user.provider === 'local' ?
                                    <Link to={`/profile/${comment.user?.username}`}>
                                        <img src={`${API_BASE_URL}/image/${comment.user.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                    </Link>
                                        
                                        : comment.user?.profilePhoto && comment.user.provider === 'google' ?
                                            <Link to={`/profile/${comment.user?.username}`}>
                                                <img src={comment.user.profilePhoto} alt="Foto de perfil" />
                                            </Link>

                                            :
                                            <Link to={`/profile/${comment.user?.username}`}>
                                                <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                            </Link>
                            }
                        </div>
                    <div className="post-content">
                        <div className="user-data comment-data">
                            <div className="user">
                                <span>{comment.user?.name}</span>
                            </div>
                            <div className="username-postdate">
                                <span className="username">@{comment.user?.username}</span>
                                <span>-</span>
                                {
                                    comment.createdAt && (
                                        <span className="created-at">
                                            <ReactTimeAgo date={new Date(comment.createdAt)} locale='es-ES' />
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                        <div className="post-text">
                            <p>{comment.commentText}</p>
                            {
                                comment.media?.length > 0 && (
                                    <div className="container-post-media">
                                        <div className={`${comment.media.length === 3 ? 'post-media-3' : comment.media.length === 4 ? 'post-media-4' : 'post-media'}`}>
                                            <RenderMedia post={comment} type='comment' />
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                            <div className="interactions comment-interactions">
                                <div>
                                    {
                                        comment?.likes?.includes(sessionUserId) ? 
                                            <Favorite className={`like-icon ${comment?.likes?.includes(sessionUserId) ? 'clicked' : ''}`} onClick={handleRemoveLikeClick} />
                                                :
                                                <FavoriteBorder className={`unlike-icon ${!comment?.likes?.includes(sessionUserId) ? 'clicked' : ''}`} onClick={handleLikeClick} />
                                    }
                                    <span style={{ color: `${!mode ? '#333' : '#c5c5c5d3'}`, fontSize: '.8em', marginLeft: 2 }}>{comment?.likes?.length}</span>
                                </div>
                            {
                                sessionUserId === comment.user?._id && (
                                    <>
                                        <Delete className='delete-icon' onClick={() => setShowConfirmationCard(true)} />
                                    </>
                                )
                            }
                        </div>
                    </div>
                    </article>
                </div>
            }
            { notFound && <RenderNotFound text='Respuesta eliminada' />}
            <PostCard
                socket={socket}
                post={comment}
                parentComment={comment?._id}
                isCommentPath={isCommentPath}
                placeholder={`${sessionUserId === comment.user?._id ? 'Añade otro comentario' : `Respondele a ${comment.user?.username}`}`} />
            <div className="container-posts">
                {
                    replies.length === 0 ? <span>No hay respuestas</span>
                        : replies.length > 0 && replies.map((reply, index) => (
                            <div className="container-post" key={index}>
                                <CommentCard
                                    post={comment}
                                    comment={reply}
                                    user={reply.user}
                                    mode={mode}
                                    socket={socket}
                                    />
                            </div>
                            )
                        )
                }
                {loading && <Loader />}
            </div>
        </div>
    )
}

export default Comment
