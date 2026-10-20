import { Link } from 'react-router-dom'
import { useProductos } from '../context/ProductosContext'

function Categorias() {
  const { productos } = useProductos()

  // Cuenta los productos de cada categoría a partir del catálogo actual.
  const categorias = productos.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  }, {})

  const ICONOS = {
    'Juegos de Mesa': '🎲',
    'Accesorios': '🎧',
    'Consolas': '🕹️',
    'Computadores Gamers': '🖥️',
    'Sillas Gamers': '🪑',
    'Mouse': '🖱️',
    'Mousepad': '📐',
    'Poleras Personalizadas': '👕',
    'Polerones Gamers Personalizados': '🧥',
    'Videojuegos': '💿',
  }

  return (
    <main className="px-4 py-5">
      <h2 className="text-center mb-2">Categorías</h2>
      <p className="text-center text-secundario mb-4">Explora el catálogo por categoría.</p>

      <div className="row g-4 justify-content-center">
        {Object.entries(categorias).map(([nombre, cantidad]) => (
          <div key={nombre} className="col-6 col-md-4 col-lg-3">
            <Link to={`/productos?categoria=${encodeURIComponent(nombre)}`} className="tarjeta-categoria text-center d-block">
              <span className="icono-categoria" aria-hidden="true">{ICONOS[nombre] || '🎮'}</span>
              <h3>{nombre}</h3>
              <p className="text-secundario mb-0">{cantidad} producto{cantidad !== 1 ? 's' : ''}</p>
            </Link>
          </div>
        ))}
        {Object.keys(categorias).length === 0 && (
          <p className="text-center text-secundario">No hay categorías para mostrar.</p>
        )}
      </div>
    </main>
  )
}

export default Categorias
