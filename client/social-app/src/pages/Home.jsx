import { useLocation } from 'react-router-dom'
import HomeHeader from '../components/HomeHeader'
import PostCard from '../components/PostCard.jsx'
import Posts from '../components/Posts'
import '../css/home.css'
import RenderNotFound from '../components/RenderNotFound.jsx'
import { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PostContext } from '../context/Context.jsx'
import { removePostsByUserDeleted } from '../redux/slices/postSlice.js'
import { removeCommentsByUserDeleted } from '../redux/slices/commentSlice.js'

const Home = ({ mode, socket, setNavVisible, navVisible }) => {

    const { loadPosts, loadFollowingPosts } = useContext(PostContext)

    const location = useLocation()
    const isInHomePath = location.pathname !== '/home/following-posts'
    const notFound = location.state?.notFound
    const posts = useSelector(state => state.posts.posts)
    const followingPosts = useSelector(state => state.posts.followingPosts)
    const dispatch = useDispatch()
    const [showNotFound, setShowNotFound] = useState(notFound)
    const [skip, setSkip] = useState(0)
    const [searchActive, setSearchActive] = useState(false)
    const mainRef = useRef(null)
    let lastScroll = 0
    let scrollTimeout = useRef(null)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                
                if (isInHomePath) {
                    await loadPosts(skip)
                } else {
                    await loadFollowingPosts(skip)
                }
                
            } catch (error) {
                console.error(error)
            }
        }

        fetchPosts()
    }, [isInHomePath, skip])

    useEffect(() => {
        if (notFound) {
            const timeout = setTimeout(() => {
                setShowNotFound(false)
            }, 2000)

            return () => clearTimeout(timeout)
        }
    }, [notFound])

    const handleScroll = () => {
        const { offsetHeight, scrollTop, scrollHeight } = mainRef.current

        if (offsetHeight + scrollTop >= scrollHeight) {
            setSkip(isInHomePath ? posts.length : followingPosts.length)
        }
    }

    const handleScrollForNavBar = () => {
        const { scrollTop } = mainRef.current

        if (window.innerWidth < 768) {
            if (scrollTop > lastScroll) {
                setNavVisible(false)
            } else {
                setNavVisible(true)
            }
        }

        lastScroll = scrollTop


        if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
        scrollTimeout.current = setTimeout(() => {
            setNavVisible(true)
        }, 1000)
    }

    useEffect(() => {
        setNavVisible(true)
        const container = mainRef.current
        container.addEventListener('scroll', handleScrollForNavBar)

        return () => {
            container.removeEventListener('scroll', handleScrollForNavBar)
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
        }
    }, [])

    useEffect(() => {
        socket.on('deletePosts', ({ userId }) => {
            dispatch(removePostsByUserDeleted(userId))
        })
        socket.on('deleteComments', ({ userId }) => {
            dispatch(removeCommentsByUserDeleted(userId))
        })

        return () => {
            socket.off('deletePosts')
            socket.off('deleteComments')
        }
    }, [socket, dispatch])

    return (
        <main className={`container-home ${searchActive ? 'scroll-disabled' : ''}`} ref={mainRef} onScroll={handleScroll}>
            <HomeHeader isInHomePath={isInHomePath} mode={mode} setSearchActive={setSearchActive} searchActive={searchActive} navVisible={navVisible} />
            <div className='container-posts'>
                {
                    showNotFound && <RenderNotFound text='Comentario eliminado' />
                }
                <PostCard placeholder={'Dale vida a tus ideas!'} mode={mode} socket={socket} />
                <Posts
                    isInHomePath={isInHomePath}
                    mode={mode}
                    socket={socket}
                    posts={posts}
                    followingPosts={followingPosts} 
                    />
            </div>
        </main>
    )
}

export default Home
