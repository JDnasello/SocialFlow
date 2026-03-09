import { useEffect, useRef, useState } from "react"
import Cards from "../components/Cards.jsx"
import Loader from "../components/Loader.jsx"
import { getUserPostsRequest } from "../services/posts.js"
import { clearUserPosts, getStateUserPosts } from "../redux/slices/postSlice.js"
import { useDispatch, useSelector } from "react-redux"

const UserPosts = ({ username, currentRoute, mode, socket, skipPosts, setHasMorePosts }) => {

    const [loadingUserPosts, setLoadingUserPosts] = useState(false)
    const dispatch = useDispatch()
    const { userPosts } = useSelector(state => state.posts)
    const previousUsername = useRef(username)

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (username !== previousUsername.current) {
                dispatch(clearUserPosts())
            }

            try {
                setLoadingUserPosts(true)
                if (username) {
                    const result = await getUserPostsRequest(username, skipPosts)
                    if (result.posts.length === 0) {
                        setHasMorePosts(false)
                    } else {
                        dispatch(getStateUserPosts(result.posts))
                    }
                } else {
                    throw new Error('No se encontró el perfil del usuario.')
                }
            } catch (error) {
                console.error(error)
                setLoadingUserPosts(false)
            } finally {
                setLoadingUserPosts(false)
            }
            
            previousUsername.current = username
        }
        fetchUserPosts()
    }, [username, dispatch, skipPosts, setHasMorePosts])

    return (
        <div>
            {
                !loadingUserPosts && userPosts.length === 0 ? <div>El usuario no tiene publicaciones aún</div>    
                : userPosts.length > 0 && userPosts.map(post => (
                    <div className="container-post" key={post._id}>
                        <Cards post={post} userProfile={username} key={post._id} currentRoute={currentRoute} mode={mode} socket={socket} />
                    </div>
                ))
            }
            {loadingUserPosts && <Loader />}
        </div>
    )
}

export default UserPosts
