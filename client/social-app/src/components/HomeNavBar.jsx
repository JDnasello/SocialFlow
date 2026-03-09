import { Link } from 'react-router-dom'
import '../css/home.css'

const HomeNavBar = ({ isInHomePath }) => {

    return (
        <nav className="content-bar">
            <div className='content-bar-link'>
                <Link to='/home' className={`${isInHomePath ? 'active' : ''}`}>
                    Para Tí
                </Link>
                <div></div>
            </div>  
            <div className='content-bar-link'>
                <Link to='/home/following-posts' className={`${!isInHomePath ? 'active' : ''}`}>
                    Siguiendo
                </Link>
                <div></div>
            </div>
        </nav>
    )
}

export default HomeNavBar
