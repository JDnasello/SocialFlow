import { Close } from "@mui/icons-material"
import { API_BASE_URL } from "../config.js"
import '../css/chatFile.css'

const ChatFile = ({ file, message, setOpenFile }) => {
    return (
        <div className="container-chat-file">
            <header className="chat-file-header">
                <Close className="close-individual-file" fontSize="large" onClick={() => setOpenFile(false)} />
            </header>
            <div className="chat-file">
                <img src={`${API_BASE_URL}/get-message/file/${file}`} alt="" />
                {message && <p>{message}</p>}
            </div>
            <div className="chat-file-div-empty"></div>
        </div>
    )
}

export default ChatFile
