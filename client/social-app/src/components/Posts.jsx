import { useContext, useEffect } from 'react'
import '../css/home.css'
import Cards from './Cards.jsx'
import { PostContext } from '../context/Context.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { updateLikes } from '../redux/slices/postSlice.js'
import Loader from './Loader.jsx'

const Posts = ({ isInHomePath, mode, socket, posts, followingPosts }) => {

    const { loading } = useContext(PostContext)
    const dispatch = useDispatch()
    const user = useSelector(state => state.registerUser)

    useEffect(() => {
        socket.on('likeUpdated', ({ postId, likes }) => {
            dispatch(updateLikes({ postId, likes}))
        })

        return () => socket.off('likeUpdated')
    }, [socket, dispatch])

    const renderPosts = () => {
        if (isInHomePath) {
            return posts && posts.length > 0 ? posts.map(post => (
                    <div className='container-post' key={post._id}>
                        <Cards socket={socket} post={post} isInHomePath={isInHomePath} currentRoute={location.pathname} mode={mode} />
                    </div>
                    ))
                    : !loading && posts.length === 0 && <span style={{ color: '#c5c5c5d3' }}>No hay publicaciones todavía</span>
        } else if (!loading && user.following.length === 0) {
            return <span>No sigues a nadie aún</span>
        } else if (!loading && user.following.length > 0 && followingPosts.length === 0) {
            return <span>Los usuarios que sigues no tienen publicaciones aún</span>
        } else {
            return followingPosts.map(post => (
                <div className='container-post' key={post._id}>
                    <Cards socket={socket} post={post} currentRoute={location.pathname} mode={mode} />
                </div>
            ))
        }
    }

    return (
        <>
            {renderPosts()}
            {loading && <Loader />}
        </>
        
    )
}

export default Posts
