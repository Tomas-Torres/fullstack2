import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { totalUnidades } = useCarrito()
  const { usuarioActivo, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="d-flex justify-content-between align-items-center px-4 py-3 header-tienda">
      <div className="logo d-flex align-items-center">
        <img src="/img/logo_Lv_Up.webp" alt="Logo Level-Up Gamer" width="40" />
        <span className="ms-2">Level-Up Gamer</span>
      </div>

      <nav>
        <ul className="nav">
          <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/carrito">Carrito</Link></li>
        </ul>
      </nav>

      <div className="acciones-usuario d-flex align-items-center gap-3">
        {usuarioActivo ? (
          <>
            <span>Hola, {usuarioActivo.nombre.split(' ')[0]}</span>
            {esAdmin && <Link to="/admin" className="text-white">Panel admin</Link>}
            <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white">Iniciar sesión</Link>
            <Link to="/registro" className="text-white">Registrar usuario</Link>
          </>
        )}
        <Link to="/carrito" className="btn btn-outline-light btn-sm">
          Cart ({totalUnidades})
        </Link>
      </div>
    </header>
  )
}

export default Header