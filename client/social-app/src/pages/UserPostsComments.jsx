import { useContext, useEffect } from "react"
import { PostContext } from "../context/Context.jsx"
import { getUserPostsCommentsRequest } from "../services/comments"
import { useDispatch, useSelector } from "react-redux"
import { getStateComments, updateCommentLikes } from "../redux/slices/commentSlice.js"
import CommentCard from "../components/CommentCard.jsx"
import { useLocation } from "react-router-dom"
import Loader from "../components/Loader.jsx"

const UserPostsComments = ({ username, mode, socket, skipComments, setHasMoreComments }) => {

    const { loading, setLoading } = useContext(PostContext)
    const dispatch = useDispatch()
    const location = useLocation()
    const isInProfilePath = location.pathname === `/profile/${username}/comments`
    const { comments } = useSelector(state => state.comments)

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true)
                if (username) {
                    const results = await getUserPostsCommentsRequest(username, skipComments)
                    if (results.comments.length === 0) {
                        setHasMoreComments(false)
                    } else {
                        dispatch(getStateComments(results.comments))
                    }
                }
            } catch (error) {
                console.error(error)
                setLoading(false)
            } finally {
                setLoading(false)
            }
        }

        fetchComments()
    }, [username, dispatch, skipComments])

    useEffect(() => {
        socket.on('likeCommentUpdated', ({ commentId, likes }) => {
            dispatch(updateCommentLikes({ commentId, likes }))
        })

        return () => socket.off('likeCommentUpdated')
    }, [socket, dispatch])

    return (
        <div>
            {
                comments.length > 0 ? comments.map(comment => (
                    <div className="container-post" key={comment._id}>
                        <CommentCard
                            post={comment.tweet}
                            comment={comment}
                            user={comment?.user}
                            mode={mode}
                            socket={socket}
                            isInProfilePath={isInProfilePath} />
                    </div>
                ))
                    : !loading && comments.length === 0 && <div>El usuario no tiene comentarios aun aún</div>  
            }
            {loading && <Loader />}
        </div>
    )
}

export default UserPostsComments
