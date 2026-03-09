import { useContext, useEffect } from "react"
import { UserContext } from "../context/Context.jsx"
import { useSelector } from "react-redux"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { API_BASE_URL } from "../config.js"
import SearchHistory from "./SearchHistory.jsx"

const SearchUsersToChat = ({ sessionUser, searchValue, onUserClick }) => {

    const { searchUsers, pushHistory } = useContext(UserContext)
    const users = useSelector(state => state.registerUser.users)
    
    useEffect(() => {
        searchValue.length > 0 && searchUsers(searchValue)
    }, [searchValue])
    
    const results = users.filter(user => 
        user.name.includes(searchValue) || user.username.includes(searchValue)
    )


    const handleUserClick = async (user) => {
        onUserClick(user)
        let type = 'chat'
        try {
            await pushHistory(sessionUser.id, user._id, type)
        } catch (error) {
            console.error(error)
        }
    }


    return (
        <div className="container-search-chat">
            {
                searchValue.length === 0 ? <SearchHistory type='chat' onUserClick={onUserClick} />
                : searchValue.length > 0 && results.length === 0 ? (
                    <div className="search-empty">
                        <span>Pruebe con buscar por nombre de usuario, o incluso palabras clave.</span>
                    </div>
                ) : searchValue.length > 0 && results.length > 0 && (
                    results.map(user => (
                        <div key={user._id} className="container-chatuser-list" onClick={() => handleUserClick(user)}>
                            <div className="list-user-photo">
                                {
                                    user?.profilePhoto && user.provider === 'local' ? 
                                        <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                    
                                        : user.profilePhoto && user.provider === 'google' ?
                                            <img src={user.profilePhoto} alt="Foto de perfil" />

                                        : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                }
                            </div>
                            <div className="list-chat-content">
                                <div className="chat-name">
                                    <span>{user.name}</span>
                                </div>
                                <div className="chat-username">
                                    <span>{user.username}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default SearchUsersToChat
