import ReactDOM from 'react-dom'
import '../css/confirm.css'

const ConfirmationCard = ({ onCancel, onConfirm, titleConfirmation, descriptionConfirmation }) => {

    const card = (
        <div className='container-confirm'>
            <div className='container-confirm-text'>
                <h2 className='confirmation-h2'>{titleConfirmation}</h2>
                <p>{descriptionConfirmation}</p>
                <div className='confirm-btns'>
                    <button className='btn-delete' onClick={onConfirm}>Eliminar</button>
                    <button className='btn-cancel' onClick={onCancel}>Cancelar</button>
                </div>
            </div>
        </div>
    )

    return ReactDOM.createPortal(card, document.body)
}

export default ConfirmationCard
