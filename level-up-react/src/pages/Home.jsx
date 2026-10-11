import { Link } from 'react-router-dom'
import { useProductos } from '../context/ProductosContext'
import { useCarrito } from '../context/CarritoContext'
import ProductCard from '../components/ProductCard'

function Home() {
  const { productos } = useProductos()
  const { agregarAlCarrito } = useCarrito()
  const destacados = productos.slice(0, 4)

  return (
    <main>
      <section className="hero px-4 py-5 text-center">
        <div className="hero-texto mx-auto">
          <h1>Sube de nivel tu setup</h1>
          <p>
            En Level-Up Gamer encuentras consolas, accesorios, sillas y computadores gamers
            pensados para llevar tu juego al siguiente nivel, con despacho a todo Chile.
          </p>
          <Link to="/productos" className="btn btn-lg btn-morado">Ver productos</Link>
        </div>
      </section>

      <section className="px-4 py-5">
        <h2 className="text-center mb-4">Productos destacados</h2>
        <div className="row g-4">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-morado">Ver todo el catálogo</Link>
        </div>
      </section>
    </main>
  )
}

export default Home