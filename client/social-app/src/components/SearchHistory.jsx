import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/Context.jsx"
import { useSelector } from "react-redux"
import { API_BASE_URL } from "../config.js"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { Close } from "@mui/icons-material"
import ConfirmationCard from "./ConfirmationCard.jsx"
import { useLocation, useNavigate } from "react-router-dom"

const SearchHistory = ({ type, onUserClick }) => {

    const { getHistory, deleteOneInHistory, deleteHistory, loading } = useContext(UserContext)
    const searchedUsers = useSelector(state => state.registerUser.searchHistory)
    const sessionUser = useSelector(state => state.registerUser.id)
    const [showConfirmationCard, setShowConfirmationCard] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const isInHomePath = location.pathname === '/home'
    const isInChatPath = location.pathname === '/chats'

    useEffect(() => {
        const fetchHistory = async () => {
            await getHistory(type)
        }
        fetchHistory()
    }, [])

    const handleDeleteOne = async (id, type) => {
        await deleteOneInHistory(id, type)
    }

    const handleDeleteAll = async (type) => {
        await deleteHistory(sessionUser, type)
        setShowConfirmationCard(false)
    }

    const navigateTo = (user) => {
        if (isInHomePath) {
            navigate(`/profile/${user.userData.username}`)
        } else if (isInChatPath) {
            const userObject = {
                _id: user.user,
                ...user.userData
            }
            onUserClick(userObject)
        }
    }

    return (
        <>
            <div className="container-history-chat">
                {loading ? <div>Loading...</div>
                        : searchedUsers.length === 0 ? (
                        <div className="search-empty">
                            <span>Tu historial de búsquedas está vacío</span>
                        </div>
                        )
                        : searchedUsers.length > 0 && (
                            <>
                                <button className="delete-history" onClick={() => setShowConfirmationCard(true)}>Borrar todo</button>
                                {
                                    searchedUsers
                                        .filter(user => user.user !== sessionUser)
                                        .map(user => (
                                        <div className="container-chatuser-list" key={user.user}>
                                            <div className="list-user-photo" onClick={() => navigateTo(user)}>
                                                {
                                                    user.userData?.profilePhoto && user.userData.provider === 'local' ?
                                                        <img src={`${API_BASE_URL}/image/${user.userData.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                                            
                                                            : user.userData?.profilePhoto && user.userData.provider === 'google' ?
                                                                <img src={user.userData.profilePhoto} alt="Foto de perfil" />

                                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                }
                                            </div>
                                            <div className="list-chat-content" onClick={() => navigateTo(user)}>
                                                <div className="chat-name">
                                                    <span>{user.userData?.name}</span>
                                                </div>
                                                <div className="chat-username">
                                                    <span>{user.userData?.username}</span>
                                                </div>
                                            </div>
                                            <div className="delete-user-in-history" onClick={() => handleDeleteOne(user.user, type)}>
                                                <Close />
                                            </div>
                                        </div>
                                    ))
                                
                                }
                            </>
                        )
            }
            </div>
            {showConfirmationCard && 
                <ConfirmationCard
                    onConfirm={() => handleDeleteAll(type)}
                    onCancel={() => setShowConfirmationCard(false)}
                    titleConfirmation={'Desea eliminar el historial de búsquedas?'}
                    />
            }
        </>
    )
}

export default SearchHistory
