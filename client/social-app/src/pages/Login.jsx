import { Link, useNavigate } from 'react-router-dom'
import { Close, Visibility, VisibilityOff } from '@mui/icons-material'
import logo from '../img/socialflow-biglogo.png'
import '../css/reglog.css'
import { useForm } from 'react-hook-form'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/Context.jsx'
import { GOOGLE_AUTH_URL } from '../config.js'
import GoogleIcon from '../components/GoogleIcon.jsx'

const Login = ({ mode, setOpenFormSignIn }) => {

    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm()
    const { signIn, errors: loginErrors, isAuthenticated } = useContext(UserContext)

    const [visiblePass, setVisiblePass] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    },[isAuthenticated, navigate])
    
    const submit = handleSubmit (async (values) => {
        signIn(values)   
    })

    const handleNavigation = () => {
        navigate('/')
    }

    return (
        <div className="container-fixed">
            <div className="form-mask"></div>
            <div className={`register-login-overlay ${!mode ? 'light-mode' : ''}`}>
                <div className="register-login-container">
                    <div className='head'>
                        <div className='left'>
                            <div onClick={handleNavigation}>
                                <Close fontSize='medium' />
                            </div>
                        </div>
                        <div>
                            <img className='form-reglog-logo' src={logo} alt="" />
                        </div>
                        <div className='right'></div>
                    </div>
                    <div className='login-form'>
                        <h2>Iniciar sesión en Social<span style={{ color: 'var(--color-preference)' }}>Flow</span></h2>
                        <a className='google-btn' href={GOOGLE_AUTH_URL}>
                            <GoogleIcon />
                            <span>Iniciar sesión con Google</span>
                        </a>
                        <div className='separating-line'>
                            <hr />
                            <p>O</p>
                            <hr />
                        </div>
                        <form onSubmit={submit}>

                            {
                                loginErrors.length > 0 && loginErrors.map((error, index) => (
                                    <div key={index} className='register-login-error'>
                                        <span style={{ color: '#fff' }}>{error}</span>
                                    </div>
                                    ))
                            }

                            <div className='inputs-text'>
                                <div className='input-group'>
                                    <input type="email"
                                        {...register('email', { required: true })}
                                        name='email'
                                        id='email'
                                        className='form-input'
                                        placeholder=' '
                                        autoComplete='email' />
                                    <label htmlFor="email" className='input-label'>Correo electrónico</label>

                                    {errors.email && <span className='input-error-span'>Correo electrónico es requerido</span>}
                                </div>
                                <div className='input-group'>
                                    <input type={!visiblePass ? 'password' : 'text'}
                                        {...register('password', { required: true })}
                                        className='form-input'
                                        placeholder=' '
                                        autoComplete='current-password' />
                                    <label htmlFor="password" className='input-label'>Contraseña</label>
                                    <div className='pass-visibility'>
                                        {
                                            !visiblePass ? <Visibility onClick={() => setVisiblePass(!visiblePass)} />
                                                : <VisibilityOff onClick={() => setVisiblePass(!visiblePass)} />
                                        }
                                    </div>
                                    {errors.password && <span className='input-error-span'>Contraseña es requerida</span>}
                                </div>
                            </div>
                            <button className='goto-home'>Continuar</button>
                        </form>
                        <div className='container-nothave-account'>
                            <span>¿No tienes cuenta? <Link to='/register'>Regístrate</Link></span>
                        </div>
                    </div>
                </div>
            </div>    
        </div>
    )
}

export default Login
