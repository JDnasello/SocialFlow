import { Close } from "@mui/icons-material"
import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../context/Context"
import { useSelector } from "react-redux"

const CompleteUser = ({ mode }) => {

    const { completeUser, errors } = useContext(UserContext)
    const { register, handleSubmit, watch } = useForm()
    const { id } = useSelector(state => state.registerUser)
    
    const navigate = useNavigate()

    const [btnActive, setBtnActive] = useState(false)
    const [active, setActive] = useState({
        month: false,
        day: false,
        year: false
    })
    
    const username = watch('username')
    const day = watch('day')
    const month = watch('month')
    const year = watch('year')

    useEffect(() => {
        username && day && month && year ? setBtnActive(true) : setBtnActive(false)
    }, [username, day, month, year])

    const submit = handleSubmit(async (values) => {
        const { year, month, day, username } = values
        const formattedDate = `${year}-${month}-${day}`
        const data = { username, birthDate: formattedDate }
        
        await completeUser(id, data)
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

    return (
        <div className="container-fixed">
            <div className="form-mask"></div>
            <div className={`register-login-overlay complete-user-overlay ${!mode ? 'light-mode' : ''}`}>
                <div className="complete-user-head">
                    <div className="left">
                        <div onClick={() => navigate('/')}>
                            <Close />
                        </div>
                    </div>
                    <h2>Hola! Parece que eres nuevo por aquí</h2>
                </div>
                <div className="container-complete-user">
                    <h4>Por favor completa los siguientes campos para comenzar a vivir la experiencia de SocialFlow</h4>
                    <form className="complete-user-form" onSubmit={submit}>
                        <div className="inputs-text">
                            <div className="input-group">
                                <input type="text"
                                    {...register('username', { required: true })}
                                    id="username"
                                    className="form-input"
                                    placeholder=" "
                                    autoComplete="username" />
                                <label htmlFor="username" className="input-label">Nombre de usuario</label>
                            </div>
                        </div>
                        <div className='birthday'>
                                <span>Fecha de nacimiento</span>
                                <div className='birthdate-selects'>
                                    <div className={`custom-select ${active.year ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor}>
                                        <label className={`select-label ${active.year ? 'active' : ''}`} onFocus={changeColor} onBlur={changeColor} htmlFor="year">Año</label>
                                        <select
                                            {...register('year', { required: true })}
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
                        </div>
                        
                        <button className="goto-home" type="submit" disabled={!btnActive}>Continuar</button>

                        {errors.length > 0 && (
                            <div className="register-login-error">
                                <span style={{ color: '#fff' }}>{errors[0]}</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CompleteUser
