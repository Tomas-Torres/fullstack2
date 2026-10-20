import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { totalUnidades } = useCarrito()
  const { usuarioActivo, esAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  // Envía el texto buscado a /productos?q=... para filtrar el catálogo.
  const buscar = (e) => {
    e.preventDefault()
    navigate(busqueda.trim() ? `/productos?q=${encodeURIComponent(busqueda.trim())}` : '/productos')
  }

  return (
    <header className="header-tienda px-4 py-3">
      <div className="header-fila d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="logo d-flex align-items-center">
          <img src="/img/logo_Lv_Up.webp" alt="Logo Level-Up Gamer" width="40" />
          <span className="ms-2">Level-Up Gamer</span>
        </div>

        <nav>
          <ul className="nav">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/categorias">Categorías</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/ofertas">Ofertas</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/carrito">Carrito</Link></li>
          </ul>
        </nav>

        <form className="buscador-header d-flex gap-2" role="search" onSubmit={buscar}>
          <label htmlFor="buscador" className="visually-hidden">Buscar productos</label>
          <input
            id="buscador"
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-light btn-sm">Buscar</button>
        </form>

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
      </div>
    </header>
  )
}

export default Header
