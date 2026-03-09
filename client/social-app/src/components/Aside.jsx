import { useDispatch, useSelector } from 'react-redux'
import '../css/aside.css'
import logo from '../img/socialflow-biglogo.png'
import { Check } from '@mui/icons-material'
import { setColor, setFontSize } from '../redux/slices/preferenceSlice'

const Aside = ({ mode }) => {

    const { color, fontSize } = useSelector(state => state.preferences)
    const dispatch = useDispatch()

    const handleSelectColor = value => {
        dispatch(setColor(value))
    }

    const handleSelectCircle = value => {
        dispatch(setFontSize(value))
    }

    return (
        <aside className="container-aside">
            <div className='aside-system-preferences'>
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
            <div className="slider-and-copyright">
                <div className='aside-slider'>
                    <div className="slider-item">
                        <p className='slider-item-p'>Haz amigos</p>
                    </div>
                    <div className="slider-item">
                        <p className='slider-item-p' style={{ color: '#fff' }}>Comparte tus ideas</p>
                    </div>
                    <div className="slider-item">
                        <p className='slider-item-p'>Mantente actualizado</p>
                    </div>
                    <div className="slider-item">
                        <img src={logo} alt="" />
                        <p className='slider-item-p' style={{ color: '#fff' }}>Vive la experiencia de Social<span className='slider-item-span'>Flow</span></p>
                    </div>
                </div>
                <div className='aside-copyright'>
                    <p>&copy;<b>SocialFlow</b> todos los derechos reservados.</p>
                    <p>Desarrollado por Juan Diego Nasello.</p>
                </div>
            </div>
        </aside>
    )
}

export default Aside
