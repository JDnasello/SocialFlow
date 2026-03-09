import logo from '../img/socialflow-biglogo.png'
import '../css/logout.css'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../context/Context.jsx'
import { useSelector } from 'react-redux'

const Logout = () => {
    const { userLogout } = useContext(UserContext)
    const { username } = useSelector(state => state.registerUser)

    return (
        <div className="container-logout">
            <div className='logout-confirmation'>
                <img src={logo} alt="" />
                <h2>Estás a punto de cerrar sesión</h2>
                <p>Podrás volver a iniciar sesión cuando quieras</p>
                <div className='container-logout-btns'>
                    <button className='btn-logout' onClick={() => userLogout(username)}>Cerrar sesión</button>
                    <Link to='/home'><button className='btn-cancel'>Cancelar</button></Link>
                </div>
            </div>
        </div>
    )
}

export default Logout
