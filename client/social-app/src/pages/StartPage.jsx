import { Outlet, useNavigate } from 'react-router-dom'
import '../css/reglog.css'
import logo from '../img/socialflow-biglogo.png'
import { GOOGLE_AUTH_URL } from '../config.js'
import GoogleIcon from '../components/GoogleIcon.jsx'

const StartPage = ({ mode }) => {

    const navigate = useNavigate()

    const handleSignUp = () => {
        navigate('register')
    }

    const handleSignIn = () => {
        navigate('login')
    }

    return (
        <>
            <div className={`container ${!mode ? 'light-mode' : ''}`}>
                <div className="container-reglog">
                    <div className='container-reglog-img'>
                        <img className='logo' src={logo} alt="" />
                    </div>
                    <div className='container-starting'>
                        <span className='title'>Fluye con las personas</span>
                        <div className='container-reglog-subtitle'>
                            <span className='subtitle'>Únete a la comunidad</span>
                        </div>
                        <div className='container-signup-in-btns'>
                            <a className='google-btn' href={GOOGLE_AUTH_URL}>
                                <GoogleIcon />
                                <span>Iniciar sesión con Google</span>
                            </a>
                            <div className='separating-line'>
                                <hr />
                                <p>O</p>
                                <hr />
                            </div>
                            <button className='btn-signup' onClick={handleSignUp}>Crear cuenta</button>
                            <div className='container-have-account'>
                                <span>¿Ya tienes una cuenta?</span>
                                <button className='btn-signin' onClick={handleSignIn}>Iniciar sesión</button>
                            </div>
                        </div>
                        <div className='all-rights-reserved'>
                            <p>&copy;<b>SocialFlow</b> | Todos los derechos reservados</p>
                        </div>
                    </div>
                </div>
                <Outlet />
            </div>
        </>
    )
}

export default StartPage
