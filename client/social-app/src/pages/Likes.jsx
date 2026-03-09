import { useContext, useEffect } from "react"
import { PostContext } from "../context/Context.jsx"
import { useDispatch, useSelector } from "react-redux"
import { getStateLikes, updateLikes } from "../redux/slices/postSlice.js"
import Cards from "../components/Cards.jsx"
import Loader from "../components/Loader.jsx"
import { getLikedPostsRequest } from "../services/posts.js"

const Likes = ({ username, mode, socket, skipLikes, setHasMoreLikes }) => {

    const { loading, setLoading } = useContext(PostContext)
    const dispatch = useDispatch()
    const { likes } = useSelector(state => state.posts)

    useEffect(() => {
        const fetchLikedPosts = async () => {
        try {
            setLoading(true)
            if (username) {
                const results = await getLikedPostsRequest(username, skipLikes)
                if (results.posts.length === 0) {
                    setHasMoreLikes(false)
                } else {
                    dispatch(getStateLikes(results.posts))
                }
            } else {
                throw new Error('No se encontró el perfil del usuario')
            }
            } catch (error) {
            console.error(error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
        }
        fetchLikedPosts()
    }, [username, dispatch, skipLikes])

    useEffect(() => {
        socket.on('likeUpdated', ({ postId, likes }) => {
            dispatch(updateLikes({ postId, likes}))
        })

        return () => socket.off('likeUpdated')
    }, [socket, dispatch])

    return (
        <div>
            {
                likes.length > 0 ? likes.map(post => (
                    <div className="container-post" key={post._id}>
                        <Cards post={post} userProfile={username} key={post._id} mode={mode} socket={socket} />
                    </div>
                ))
                    : !loading && likes.length === 0 && <div>El usuario no tiene likes aún</div>  
            }
            {loading && <Loader />}
        </div>
    )
}

export default Likes
