import { useEffect, useRef, useState } from "react"
import { deleteAllNotificationsRequest, getNotificationsRequest } from "../services/notifications.js"
import Notification from "../components/Notification.jsx"
import { useDispatch, useSelector } from "react-redux"
import { deleteNotificationsByUserDeleted, getNotifications, removeAllNotifications, resetTotalNotifications } from "../redux/slices/notificationSlice.js"
import { ArrowBack } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import ConfirmationCard from "../components/ConfirmationCard.jsx"
import Loader from "../components/Loader.jsx"

const NotificationsPage = ({ socket, newNotifications, setNewNotifications }) => {

    const [loading, setLoading] = useState(false)
    const [skip, setSkip] = useState(0)
    const mainRef = useRef(null)

    const [showConfirmationCard, setShowConfirmationCard] = useState(false)
    const notifications = useSelector(state => state.notification.notifications)
    const user = useSelector(state => state.registerUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const getNotification = async () => {
            try {
                setLoading(true)
                const res = await getNotificationsRequest(skip)
                dispatch(getNotifications(res.notifications))
                
            } catch (error) {
                console.error(error)
                
            } finally {
                setLoading(false)
            }
        }
        getNotification()
    }, [dispatch, skip])

    useEffect(() => {
        socket.on('deleteNotifications', ({ userId }) => {
            dispatch(deleteNotificationsByUserDeleted(userId))
        })

        return () => socket.off('deleteNotifications')
    }, [socket, dispatch])

    const handleScroll = () => {
        const { offsetHeight, scrollTop, scrollHeight } = mainRef.current
            
        if (offsetHeight + scrollTop >= scrollHeight) {

            console.log('Current skip: ', skip, 'Total posts: ', notifications.length)
            
            setSkip(notifications.length)
        }
    }

    const loadNewNotifications = () => {
        if (newNotifications.length > 0) {
            dispatch(getNotifications(newNotifications))
            setNewNotifications([])
            socket.emit('resetTotalNotifications', { userId: user.id })
            dispatch(resetTotalNotifications())
        }
    }

    const handleCancelDelete = () => {
        setShowConfirmationCard(false)
    }

    const handleDeleteAll = () => {
        deleteAllNotificationsRequest()
        dispatch(removeAllNotifications())
        setShowConfirmationCard(false)
        navigate('/notifications')
    }

    return (
        <>
            <div className="container-home" ref={mainRef} onScroll={handleScroll}>
                <header className="header">
                    <ArrowBack className="close-icon" fontSize="large" onClick={() => navigate(-1)} />
                    <span>Notificaciones</span>
                </header>
                {newNotifications.length > 0 && (
                    <div className="container-info-btn">
                        <button className="info-btn" onClick={loadNewNotifications}>Tienes nuevas notificaciones</button>
                    </div>
                    )
                }
                {!loading && notifications.length > 1 && (
                    <div className="container-delete-all">
                        <button className="delete-all" onClick={() => setShowConfirmationCard(true)}>Borrar todo</button>
                    </div>
                    )
                }
                {notifications.length > 0 ?
                    notifications.map((n, i) => <Notification key={i} notification={n} />)
                    : !loading && (
                        <div className="empty-notifications">
                            <span>No hay nada por aquí, continua navegando tranquilamente :)</span>
                        </div>
                    )
                }
                {loading && <Loader />}
            </div>
            {showConfirmationCard && <ConfirmationCard
                onCancel={handleCancelDelete}
                onConfirm={handleDeleteAll}
                titleConfirmation='Desea eliminar todas las notificaciones?'
                />
            }
        </>
    )
}

export default NotificationsPage
