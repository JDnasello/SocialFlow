import { Check, Comment, Delete, Edit, Favorite, FavoriteBorder } from "@mui/icons-material"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import '../css/home.css'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { PostContext, UserContext } from '../context/Context.jsx'
import ConfirmationCard from './ConfirmationCard.jsx'
import EditPostCard from './EditPostCard.jsx'
import RenderMedia from './RenderMedia.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import ReactTimeAgo from 'react-time-ago'
import { setFollower } from "../redux/slices/registerSlice.js"
import { deleteNotificationRequest } from "../services/notifications.js"

const Cards = ({ socket, post, isInHomePath, isIndividualPostPath, currentRoute, mode }) => {
    
    const { followUser } = useContext(UserContext)
    const { deletePost } = useContext(PostContext)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const userSession = useSelector(state => state.registerUser)
    const { name, username, provider, profilePhoto } = post.user

    const [showConfirmationCard, setShowConfirmationCard] = useState(false)
    const [showEditCard, setShowEditCard] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [buttonState, setButtonState] = useState({
        buttonClicked: false,
        shrinkButton: false
    })
    
    useEffect(() => {
        if (post && userSession.userFollowing && userSession.userFollowing.includes(post.user._id) || userSession.id === post.user._id) {
            setIsFollowing(true)
        }
    }, [userSession.id, userSession.userFollowing, post.user._id])

    const handleFollow = (followId) => {
        setButtonState(prev => ({ ...prev, buttonClicked: true }))

        setTimeout(() => {
            setButtonState(prev => ({ ...prev, shrinkButton: true }))
        }, 400)
        setTimeout( async () => {
            await followUser(followId)
            dispatch(setFollower(followId))
            setIsFollowing(true)
        }, 700)
    }

    const handleLikeClick = async (e) => {
        e.stopPropagation()
        try {
            socket.emit('likePost', ({ postId: post._id, userId: userSession.id }))

            /*if (post.user._id !== userSession.id) {
                handleNotification('like', userSession, post, socket)
            }*/
        } catch (error) {
            console.error(error)
        }
    }

    const handleRemoveLikeClick = async (e) => {
        e.stopPropagation()
        try {
            socket.emit('removeLike', ({ postId: post._id, userId: userSession.id }))
        } catch (error) {
            console.error(error)
        } 
    }
    
    const handleCancelConfirmation = () => {
        setShowConfirmationCard(false)
    }

    const handleCancelEdit = () => {
        setShowEditCard(false)
    }

    const handleConfirm = async () => {
        if (isIndividualPostPath) {
            await deletePost(post._id)
            await deleteNotificationRequest(post._id)
            navigate('/home')
        } else {
            await deletePost(post._id)
            await deleteNotificationRequest(post._id)
        }
        setShowConfirmationCard(false)
    }

    return (
        <>
            {showConfirmationCard && <ConfirmationCard
                onCancel={handleCancelConfirmation}
                onConfirm={handleConfirm}
                titleConfirmation={'¿Desea borrar esta publicación?'}
                descriptionConfirmation={'Si la elimina, la publicación no volverá a estar visible en la plataforma.'} />}
            {showEditCard && <EditPostCard
                post={post}
                onCancel={handleCancelEdit}
                onSubmit={() => {setShowEditCard(false)}}
            />}

            <article className="user-post">
                <div className="container-post-profile-photo">
                    {
                        profilePhoto && provider === 'local' ?
                            <Link to={`/profile/${username}`}>
                                <img src={`${API_BASE_URL}/image/${profilePhoto}?type=avatar`} alt='Foto de perfil' />
                            </Link>

                        : profilePhoto && provider === 'google' ?
                            <Link to={`/profile/${username}`}>
                                <img src={profilePhoto} alt="Foto de perfil" />
                            </Link>
                            
                            : <Link to={`/profile/${username}`}>
                                <img src={DefaultProfilePhoto} alt='Foto de perfil' />
                            </Link>
                    }
                </div>
                <div className="post-content" onClick={() => navigate(`/home/post/${post._id}`)}>
                    <div className="user-content">
                        <div className="user-data">
                            <div className="user">
                                <span>{name}</span>
                            </div>
                            <div className="username-postdate">
                                <span className="username">@{username}</span>
                                <span>-</span>
                                <span className="created-at"><ReactTimeAgo date={new Date(post.createdAt)} locale='es-ES' timeStyle='twitter' /></span>
                            </div>
                        </div>
                        {
                            !isFollowing && (
                                <div className={`follow-btn in-postcard ${isFollowing ? 'isfollowing' : ''}`}>
                                    <button
                                        className={`${buttonState.buttonClicked ? 'clicked' : ''} ${buttonState.shrinkButton ? 'shrink' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleFollow(post.user._id) }}>
                                        {!buttonState.buttonClicked ? 'Seguir' : <Check />}
                                    </button>
                                </div>
                            )
                        }
                    </div>
                        <div className="post-text">
                            <p>{post.tweetText}</p>
                            {
                            post.media.length > 0 &&
                                <RenderMedia
                                    post={post}
                                    currentRoute={currentRoute}
                                    type='post'
                                    />
                            }
                        </div>
                        <div className="interactions">
                            <div>
                                {
                                    post.likes.includes(userSession.id) ? 
                                        <Favorite className={`like-icon ${post.likes.includes(userSession.id) ? 'clicked' : ''}`} onClick={handleRemoveLikeClick} />
                                        :
                                        <FavoriteBorder className={`unlike-icon ${!post.likes.includes(userSession.id) ? 'clicked' : ''}`} onClick={handleLikeClick} />
                                    
                                }
                                <span style={{ fontSize: '.8em', color: `${!mode ? '#333' : '#c5c5c5d3'}` }}>{post.likes.length}</span>
                            </div>
                            <div className={`${isIndividualPostPath && 'comment-icon-disabled'}`}>
                            <Comment className='comment-icon' />
                            <span style={{ fontSize: '.8em', color: `${!mode ? '#333' : '#c5c5c5d3'}`, marginLeft: 2 }}>{post.totalComments}</span>
                            </div>
                        {
                            username === userSession.username && (
                                <>
                                    <Edit className='edit-icon' onClick={(e) => { e.stopPropagation(); setShowEditCard(true) }} />
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

export default Cards
