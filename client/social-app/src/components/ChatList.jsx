import UsersChats from "./UsersChats.jsx"


const ChatList = ({ chats, handleCurrentChatClick }) => {
    return (
        <div className="chats-list">
            {
                chats && chats.length > 0 ? chats.map((chat, index) => (
                    <div key={index} onClick={() => handleCurrentChatClick(chat)}>
                        <UsersChats
                            chat={chat}
                            lastMessage={chat?.lastMessage}
                            lastFile={chat?.lastMessageFile}
                        />
                    </div>
                ))
                    : (
                        <div className="no-chats">
                            <span>No tienes chats aún, que esperas para comenzar a chatear?</span>
                        </div>
                    )
            }
        </div>
    )
}

export default ChatList
