import { ArrowBack, Check } from "@mui/icons-material"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setColor, setFontSize } from "../redux/slices/preferenceSlice.js"
import '../css/settings.css'
import { useContext, useState } from "react"
import { UserContext } from "../context/Context.jsx"
import ConfirmationCard from '../components/ConfirmationCard.jsx'

const Settings = () => {

    const { deleteAccount } = useContext(UserContext)
    const navigate = useNavigate()

    const { color, fontSize } = useSelector(state => state.preferences)
    const dispatch = useDispatch()

    const [openConfirmationCard, setOpenConfirmationCard] = useState(false)

    const handleSelectColor = value => {
        dispatch(setColor(value))
    }

    const handleSelectCircle = value => {
        dispatch(setFontSize(value))
    }

    const handleConfirmationCard = async () => {
        await deleteAccount()
        setOpenConfirmationCard(false)
    }

    const closeConfirmationCard = () => {
        setOpenConfirmationCard(false)
    }

    return (
        <div className="container-home">
            <header className="header">
                <ArrowBack className="close-icon" fontSize="large" onClick={() => navigate(-1)} />
                <span>Configuración</span>
            </header>
            
            <div className="aside-system-preferences">
                <div className='preference-box'>
                    <h3>Preferencias del sistema</h3>
                </div>
                    <div className='preference-box'>
                        <h3>Color</h3>
                        <div className='preference-color'>
                            {[...Array(4)].map((_, index) => (
                                <div className="color-div" key={index} onClick={() => handleSelectColor(index)}>
                                    <label className='color-label' htmlFor="">
                                        {color === index && <Check fontSize='small' style={{ color: '#fff' }} />}
                                        <input type="checkbox" name="" id="" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='preference-box'>
                        <h3>Tamaño de la fuente</h3>
                        <div className="preference-font">
                            <span className='font-small'>Aa</span>
                            <div className="preference-font-bar">
                                {[...Array(5)].map((_, index) => (
                                    <div
                                        className={`bar-segment ${index === 0 ? 'small-segment' : ''} 
                                        ${index <= fontSize ? 'active-segment' : ''}`} key={index}>
                                        <div
                                            className={`bar-circle ${index === fontSize ? 'circle-big' : ''} ${index <= fontSize ? 'active-circle' : ''}`}
                                            onClick={() => handleSelectCircle(index)}>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <span className='font-big'>Aa</span>
                        </div>
                    </div>
            </div>
            <div className="delete-account" onClick={() => setOpenConfirmationCard(true)}>
                <span>Eliminar cuenta de SocialFlow</span>
            </div>

            {openConfirmationCard &&
                <ConfirmationCard
                onCancel={closeConfirmationCard}
                onConfirm={handleConfirmationCard}
                titleConfirmation='Desea eliminar su cuenta?'
                descriptionConfirmation='Al eliminar su cuenta, todos sus datos e información serán eliminados de manera permanente en la plataforma.'
                />}
        </div>
    )
}

export default Settings
