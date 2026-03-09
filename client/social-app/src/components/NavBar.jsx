import logo from '../img/socialflow-biglogo.png'
import '../css/navbar.css'
import '../css/editProfile.css'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Person, LightMode, ArrowDropDown, DarkMode, Sms, Notifications, Settings } from '@mui/icons-material'
import { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { API_BASE_URL } from '../config'
import { getTotalChatsNotificationsRequest, getTotalNotificationsRequest } from '../services/notifications'
import { getTotalChatsNotifications, getTotalNotifications, removeNotification, resetTotalNotifications, updateTotalChatsNotifications } from '../redux/slices/notificationSlice'
import Aside from './Aside.jsx'
import { UserContext } from '../context/Context.jsx'
import ConfirmationCard from '../components/ConfirmationCard.jsx'

const NavBar = ({ mode, setMode, setOpenFollows, socket, navVisible }) => {

    const { deleteAccount } = useContext(UserContext)

    const user = useSelector(state => state.registerUser)
    const { totalNotifications, totalChatsNotifications } = useSelector(state => state.notification)
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()
    const [logoutActive, setLogoutActive] = useState(false)
    const [openConfirmationCard, setOpenConfirmationCard] = useState(false)
    const [iconActive, setIconActive] = useState('home')

    useEffect(() => {
        const savedIcon = sessionStorage.getItem('iconActive')
        if (savedIcon) {
            setIconActive(savedIcon)
        } 
    }, [])

    useEffect(() => {

        location.pathname.includes('/home') ? setIconActive('home')
            : location.pathname.includes(`/profile/${user.username}`) ? setIconActive('profile')
                : location.pathname === '/chats' ? setIconActive('chats')
                    : location.pathname === '/notifications' ? setIconActive('notifications')
                        : location.pathname === '/settings' && setIconActive('settings')

        sessionStorage.setItem('iconActive', iconActive)
    }, [location.pathname, iconActive])
    
    useEffect(() => {
        const getTotal = async () => {
            const res = await getTotalNotificationsRequest()
            dispatch(getTotalNotifications(res.totalNotifications))
        }
        getTotal()
    }, [dispatch])

    useEffect(() => {
        const getTotal = async () => {
            const res = await getTotalChatsNotificationsRequest(user.id)
            dispatch(getTotalChatsNotifications(res))
        }
        getTotal()
    }, [dispatch, user.id])

    useEffect(() => {
        socket.on('updateUnreadChats', ({ unreadChatsCount }) => {
            dispatch(updateTotalChatsNotifications(unreadChatsCount))
        })

        return () => socket.off('updateUnreadChats')
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('deleteNotification', data => {
            dispatch(removeNotification(data.commentId))
        })

        return () => socket.off('deleteNotification')
    }, [socket, dispatch])

    const toggleMode = () => setMode(!mode)

    const handleTotalNotifications = () => {
        setOpenFollows(false)
        socket.emit('resetTotalNotifications', { userId: user.id })
        dispatch(resetTotalNotifications())
    }
    
    const logout = () => {
        !logoutActive ? setLogoutActive(true) : setLogoutActive(false)
    }

    const handleConfirm = async () => {
        await deleteAccount()
        navigate('/')
    }

    const handleCancelConfirmation = () => {
        setOpenConfirmationCard(false)
    }

    return (
        <div className={`container-app ${!mode ? 'light-mode' : ''} ${location.pathname === '/chats' ? 'in-chats' : ''}`}>

        <div className={`container-navbar ${navVisible ? 'nav-visible' : 'nav-hidden'}`}>
            <div className='separate-header'></div>
            <div className='container-header'>
                <header>
                    <div className='logo'>
                        <div className='nav-link-icon'>
                            <img src={logo} alt="SocialFlow logo" />
                        </div>    
                    </div>
                    <nav>
                        
                        <Link className='container-nav-link' to='/home' onClick={() => setOpenFollows(false)}>
                            <div className='nav-link'>
                                <div className='nav-link-icon'>
                                    <Home className={`${iconActive === 'home' ? 'active' : ''}`} fontSize='large' />
                                </div>    
                                <span className='link-title'>Inicio</span>    
                            </div>    
                        </Link>
                        
                        <Link className='container-nav-link' to={`/profile/${user.username}`} onClick={() => setOpenFollows(false)}>
                            <div className="nav-link">
                                <div className="nav-link-icon">
                                    <Person className={`${iconActive === 'profile' ? 'active' : ''}`} fontSize='large' />
                                </div>
                                <span className='link-title'>Perfil</span>
                            </div>    
                        </Link>
                            
                        <Link className='container-nav-link' to='/chats' onClick={() => setOpenFollows(false)}>
                            <div className="nav-link">
                                <div className="nav-link-icon">
                                    <Sms className={`${iconActive === 'chats' ? 'active' : ''}`} fontSize='large' />
                                </div>
                                <span className='link-title'>Chats</span>
                            </div>  
                            {totalChatsNotifications > 0 && (
                                <div className="total-notifications">
                                    <span>{totalChatsNotifications}</span>
                                </div>
                            )}
                        </Link>
                            
                        <Link className='container-nav-link' to='/notifications' onClick={handleTotalNotifications}>
                            <div className="nav-link">
                                <div className="nav-link-icon">
                                    <Notifications className={`${iconActive === 'notifications' ? 'active' : ''}`} fontSize='large' />
                                </div>
                                <span className='link-title'>Notificaciones</span>
                            </div>    
                            {totalNotifications > 0 && (
                                <div className="total-notifications">
                                    <span>{totalNotifications}</span>
                                </div>
                            )}
                        </Link>
                        
                        <div className='container-nav-link'>
                            <div className="nav-link" onClick={toggleMode}>
                                <div className='nav-link-icon'>
                                    {
                                        !mode ? <LightMode fontSize='large' />
                                        : <DarkMode fontSize='large' />        
                                    }      
                                </div>
                                <span className='link-title'>Tema</span>    
                            </div>    
                        </div>

                        <Link className='container-nav-link nav-link-active' to='/settings' onClick={() => setOpenFollows(false)}>
                            <div className="nav-link">
                                <div className="nav-link-icon">
                                    <Settings className={`${iconActive === 'settings' ? 'active' : ''}`} fontSize='large' />
                                </div>
                                <span className='link-title'>Perfil</span>
                            </div>    
                        </Link>    
                    </nav>
                </header>
                {
                    logoutActive && (
                        <>
                            <div className='floating-logout'>
                                {window.innerWidth < 768 ?
                                    <Link to='/settings' className='logout-link'>Configuración</Link>
                                        : window.innerWidth >= 1024 && <div className='logout-link' onClick={() => setOpenConfirmationCard(true)}>Eliminar cuenta de SocialFlow</div>
                                }
                                <Link to='/logout' className='logout-link'>Cerrar sesión de @{user.username}</Link>
                            </div>
                            <ArrowDropDown fontSize='large' className='floating-logout-icon'/>
                        </>    
                        )
                }
                <div className='nav-link container-logout-link' onClick={logout}>
                    <div className='logout'>
                        {
                            user.profilePhoto && user.provider === 'google' ?
                                <img src={user.profilePhoto} alt='Foto de perfil' />
                                    
                                : user.profilePhoto && user.provider === 'local' ?
                                    <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt='Foto de perfil' />


                                    : <img src={DefaultProfilePhoto} alt='Foto de perfil'  />
                        }
                    </div>
                    <div className='logout-user'>
                        <span className='logout-user-name'>{user.name}</span>
                        <span className='logout-user-username'>@{user.username}</span>    
                    </div>    
                </div>    
            </div>    
        </div>
            <Outlet />
            {location.pathname !== '/chats' && <Aside />}

            {openConfirmationCard &&
                <ConfirmationCard
                onCancel={handleCancelConfirmation}
                onConfirm={handleConfirm}
                titleConfirmation='Desea eliminar su cuenta?'
                descriptionConfirmation='Al eliminar su cuenta, todos sus datos e información serán eliminados de manera permanente en la plataforma.'
                />}
        </div>
    )
}

export default NavBar
