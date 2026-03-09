import { useEffect, useState } from "react"
import { instance } from "../services/axios.js"
import { API_BASE_URL } from "../config.js"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { PhotoCamera } from "@mui/icons-material"

const UsersChats = ({ chat, lastMessage, lastFile }) => {

    const [user, setUser] = useState(null)

    const receiverId = chat?.userToChat?._id

    useEffect(() => {
        if (receiverId) {
            const getUser = async () => {
                try {
                    const response = await instance.get(`${API_BASE_URL}/user/${receiverId}`)
                    console.log(response.data)
                    
                    setUser(response.data)
                } catch (error) {
                    console.error(error)
                }
            }
            getUser()
        }
        
    }, [receiverId])

    if (!receiverId) {
        console.log('NO RECEIVER ID');
        
    }
    
    return (
        <div className="container-chatuser-list" tabIndex="0">
            <div className="list-user-photo">
                {
                    user?.profilePhoto && user.provider === 'local' ? 
                        <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt="Foto de perfil" />

                        : user?.profilePhoto && user.provider === 'google' ? 
                            <img src={user.profilePhoto} alt="Foto de perfil" />
                            
                        : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                }   
                { user?.online && (
                    <div className="container-online">
                        <div className="online-circle"></div>
                    </div>
                )}
            </div>
            <div className="list-chat-content">
                <div className="chat-name"> 
                    <span>{user?.name}</span>
                    {<span className={chat?.unreadMessagesCount > 0 ? 'unread-message-date' : 'message-date'}>{chat?.lastMessageDate?.split('T')[1].slice(0,5)}</span>}
                </div>
                <div className="last-message">
                    {
                        lastFile ? <span className={chat?.unreadMessagesCount > 0 ? 'unread-messages' : ''}><PhotoCamera className="camera-icon"/> Foto</span>
                            : lastMessage?.length < 25 ? 
                                <span className={chat?.unreadMessagesCount > 0 ? 'unread-messages' : ''}>{lastMessage}</span>
                                : <span className={chat?.unreadMessagesCount > 0 ? 'unread-messages' : ''}>{lastMessage?.slice(0, 24)}...</span>
                    }
                    {
                        chat?.unreadMessagesCount > 0 && (
                            <div className="unread-message-circle">
                                <span className="unread-message-number">{chat.unreadMessagesCount}</span>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default UsersChats
