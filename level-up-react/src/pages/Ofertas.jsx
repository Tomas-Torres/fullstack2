import { Link } from 'react-router-dom'
import { useProductos } from '../context/ProductosContext'
import { useCarrito } from '../context/CarritoContext'
import ProductCard from '../components/ProductCard'

function Ofertas() {
  const { productos } = useProductos()
  const { agregarAlCarrito } = useCarrito()
  const enOferta = productos.filter((p) => p.oferta > 0)

  return (
    <main className="px-4 py-5">
      <h2 className="text-center mb-2">Ofertas</h2>
      <p className="text-center text-secundario mb-4">Productos con descuento por tiempo limitado.</p>

      {enOferta.length === 0 ? (
        <div className="carrito-vacio">
          <p>No hay ofertas disponibles en este momento.</p>
          <Link to="/productos" className="btn btn-morado">Ver catálogo completo</Link>
        </div>
      ) : (
        <div className="row g-4">
          {enOferta.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Ofertas
