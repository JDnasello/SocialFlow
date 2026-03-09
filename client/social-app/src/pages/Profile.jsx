import { Link, NavLink, Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom'
import '../css/profile.css'
import '../css/follows.css'
import { useDispatch, useSelector } from 'react-redux'
import { deleteFollow, deleteFollowByUserDeleted, deleteFollowersByUserDeleted, setFollower, setProfileUser } from '../redux/slices/registerSlice.js'
import { ArrowBack, Description, LocationOn } from '@mui/icons-material'
import { formattedDate } from '../utilities/functions.js'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { useContext, useEffect, useRef, useState } from 'react'
import { getUserByUsernameRequest } from '../services/users.js'
import EditProfile from '../components/EditProfile.jsx'
import { UserContext } from '../context/Context.jsx'
import { API_BASE_URL } from '../config.js'
import Followers from '../pages/Followers.jsx'
import Following from './Following.jsx'
import Likes from './Likes.jsx'
import UserPosts from './UserPosts.jsx'
import UserPostsComments from './UserPostsComments.jsx'

const Profile = ({ openFollows, setOpenFollows, mode, socket }) => {

  const { updateUser, followUser, unfollow, loading, setLoading } = useContext(UserContext)
  const { username } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sessionUserId = useSelector(state => state.registerUser.id)
  const profileUser = useSelector(state => state.registerUser.profileUser)
  const sessionUsername = useSelector(state => state.registerUser.username)
  const { posts, userPosts } = useSelector(state => state.posts)
  const { comments } = useSelector(state => state.comments)

  const [openEditProfile, setOpenEditProfile] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [changeWord, setChangeWord] = useState('Siguiendo')
  const [skipPosts, setSkipPosts] = useState(0)
  const [skipComments, setSkipComments] = useState(0)
  const [skipLikes, setSkipLikes] = useState(0)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [hasMoreLikes, setHasMoreLikes] = useState(true)
  const containerRef = useRef(null)


  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        if (username) {
          const data = await getUserByUsernameRequest(username)
          dispatch(setProfileUser(data))
          await updateUser(username, data)
          console.log(data)
          
          const isUserFollowing = data.followers.includes(sessionUserId)
          setIsFollowing(isUserFollowing)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error al hacer fetch en fetchUser():', error)
        setLoading(false)
      }
    }

    fetchUser()
  }, [dispatch, username, sessionUserId])

  useEffect(() => {
    socket.on('deleteFollows', ({ userId }) => {
      dispatch(deleteFollowByUserDeleted(userId))
      dispatch(deleteFollowersByUserDeleted(userId))
    })

    return () => socket.off('deleteFollows')
  }, [socket, dispatch])

  const handleScroll = () => {
    const { offsetHeight, scrollTop, scrollHeight } = containerRef.current
            
    if (offsetHeight + scrollTop >= scrollHeight) {
      location.pathname === `/profile/${username}` && hasMorePosts ? setSkipPosts(userPosts.length)
        : location.pathname === `/profile/${username}/comments` && hasMoreComments ? setSkipComments(comments.length)
          : location.pathname === `/profile/${username}/likes` && hasMoreLikes && setSkipLikes(posts.length)
    }
  }

  const closeEditProfile = () => {
    setOpenEditProfile(false)
  }

  const sendEditProfile = () => {
    setOpenEditProfile(false)
  }

  const handleFollow = async (followId) => {
    await followUser(followId)
    dispatch(setFollower(followId))
    setIsFollowing(true)
  }

  const handleUnfollow = async (followingId) => {
    await unfollow(followingId)
    dispatch(deleteFollow(followingId))
    setIsFollowing(false)
  }

  return (
    <div className='container-home' ref={containerRef} onScroll={handleScroll}>
      {
        !profileUser ? (
            <div>Loading...</div>
        )
          : (
          <>
          <header className='header'>
            {
              openFollows ? 
                    <ArrowBack className='close-icon' fontSize='large' onClick={() => { navigate(-1); setOpenFollows(false) }} />
                  :
                  <ArrowBack className='close-icon' fontSize='large' onClick={() => { navigate(-1); setOpenFollows(false) }} />
            }    
            <span>{profileUser.name}</span>
          </header>
              
              {
                openFollows && (
                  <>
                    <nav className='follows-nav'>
                      <NavLink to='followers'>Seguidores</NavLink>
                      <NavLink to='following'>Seguidos</NavLink>    
                    </nav>
                  <Routes>
                      <Route path='followers' element={<Followers mode={mode} username={username} setOpenFollows={setOpenFollows} />} />
                      <Route path='following' element={<Following mode={mode} username={username} setOpenFollows={setOpenFollows} />} />    
                  </Routes>
                  </>
                )
              }
            {
              !openFollows &&
                <div className='container-profile'>
                    {
                      !profileUser.backgroundPhoto ? (
                          <div className='container-background-without-img'>
                            <div className='profile-photo'>
                              {
                                profileUser.profilePhoto && profileUser.provider === 'local' ?
                                  <img src={`${API_BASE_URL}/image/${profileUser.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                
                                  : profileUser.profilePhoto && profileUser.provider === 'google' ?
                                    <img src={profileUser.profilePhoto} alt="Foto de perfil" />

                                    : <img src={DefaultProfilePhoto} alt='Foto de perfil' />
                                  }      
                            </div>
                          </div>
                      ) : (
                          <div className="container-background-img">
                            <div className='background-img'>
                              <img className='background' src={`${API_BASE_URL}/image/${profileUser.backgroundPhoto}?type=background`} alt="" />
                              <div className='container-profile-photo'>
                                <div className='profile-photo'>
                                  {
                                    profileUser.profilePhoto ? <img src={`${API_BASE_URL}/image/${profileUser.profilePhoto}?type=avatar`} alt="" />
                                    :
                                    <img className='avatar' src={DefaultProfilePhoto} alt='' />
                                  }  
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    }
                <div className='edit-profile'>
                  {profileUser.username === sessionUsername ?
                        <Link to={`/profile/${username}/settings`} onClick={() => setOpenEditProfile(true)}>
                          <button className='edit-profile-btn'>Editar perfil</button>
                        </Link>
                        : isFollowing ? (
                          <div className='container-following-btn following-btn'>
                              <button className={`${changeWord === 'Dejar de seguir' ? 'stop-following' : ''}`}
                                onMouseEnter={() => setChangeWord('Dejar de seguir')}
                                onMouseLeave={() => setChangeWord('Siguiendo')}
                                onClick={() => handleUnfollow(profileUser.id)}>
                                  {changeWord}
                              </button>
                          </div>
                          ) : (
                            <div className='container-follow-btn follow-btn'>
                              <button onClick={() => handleFollow(profileUser.id)}>Seguir</button>
                            </div>
                          )
                          
                  }    
                </div>
                <div className='container-profile-description'>
                  <div className='profile-name-username'>
                    <h3>{profileUser.name}</h3>
                    <span>@{profileUser.username}</span>
                  </div>
                      {
                        profileUser.biography && (
                          <div className='profile-biography'>
                            <p><Description fontSize='small' /> {profileUser.biography}</p>
                          </div>
                        )
                      }
                      {
                        profileUser.location && (
                          <div className="profile-location">
                            <p><LocationOn fontSize='small' /> {profileUser.location}</p>
                          </div> 
                        )
                      }
                  <div className='date-joined'>
                    <span>Se unió el {formattedDate(profileUser.createdAt)}</span>
                  </div>
                  <div className='container-followscounter'>
                      <Link to='followers' className='followers' onClick={() => setOpenFollows(true)}>
                            <span>{profileUser.followersCount}</span>
                            <span>{profileUser.followersCount === 1 ? 'Seguidor' : 'Seguidores'}</span>
                      </Link>

                      <Link to='following' className='following' onClick={() => setOpenFollows(true)}>
                            <span>{profileUser.followingCount}</span>
                            <span>{profileUser.followingCount === 1 ? 'Seguido' : 'Seguidos'}</span>
                      </Link>        
                  </div>
                </div>
                <nav className='content-bar'>
                  <div className='content-bar-link'>
                    <Link className={`${location.pathname === `/profile/${username}` ? 'active' : ''}`}
                    to={`/profile/${username}`}>
                      Publicaciones
                    </Link>
                    <div></div>
                  </div>
                  <div className='content-bar-link'>
                    <Link className={`${location.pathname === `/profile/${username}/comments` ? 'active' : ''}`}
                    to='comments'>
                      Comentarios
                    </Link>
                    <div></div>
                  </div>    
                  <div className='content-bar-link'>
                    <Link className={`${location.pathname === `/profile/${username}/likes` ? 'active' : ''}`}
                    to='likes'>
                      Me gusta
                    </Link>
                    <div></div>
                  </div>
                  </nav>
                </div>
              }
              {
                loading ? <div>Loading...</div>
                  : location.pathname === `/profile/${username}` &&
                  <UserPosts
                    username={profileUser.username}
                    currentRoute={location.pathname}
                    mode={mode}
                    socket={socket}
                    skipPosts={skipPosts}
                    setHasMorePosts={setHasMorePosts}
                  />
              }
              <Routes>
                <Route path='likes' element={<Likes username={profileUser.username} mode={mode} socket={socket} skipLikes={skipLikes} setHasMoreLikes={setHasMoreLikes} />} />
                <Route
                  path='comments'
                  element={
                    <UserPostsComments
                      username={profileUser.username}
                      mode={mode} socket={socket}
                      skipComments={skipComments}
                      setHasMoreComments={setHasMoreComments}
                    />}
                />
              </Routes>
        </>
      )
    }
    {openEditProfile && (<EditProfile onCancel={closeEditProfile} profileUser={profileUser} open={openEditProfile} onSendEditProfile={sendEditProfile} mode={mode} />)}        
    </div>
  )
}

export default Profile
