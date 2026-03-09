import { Route, Routes, useLocation } from 'react-router-dom'
import StartPage from './pages/StartPage.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import NavBar from './components/NavBar.jsx'
import Profile from './pages/Profile.jsx'
import Logout from './pages/Logout.jsx'
import Posts from './components/Posts.jsx'
import ProtectedRoutes from './ProtectedRoutes.jsx'
import UserContextProvider from './context/UserContextProvider.jsx'
import PostContextProvider from './context/PostContextProvider.jsx'
import EditPostCard from './components/EditPostCard.jsx'
import EditProfile from './components/EditProfile.jsx'
import { useEffect, useState } from 'react'
import IndividualFile from './components/IndividualFile.jsx'
import IndividualPost from './pages/IndividualPost.jsx'
import ChatsPage from './pages/ChatsPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import Settings from './pages/Settings.jsx'
import { io } from 'socket.io-client'
import { HOST_URL } from './config.js'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './pages/Comment.jsx'
import { getNotifications, getTotalNotifications } from './redux/slices/notificationSlice.js'
import NotFound404 from './pages/NotFound404.jsx'
import { getColor, getFontSize, getMostWornOutColor, getPreferenceBarColor, getWornColor } from './utilities/systemPreferences.js'
import CompleteUser from './pages/CompleteUser.jsx'

function App() {
  
  const user = useSelector(state => state.registerUser)
  const { color, fontSize } = useSelector(state => state.preferences)
  const dispatch = useDispatch()
  const location = useLocation()
  const [newNotifications, setNewNotifications] = useState([])

  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme')
    return savedMode === 'true'
  })
  const [openFollows, setOpenFollows] = useState(false)
  const [socket, setSocket] = useState(null)
  const [navVisible, setNavVisible] = useState(true)

  useEffect(() => {
    if (!socket) {
      const newSocket = (io(HOST_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      }))

      setSocket(newSocket)
    }

  }, [socket])

  useEffect(() => {
    if (socket && user.id) {
      socket.emit('addUser', user.id)
      socket.on('getUsers', users => {
          console.log(users)
      })
    }
  }, [socket, user.id])
  
  useEffect(() => {
    if (socket) {
      socket.on('getNotification', ({ totalNotifications, ...data }) => {
        console.log('Received notification: ', data)
        
        location.pathname === '/notifications' ? setNewNotifications(prev => [...prev, data]) : dispatch(getNotifications(data))
      
        dispatch(getTotalNotifications(totalNotifications))
      })
      return () => socket.off('getNotification')
    }
  }, [socket, dispatch, location.pathname])

  useEffect(() => {
    location.pathname !== '/notifications' && setNewNotifications([])
  }, [location.pathname])

  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-preference', getColor(color))
    document.documentElement.style.setProperty('--color-preference-worn', getWornColor(color))
    document.documentElement.style.setProperty('--color-preference-most-worn-out', getMostWornOutColor(color))
    document.documentElement.style.setProperty('--color-preference-bar', getPreferenceBarColor(color))
  
  }, [color])

  useEffect(() => {
    const { h1, h2, h3, p, span } = getFontSize(fontSize)
    document.documentElement.style.setProperty('--font-size-h1', h1)
    document.documentElement.style.setProperty('--font-size-h2', h2)
    document.documentElement.style.setProperty('--font-size-h3', h3)
    document.documentElement.style.setProperty('--font-size-p', p)
    document.documentElement.style.setProperty('--font-size-span', span)
  }, [fontSize])

  return (
    <>
      <UserContextProvider>
      <PostContextProvider>

        <Routes>
          <Route path='/' element={<StartPage mode={mode} />}>
            <Route path='register' element={<Register mode={mode} />} />
            <Route path='login' element={<Login mode={mode} />} />
            <Route path='complete-user' element={<CompleteUser mode={mode} />} />  
          </Route>

          <Route element={<ProtectedRoutes />}>
              <Route element={
                <NavBar
                  setOpenFollows={setOpenFollows}
                  mode={mode}
                  setMode={setMode}
                  socket={socket}
                  navVisible={navVisible}
                />}>
                
              <Route path='/home/*' element={<Home mode={mode} socket={socket} setNavVisible={setNavVisible} navVisible={navVisible} />}>
                <Route index element={<Posts />} />
                <Route path=':id' element={<EditPostCard />} />
              </Route>
              <Route path='/profile/:username/*' element={<Profile openFollows={openFollows} setOpenFollows={setOpenFollows} mode={mode} socket={socket} />}>
                  <Route path='settings' element={<EditProfile />} />
              </Route>
                
                <Route path='/home/post/:id' element={<IndividualPost mode={mode} socket={socket} />} />
                <Route path='/home/comment/:id' element={<Comment mode={mode} socket={socket} />} />
                <Route path='/chats' element={<ChatsPage mode={mode} socket={socket} />} />
                <Route path='/notifications' element={<NotificationsPage socket={socket} newNotifications={newNotifications} setNewNotifications={setNewNotifications} />} />
                {window.innerWidth <= 1024 && <Route path='/settings' element={<Settings />} />}
              </Route>
              <Route path='/home/:id/post-media/:file' element={<IndividualFile mode={mode} />} />
              <Route path='/home/:id/comment-media/:file' element={<IndividualFile mode={mode} />} />
          </Route>

          <Route path='/logout' element={<Logout />} />
          <Route path='*' element={<NotFound404 mode={mode} />} />
        </Routes>

      </PostContextProvider>    
      </UserContextProvider>
    </>
  )
}

export default App
