import { useProductos } from '../context/ProductosContext'
import { useCarrito } from '../context/CarritoContext'
import ProductCard from '../components/ProductCard'

function Productos() {
  const { productos } = useProductos()
  const { agregarAlCarrito } = useCarrito()

  return (
    <main className="px-4 py-5">
      <h2 className="text-center mb-4">Nuestro Catálogo</h2>
      <div className="row g-4">
        {productos.map((p) => (
          <ProductCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
        ))}
      </div>
    </main>
  )
}

export default Productos