import { Link } from "react-router-dom"

const NotFound404 = ({ mode }) => {
    return (
        <div className={`container-404 ${!mode ? 'light-mode' : ''}`}>
            <div className='not-found-404'>
                <h1>Error <span style={{ color: '#378edf'} }>404</span></h1>
                <h2>Página no encontrada</h2>
                <p>Ingrese una URL válida o haz click en el botón para volver al inicio.</p>
                <Link to='/home' style={{ textDecoration: 'none', cursor: 'default' }}>
                    <button className="not-found-btn">Regresar</button>
                </Link>
            </div>
        </div>
    )
}

export default NotFound404
