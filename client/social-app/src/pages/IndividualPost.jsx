import { useContext, useEffect, useRef, useState } from "react"
import { PostContext } from "../context/Context"
import { useDispatch, useSelector } from "react-redux"
import Cards from "../components/Cards"
import { Link, useLocation, useParams } from "react-router-dom"
import { ArrowBack } from "@mui/icons-material"
import '../css/individualPost.css'
import PostCard from "../components/PostCard.jsx"
import CommentCard from "../components/CommentCard.jsx"
import { updateLikes } from "../redux/slices/postSlice.js"
import { addComment, removeComment, updateCommentLikes } from "../redux/slices/commentSlice.js"
import RenderNotFound from "../components/RenderNotFound.jsx"
import Loader from '../components/Loader.jsx'

const IndividualPost = ({ mode, socket }) => {

    const { id } = useParams()
    const location = useLocation()
    const isIndividualPostPath = location.pathname === `/home/post/${id}`
    const notFound = location.state?.notFound

    const { loadPost, getComments, loading } = useContext(PostContext)
    const dispatch = useDispatch()
    const onePost = useSelector(state => state.posts.onePost)
    const comments = useSelector(state => state.comments.comments)

    const [skip, setSkip] = useState(0)
    const scrollRef = useRef(null)

    useEffect(() => {
        const fetchPost = async () => {
            await loadPost(id)
        }

        fetchPost()
    }, [id])

    useEffect(() => {
        const fetchComments = async () => {
            await getComments(id, skip)
        }

        fetchComments()
    }, [id, skip])

    useEffect(() => {
        socket.on('likeUpdated', ({ postId, likes }) => {
            dispatch(updateLikes({ postId, likes }))
        })
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('getComment', data => {
            if (data.postId === id) {
                dispatch(addComment(data.comment))
            }
        })
        return () => {
            socket.off('getComment')
        }
    }, [id, socket, dispatch])

    useEffect(() => {
        socket.on('likeCommentUpdated', ({ commentId, likes }) => {
            dispatch(updateCommentLikes({ commentId, likes }))
        })
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('deleteComment', ({ commentId }) => {
            dispatch(removeComment({ commentId }))
        })
    }, [socket, dispatch])

    const handleScroll = () => {
        const { offsetHeight, scrollTop, scrollHeight } = scrollRef.current
            
        if (offsetHeight + scrollTop >= scrollHeight) {
            setSkip(comments.length)
        }
    }

    if (!onePost.user) {
        return <div>Loading...</div>
    }

    return (
        <div className="container-home container-individual-post" ref={scrollRef} onScroll={handleScroll}>
            <div className="close-individual-post">
                <Link className="close-icon" to='/home'>
                    <ArrowBack />
                </Link>
                <span>Post</span>
            </div>
            {
                onePost &&
                <div className="container-post individual">
                    <Cards socket={socket} post={onePost} isIndividualPostPath={isIndividualPostPath} currentRoute={location.pathname} mode={mode} />
                </div>
            }
            { notFound && <RenderNotFound text='Respuesta eliminada' />}
            <PostCard socket={socket} post={onePost} isIndividualPostPath={isIndividualPostPath} placeholder={'Haz un comentario...'} />
            <div className="container-posts">
                {
                    comments && comments.length > 0 ? comments.map((comment, index) => (
                        <div className="container-post" key={index}>
                            <CommentCard
                                post={onePost}
                                comment={comment}
                                user={comment?.user}
                                mode={mode}
                                socket={socket}
                                />
                        </div>
                    ))
                        : <span>No hay comentarios</span>
                }
                { loading && <Loader />}
            </div>
        </div>
    )
}

export default IndividualPost
