import '../css/reglog.css'
import { Close, Visibility, VisibilityOff } from '@mui/icons-material'
import logo from '../img/socialflow-biglogo.png'
import { useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form'
import { UserContext } from '../context/Context.jsx';


const Register = ({ mode, setOpenFormSignUp }) => {

    const { signUp, errors: registerErrors } = useContext(UserContext)
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const navigate = useNavigate()
    
    const [active, setActive] = useState({
        month: false,
        day: false,
        year: false
    })
    
    const [visiblePass, setVisiblePass] = useState(false)
    
    const password = watch('password', '')

    const submit = handleSubmit(async (values) => {
        const {year, month, day, ...rest} = values
        const formattedDate = `${year}-${month}-${day}`
        const data = {...rest, birthDate: formattedDate}
        signUp(data)
    })

    const changeColor = e => {
        const selectedName = e.target.id
        setActive(state => ({
            ...state,
            [selectedName]: e.type === 'focus'
        }))
    }

    const generateYears = () => {
        const currentYear = new Date().getFullYear()
        const initialYear = 1924
        const yearOptions = []
        
        for (let year = currentYear; year >= initialYear; year--) {
            yearOptions.push(<option key={year} value={year}>{year.toString()}</option>)
        }
        return yearOptions
    }

    const generateDays = () => {
        const firstDay = 1
        const dayOptions = []

        for (let day = firstDay; day <= 31; day++) {
            dayOptions.push(<option key={day} value={day}>{day.toString()}</option>)
        }

        return dayOptions
    }

    const monthOptions = {
        'Enero': '01',
        'Febrero': '02',
        'Marzo': '03',
        'Abril': '04',
        'Mayo': '05',
        'Junio': '06',
        'Julio': '07',
        'Agosto': '08',
        'Septiembre': '09',
        'Octubre': '10',
        'Noviembre': '11',
        'Deciembre': '12'
    }

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
                    <div className='inputs-container'>
                        <form className='register-form' onSubmit={submit}>
                        <div className='inputs-container-title'>
                            <h1 className='title'>Crear cuenta</h1>
                        </div>
                        <div className='inputs-text'>
                            <div className='input-group'>
                                <input type="text"
                                    {...register('name', {required: true})}
                                    name='name'
                                    id='name'
                                    className='form-input'    
                                    placeholder=' '
                                    autoFocus autoComplete='name' />
                                <label htmlFor="name" className='input-label'>Nombre</label>
                            
                                    {errors.name ? <span className='input-error-span'>Nombre es requerido</span>
                                        : registerErrors.name_min ? <span className='input-error-span'>{registerErrors.name_min}</span>
                                            : registerErrors.name_max && <span className='input-error-span'>{registerErrors.name_max}</span>}  
                            </div>
                                
                            <div className='input-group'>
                                <input type="text"
                                    {...register('username', {required: true})}    
                                    name='username'
                                    id='username'
                                    className='form-input'    
                                    placeholder=' '
                                    autoComplete='username' />
                                <label htmlFor="username" className='input-label'>Nombre de usuario</label>
                            
                                    {errors.username ? <span className='input-error-span'>Nombre de usuario es requerido</span>
                                        : registerErrors.username_min ? <span className="input-error-span">{registerErrors.username_min}</span>
                                            : registerErrors.username_max && <span className="input-error-span">{registerErrors.username_max}</span>
                                    }
                            </div>
                                
                            <div className='input-group'>
                                <input type="email"
                                    {...register('email', {required: true})}
                                    name='email'
                                    id='email'
                                    className='form-input'    
                                    placeholder=' '
                                    autoComplete='email' />
                                <label htmlFor="email" className='input-label'>Correo electrónico</label>
                                    
                                    {errors.email ? <span className='input-error-span'>Correo electrónico es requerido</span>
                                        : registerErrors.email_inv && <span className="input-error-span">{registerErrors.email_inv}</span>
                                    }
                            </div>
                            <div className='input-group'>
                                <input type={!visiblePass ? 'password' : 'text'}
                                    {...register('password', {required: true})}
                                    name='password'
                                    id='password'
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

                                    {errors.password ? <span className='input-error-span'>Contraseña es requerida</span>
                                        : registerErrors.password_min && <span className="input-error-span">{registerErrors.password_min}</span>
                                    }
                            </div>    
                            <div className='input-group'>
                                <input type='password'
                                        {...register('confirmPassword', {
                                            required: true,
                                            validate: value => value === password || 'Las contraseñas no coinciden'
                                        })}
                                    name='confirmPassword'
                                    id='confirmPassword'
                                    className='form-input'    
                                    placeholder=' '
                                    autoComplete='current-password' />
                                <label htmlFor="password" className='input-label'>Confirmar contraseña</label>

                                    {errors.confirmPassword && <span className='input-error-span confirm-pass'>{errors.confirmPassword.message}</span>}
                            </div>   
                            <div className='birthday'>
                                <span>Fecha de nacimiento</span>
                                <div className='birthdate-selects'>
                                    <div className={`custom-select ${active.year ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor}>
                                        <label className={`select-label ${active.year ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor} htmlFor="year">Año</label>
                                        <select
                                            {...register('year', {required: true})}
                                            className='select-input'
                                            id="year"
                                            onChange={(e) => e.target.value}>
                                            <option selected disabled></option>
                                            {generateYears()}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"
                                            className={`select-icon ${active.year ? 'active' : ''}`}
                                            onFocus={changeColor} onBlur={changeColor}>
                                                <path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
                                        </svg>
                                    </div>
                                    <div className={`custom-select ${active.month ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor}>
                                        <label className={`select-label ${active.month ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor} htmlFor="month">Mes</label>
                                        <select
                                            {...register('month', {required: true})}
                                            className='select-input'
                                            id="month"
                                            onChange={(e) => e.target.value}>
                                            <option selected disabled></option>
                                                {
                                                    Object.entries(monthOptions).map(([monthName, monthNumber]) => (
                                                        <option key={monthNumber} value={monthNumber}>{monthName}</option>
                                                    ))
                                                }
                                            </select>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"
                                                className={`select-icon ${active.month ? 'active' : ''}`}
                                                onFocus={changeColor} onBlur={changeColor}>
                                                <path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
                                            </svg>   
                                    </div>
                                    <div className={`custom-select ${active.day ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor}>
                                        <label className={`select-label ${active.day ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor} htmlFor="day">Día</label>
                                            <select
                                                {...register('day', {required: true})}
                                                className='select-input'
                                                id="day" onChange={(e) => e.target.value}>
                                            <option selected disabled></option>
                                            {generateDays()}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"
                                            className={`select-icon ${active.day ? 'active' : ''}`}
                                            onFocus={changeColor} onBlur={changeColor}>
                                                <path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
                                        </svg>
                                    </div>
                                </div>
                                    {errors.month || errors.day || errors.year ? <span className='input-error-span'>Fecha de nacimiento es requerida</span> : null}
                                </div>
                        </div>
                            <button type='submit' className='goto-home'>Continuar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
