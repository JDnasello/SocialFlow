import { Close } from "@mui/icons-material"

const MessageDeleted = ({ setShowMessageDeleted }) => {
    return (
        <div className="container-message-deleted">
            <span>Mensaje eliminado</span>
            <Close onClick={() => setShowMessageDeleted(false)} />
        </div>
    )
}

export default MessageDeleted
