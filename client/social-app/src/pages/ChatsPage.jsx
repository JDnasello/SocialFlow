import { useDispatch, useSelector } from "react-redux"
import Chat from "../components/Chat.jsx"
import { instance, multipart } from '../services/axios.js'
import '../css/chats.css'
import { useEffect, useRef, useState } from "react"
import { API_BASE_URL } from "../config.js"
import { formattedDate } from "../utilities/functions.js"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { ArrowBack, Cancel, Close, InsertPhotoOutlined, KeyboardArrowDown, KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, Search, Send, TagFaces } from "@mui/icons-material"
import { Link } from "react-router-dom"
import EmojiPicker from "emoji-picker-react"
import { useHandleFile } from "../hooks/handleFiles.jsx"
import ChatList from "../components/ChatList.jsx"
import SearchUsersToChat from "../components/SearchUsersToChat.jsx"
import Loader from "../components/Loader.jsx"
import { updateTotalChatsNotifications } from "../redux/slices/notificationSlice.js"

const ChatsPage = ({ mode, socket }) => {
    
    const { handleFileChange, file, showPhoto, deleteObjectUrlFile } = useHandleFile()
    const dispatch = useDispatch()

    const sessionUser = useSelector(state => state.registerUser)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [skip, setSkip] = useState(0)
    const [searchActive, setSearchActive] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [msg, setMsg] = useState('')
    const [messages, setMessages] = useState([])
    const [localMessagesCount, setLocalMessagesCount] = useState([])
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const [chatVisible, setChatVisible] = useState(false)
    const [openH2, setOpenH2] = useState(false)
    const bodyScrollRef = useRef(null)
    const textareaRef = useRef(null)
    const timerRef = useRef(null)
    const [pickerVisible, setPickerVisible] = useState(false)
    const [iconVisible, setIconVisible] = useState(false)
    const [hideUserInfo, setHideUserInfo] = useState(false)
    const [showMessageDeleted, setShowMessageDeleted] = useState(false)
    const [showScrollDown, setShowScrollDown] = useState(false)
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

    useEffect(() => {
        socket.on('newChat', chat => {
            setChats(prevChats => {
                if (prevChats.some(c => c.chat._id === chat.chat._id)) {
                    return prevChats
                }

                return [chat, ...prevChats]
            })

            if (chat.autoOpen) {
                setCurrentChat(chat)
                setChatVisible(true)
            }
        })
            
        return () => socket.off('newChat')
    }, [socket, sessionUser.id])

    useEffect(() => {
        socket.on('getMessage', data => {

            setArrivalMessage({
                chatId: data.chatId,
                sender: data.senderId,
                message: data.message,
                file: data.file,
                provider: data.provider,
                profilePhoto: data.profilePhoto,
                createdAt: data.createdAt,
                lastMessage: data.lastMessage,
                lastMessageFile: data.lastMessageFile,
                lastMessageDate: data.lastMessageDate
            })

        })
        
        socket.on('updateUnreadMessages', ({ chatId, unreadMessagesCount }) => {
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat?.chat && chat.chat._id === chatId
                        ? { ...chat, unreadMessagesCount }
                        : chat
                )
            )
        })
        

        return () => {
            socket.off('getMessage')
            socket.off('updateUnreadMessages')
        }
    }, [socket])

    useEffect(() => {
        if (bodyScrollRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = bodyScrollRef.current
            const isBottom = scrollHeight - scrollTop === clientHeight 

            setIsScrolledToBottom(isBottom)
            
            if (arrivalMessage) {
                if (isBottom) {
                    setShowScrollDown(false)
                    setLocalMessagesCount([])
                    bodyScrollRef.current.scrollTop = scrollHeight
                } else {
                    setShowScrollDown(true)

                }
            }
        }
        
    }, [arrivalMessage])

    useEffect(() => {
        if (bodyScrollRef.current && !showScrollDown) {
            bodyScrollRef.current.scrollTop = bodyScrollRef.current.scrollHeight
            setLocalMessagesCount([])
        }
    }, [messages, showScrollDown])

    useEffect(() => {

        if (arrivalMessage) {
            setChats(prevChat => {
                const updatedChats = prevChat.map(chat =>
                    chat?.chat?._id === arrivalMessage.chatId ?
                        {
                            ...chat,
                            lastMessage: arrivalMessage.message,
                            lastMessageFile: arrivalMessage.file,
                            lastMessageDate: arrivalMessage.lastMessageDate
                        }
                        : chat
                )

                console.log(updatedChats);
                

                if (updatedChats) {
                    const chatToMove = updatedChats.find(chat => chat.chat._id === arrivalMessage.chatId)
                    const otherChats = updatedChats.filter(chat => chat.chat._id !== arrivalMessage.chatId)
    
                    return [chatToMove, ...otherChats]
                }
            })
            
            if (currentChat?.chat._id === arrivalMessage?.chatId) {
                setLocalMessagesCount(prev => [...prev, arrivalMessage])
            }
        }

        if (arrivalMessage && currentChat?.chat?._id === arrivalMessage.chatId) {
            setMessages(prevMessages => {
                const isDuplicated = prevMessages.some(msg => msg._id === arrivalMessage._id)
                if (isDuplicated) return prevMessages;
                return [...prevMessages, arrivalMessage]
            })


            socket.emit('markMessageAsRead', { chatId: currentChat?.chat?._id, userId: sessionUser.id })

            setChats(prevChats => prevChats.map(chat =>
                chat?.chat?._id === currentChat?.chat?._id
                    ? { ...chat, unreadMessagesCount: 0 }
                    : chat
            ))
        }
    }, [arrivalMessage, currentChat, socket, sessionUser.id])
    
    useEffect(() => {
        const getChats = async () => {
            try {
                const response = await instance.get(`${API_BASE_URL}/get-chat/${sessionUser.id}`)
                setChats(response.data.chats)
            } catch (error) {
                console.error(error)
            }
        }
        getChats()
    }, [sessionUser.id])

    useEffect(() => {
        socket.on('deleteChats', ({ userId }) => {
            
            setChats(prev => prev.filter(chat => !chat.chat.users.includes(userId)))
        })

        return () => socket.off('deleteChats')
    }, [socket, dispatch])

    const getMessages = async (skip) => {
        try {
            setLoading(true)

            const previousScrollHeight = bodyScrollRef.current.scrollHeight
            const previousScrollTop = bodyScrollRef.current.scrollTop
            
            const response = await instance.get(`${API_BASE_URL}/get-messages/${currentChat?.chat?._id}?skip=${skip}`)
            console.log(response.data)
            
            const formattedMessages = response.data.map(msg => ({
                ...msg,
                sender: msg.sender.senderId,
                provider: msg.sender.provider,
                profilePhoto: msg.sender.profilePhoto
            }))
            
            setMessages(prev => {
                const newMessages = formattedMessages.filter(newMsg =>
                    !prev.some(existingMsg => existingMsg._id === newMsg._id)
                )
                return newMessages.concat(prev)
            })
            
            if (formattedMessages.length < 20) {
                setHasMore(false)
            }
            
            setTimeout(() => {
                const newScrollHeight = bodyScrollRef.current.scrollHeight
                bodyScrollRef.current.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop
            }, 0)
            
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setArrivalMessage(null)
    }, [currentChat])

    useEffect(() => {
        if (currentChat?.chat) {
            setSkip(0)
            getMessages(0)
        }
    }, [currentChat])
    
    const handleScroll = () => {
        if (bodyScrollRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = bodyScrollRef.current
            const isBottom = scrollHeight - scrollTop === clientHeight

            setIsScrolledToBottom(isBottom)
    
            if (!isBottom) {
                setTimeout(() => {
                    setShowScrollDown(true)
                }, 200)
            } else {
                setTimeout(() => {
                    setShowScrollDown(false)
                }, 200)
                setLocalMessagesCount([])
            }
        }

        if (bodyScrollRef.current.scrollTop === 0 && hasMore) {

            setSkip(prev => {
                const newSkip = prev + 20
                getMessages(newSkip)
                return newSkip
            })
        }
    }

    const scrollToBottom = () => {
        if (bodyScrollRef.current) {
            bodyScrollRef.current.scrollTop = bodyScrollRef.current.scrollHeight
            setTimeout(() => {
                setShowScrollDown(false)
            }, 200)
            setIsScrolledToBottom(true)
            setLocalMessagesCount([])
        }
    }

    useEffect(() => {
            timerRef.current = setTimeout(() => {
                setOpenH2(true)
            }, 1000)
    
            return () => clearTimeout(timerRef.current)
    }, [])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea !== null) {
            textarea.style.height = '10px'
            textarea.style.height = (textarea.scrollHeight) + 'px'
        }
    }, [msg])

    const handleInputChange = (e) => {
        setSearchValue(e.target.value)
        
    }

    const clearSearchInput = () => {
        setSearchValue('')
        setSearchActive(false)
    }

    const closeSearch = () => {
        if (searchActive) {
            setSearchActive(false)
            setSearchValue('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!msg && !file) return;
        
        setShowScrollDown(false)

        if (bodyScrollRef.current) bodyScrollRef.current.scrollTop = bodyScrollRef.current.scrollHeight

        const receiverId = currentChat?.chat ? currentChat?.chat.users.find(receiver => receiver !== sessionUser.id)
            : currentChat?.userToChat?._id

        if (!receiverId) {
            console.error('No receiver ID in handleSubmit')
            return;
        }
        
        const formData = new FormData()
        formData.append('message', msg)
        formData.append('sender', sessionUser.id)
        formData.append('receiver', receiverId)
        if (file) {
            formData.append('file', file)
        }

        try {
            const response = await multipart.post(`${API_BASE_URL}/add-message`, formData)
            console.log(response)
            const { chat, savedMessage } = response.data

            if (!currentChat.chat) {
                setCurrentChat({
                    chat,
                    userToChat: {
                        _id: receiverId,
                        name: currentChat?.userToChat?.name,
                        username: currentChat?.userToChat?.username,
                        provider: currentChat?.userToChat?.provider,
                        profilePhoto: currentChat?.userToChat?.profilePhoto,
                        createdAt: currentChat?.userToChat?.createdAt,
                        receiverFollowers: currentChat?.userToChat?.receiverFollowers
                    }
                })
                setChatVisible(true)
            }

            setMessages(prevMessages => [...prevMessages, savedMessage])

            
            console.log(currentChat)

            setChats(prevChats => {
                const existingChatIndex = prevChats.findIndex(c => c?.chat?._id === chat._id)

                if (existingChatIndex !== -1) {
                    const updatedChats = [...prevChats]

                    updatedChats[existingChatIndex] = {
                        ...updatedChats[existingChatIndex],
                        lastMessage: savedMessage.message,
                        lastMessageFile: savedMessage.file,
                        lastMessageDate: savedMessage.createdAt
                    }

                    return updatedChats
                }

                return [chat, ...prevChats]
            })
            
            if (currentChat.chat) setChatVisible(true)

            socket.emit('sendMessage', {
                chatId: chat?._id,
                senderId: sessionUser.id,
                receiverId,
                message: msg,
                file: file,
                createdAt: new Date().toISOString()
            })
        
    } catch (error) {
        console.error(error)
    }
        setMsg('')
        deleteObjectUrlFile()
    }

    useEffect(() => {
        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId))
        })

        socket.on('getLastMessageAfterDelete', data => {
            console.log(data)
            setChats(prevChats =>
                prevChats.map(c =>
                c.chat._id === data.chatId
                    ? {
                        ...c,
                        lastMessage: data.lastMessage,
                        lastMessageDate: data.lastMessageDate,
                        lastMessageFile: data.lastMessageFile
                    }
                    : c
            ))
        })

        return () => {
            socket.off('messageDeleted')
            socket.off('getLastMessageAfterDelete')
        }
    }, [socket])

    useEffect(() => {
        socket.on('messageUpdated', data => {
            setMessages(prevMessages => prevMessages.map(msg => 
                msg._id === data.messageId ?
                    {
                        ...msg,
                        message: data.updatedMessage,
                        isEdited: data.edited
                    }
                    : msg
            ))
        })

        socket.on('getLastMessageAfterUpdate', data => {
            setChats(prevChats => prevChats.map(c => 
                c.chat._id === data.chatId
                    ? {
                        ...c,
                        lastMessage: data.lastMessage,
                        lastMessageDate: data.lastMessageDate
                    }
                    : c
            ))
        })

        return () => {
            socket.off('messageUpdated')
            socket.off('getLastMessageAfterUpdate')
        }
    }, [socket])

    useEffect(() => {
        let timeout
        if (showMessageDeleted) {
            timeout = setTimeout(() => {
                setShowMessageDeleted(false)
            }, 2500)
        }

        return () => clearTimeout(timeout)
    }, [showMessageDeleted])

    const handleUserClick = (user) => {
        
        const existingChat = chats.find(chat =>
            chat.chat?.users.includes(user._id) && chat.chat?.users.includes(sessionUser.id)
        )

        if (currentChat?.userToChat?._id === user._id) {
            console.log('Usuario ya seleccionado')
            return;
        }

        setMessages([])
        setSkip(0)
        setHasMore(true)

        setCurrentChat({
            userToChat: {
                _id: user._id,
                name: user.name,
                username: user.username,
                provider: user.provider,
                profilePhoto: user.profilePhoto,
                createdAt: user.createdAt,
                receiverFollowers: user.receiverFollowers
            },
            chat: existingChat ? existingChat.chat : null
        })
        
        socket.emit('setChatActive', { userId: sessionUser.id, chatId: existingChat?.chat?._id })
        setChatVisible(true)
        
    }

    const restartTimer = () => {
        clearTimeout(timerRef.current)
        setOpenH2(false)
        timerRef.current = setTimeout(() => {
            setOpenH2(true)
        }, 1000)
    }

    const handleEnterPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }
    
    const handleEscPress = e => {
        if (e.key === 'Escape') {
            setChatVisible(false)
            setCurrentChat(null)
        }
        restartTimer()
    }

    useEffect(() => {
        socket.on('messageSeen', ({ chatId, messageId }) => {
            if (currentChat && currentChat?.chat?._id === chatId) {
                setMessages(prevMessages => 
                    prevMessages.map(message => (
                        message._id === messageId 
                            ? { ...message, read: true }
                            : message
                    ))
                )
                
            }
        })
        
        return () => socket.off('messageSeen')
    }, [currentChat, socket])

    const handleCurrentChatClick = async (chat) => {

        if (currentChat?.chat?._id === chat.chat._id) return;
        setMessages([])
        setArrivalMessage(null)
        setSkip(0)
        setHasMore(true)

        setCurrentChat(chat)
        setChatVisible(true)
        
        try {

            socket.emit('setChatActive', { userId: sessionUser.id, chatId: chat.chat._id })

            socket.emit('markMessageAsRead', { chatId: chat.chat._id, userId: sessionUser.id })
    
            setChats(prevChats => prevChats.map(c => 
            c.chat._id === chat.chat._id
                ? { ...c, unreadMessagesCount: 0 }
                : c
            ))
    
            const { data } = await instance.put(`${API_BASE_URL}/read-messages/${chat.chat._id}`, { userId: sessionUser.id })

            dispatch(updateTotalChatsNotifications(data.unreadChatsCount))

        } catch (error) {
            console.error('Error open chat: ', error)
        }
    }

    const pickerClick = () => {
        setPickerVisible(!pickerVisible)
    }

    const handleEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji
        console.log(emoji)
        setMsg(prevMsg => prevMsg + emoji)
    }

    const handleHideInfoClick = () => {
        setHideUserInfo(!hideUserInfo)
        setIconVisible(true)
    }
    
    return (
        <div className="container-chats">
            <aside className={`chats-menu ${chatVisible ? 'menu-hidden' : ''}`} onClick={(e) => {e.key == 'Escape' && setSearchActive(false)}}>
                <header className="chats-header">
                <h2>Chats</h2>
                <div className="chats-header-search">
                    {window.innerWidth <= 1000 && searchActive && <ArrowBack className="close-icon" fontSize="large" onClick={() => setSearchActive(false)} />}
                    <div className={`container-search-input ${searchActive ? 'search-input-active' : ''}`}
                        onFocus={() => setSearchActive(true)}
                        onClick={(e) => { e.key == 'Escape' && setSearchActive(false) }}>
                        <label htmlFor='search'>
                            <Search fontSize='medium' style={{ fill: searchActive ? 'var(--color-preference)' : '#c5c5c53f'}} />
                        </label>
                        <input type="search" name="search" id="search" placeholder='Buscar'
                            value={searchValue.trim()} autoComplete='off' autoCorrect='off'
                            onChange={handleInputChange} />
                        {
                            searchValue && (
                                <div className='search-input-cancel-icon' onClick={clearSearchInput}>
                                    <Cancel />
                                </div>
                            )
                        }
                    </div>
                </div>    
            </header>
                {searchActive ? <SearchUsersToChat sessionUser={sessionUser} searchActive={searchActive} searchValue={searchValue} onUserClick={handleUserClick} />
                : <ChatList chats={chats} handleCurrentChatClick={handleCurrentChatClick} />
            }
            </aside>
            <div className="container-welcome" onClick={closeSearch}>
                {
                    currentChat && chatVisible ? (
                        <>
                            <div className="chat" onKeyDown={handleEscPress} tabIndex='0'>
                                <header className="header">
                                    {chatVisible &&
                                        <ArrowBack
                                            className={`close-icon ${chatVisible ? 'icon-visible' : ''}`}
                                            fontSize="large"
                                            onClick={() => { setChatVisible(false); setCurrentChat(null) }}
                                        />}
                                    <span>{currentChat?.userToChat?.name}</span>
                                </header>
                                <div className={`chat-user-info ${hideUserInfo ? 'hide-info' : ''}`}>
                                    <Link to={`/profile/${currentChat?.userToChat?.username}`} className={`chat-user-info-link ${hideUserInfo ? 'hide-info' : ''}`}>
                                        <div className={`chat-user-info-img ${hideUserInfo ? 'hide-info' : ''}`}>
                                            {
                                                currentChat?.userToChat?.profilePhoto && currentChat.userToChat.provider === 'local' ?
                                                    <img src={`${API_BASE_URL}/image/${currentChat?.userToChat?.profilePhoto}?type=avatar`} alt="Foto de perfil" />

                                                    : currentChat?.userToChat?.profilePhoto && currentChat.userToChat.provider === 'google' ?
                                                        <img src={currentChat.userToChat.profilePhoto} alt="Foto de perfil" />
                                                        
                                                        : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                            }
                                        </div>
                                        <div className={`userinfo-name-username ${hideUserInfo ? 'hide-info' : ''}`}>
                                            <span>{currentChat?.userToChat?.name || currentChat.name }</span>
                                            <span>@{currentChat?.userToChat?.username || currentChat.username}</span>
                                        </div>
                                        <div className={`userinfo-date-followers ${hideUserInfo ? 'hide-info' : ''}`}>
                                            <span>Se unió el {formattedDate(currentChat?.userToChat?.createdAt)}</span>
                                            <span>-</span>
                                            {
                                                currentChat?.receiverFollowers ?
                                                    <span>{currentChat?.receiverFollowers.length} {currentChat?.receiverFollowers.length === 1 ? 'Seguidor' : 'Seguidores'}</span>
                                                    : currentChat?.userToChat?.receiverFollowers &&
                                                    <span>{currentChat?.userToChat?.receiverFollowers.length} {currentChat?.userToChat?.receiverFollowers.length === 1 ? 'Seguidor' : 'Seguidores'}</span>
                                            }
                                        </div>
                                    </Link>
                                    <div
                                        className='userinfo-slide-icon'
                                        onMouseEnter={() => setIconVisible(true)}
                                        onMouseLeave={() => setIconVisible(false)}
                                        >
                                        {
                                            hideUserInfo ?
                                                <KeyboardDoubleArrowDown 
                                                    className={`${iconVisible ? 'visible' : ''}`}
                                                    onClick={handleHideInfoClick}
                                                    />
                                                :
                                                <KeyboardDoubleArrowUp
                                                    className={`${iconVisible ? 'visible' : ''}`}
                                                    onClick={handleHideInfoClick}
                                                    />
                                        }
                                    </div>
                                </div>
                                {
                                    currentChat.chat === null ? (
                                        <div className="chat-body"></div>
                                    )
                                        : (
                                            <div className="chat-body" ref={bodyScrollRef} onScroll={handleScroll}>
                                                {loading && <Loader />}
                                                {messages
                                                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                                    .map((message, index) => (
                                                    <div key={index}>
                                                        <Chat
                                                            socket={socket}
                                                            message={message}
                                                            sessionUser={sessionUser}
                                                            lastMessage={index === messages.length - 1}
                                                            receiverId={currentChat.userToChat._id}
                                                            setShowMessageDeleted={setShowMessageDeleted}
                                                            showMessageDeleted={showMessageDeleted}
                                                            bodyScrollRef={bodyScrollRef}
                                                            />
                                                    </div>
                                                ))    
                                                } 

                                                {showScrollDown && (
                                                    <>
                                                        { localMessagesCount.length > 0 && <div className="unread-arrow-down-count">
                                                            <span>{localMessagesCount.length}</span>
                                                        </div>}
                                                        <div className={`arrow-down-container ${isScrolledToBottom ? 'hide-arrow-down' : ''}`} onClick={scrollToBottom}>
                                                            <KeyboardArrowDown />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                }
                                <footer className="chat-footer">
                                    <div className="container-send-message">
                                        <div className="emojis-and-files">
                                            <TagFaces onClick={pickerClick} />
                                
                                                <label htmlFor="input-file">
                                                    <InsertPhotoOutlined />
                                                        <input accept='image/*,video/*'
                                                            type="file"
                                                            name="file"
                                                            id='input-file'
                                                            multiple
                                                            onChange={handleFileChange}
                                                            />  
                                                </label>    
                                            
                                        </div>
                                        <form  className='chat-form' onSubmit={handleSubmit}>
                                            <div className="input-message">
                                                {
                                                    showPhoto && (
                                                        <div className="container-message-photo">
                                                            <div>
                                                                <Close className="delete-file-icon" onClick={deleteObjectUrlFile} />
                                                            </div>
                                                            <img src={showPhoto} alt="Preview" className="send-message-photo" />
                                                        </div>
                                                    )
                                                }
                                                <textarea
                                                    ref={textareaRef}
                                                    value={msg}
                                                    onChange={e => setMsg(e.target.value)}
                                                    onKeyDown={handleEnterPress}
                                                />
                                            </div>
                                            <button className={`send-message ${msg.length === 0 ? 'disabled-send-message' : ''}`}>
                                                <Send fontSize="large" />
                                            </button>
                                        </form>
                                    </div>
                                    {
                                        pickerVisible && (
                                            <div className='container-emoji-picker'>
                                                <EmojiPicker width={'100%'} height={400}
                                                    theme='dark'
                                                    value={msg}
                                                    onEmojiClick={handleEmojiClick}
                                                    className={`${pickerVisible ? 'emoji-picker-active' : 'emoji-picker'}`}
                                                    />    
                                            </div>
                                        )
                                    }
                                </footer>
                            </div>
                        </>
                    ) : (
                            <div className="welcome-to-chats">
                                <div>
                                    <h1>
                                        Hola
                                        <span className="welcome-span">
                                            {sessionUser.name}
                                        </span>
                                    </h1>
                                    {openH2 &&
                                        <h2 ref={timerRef}>
                                            Bienvenido a chats de Social
                                            <span className="welcome-span">
                                                Flow
                                            </span>
                                        </h2>}
                                </div>
                            </div>
                        )
                }
            </div>
        </div>
    )
}

export default ChatsPage
