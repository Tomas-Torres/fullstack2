import { Link, useSearchParams } from 'react-router-dom'
import { useProductos } from '../context/ProductosContext'
import { useCarrito } from '../context/CarritoContext'
import ProductCard from '../components/ProductCard'

function Productos() {
  const { productos } = useProductos()
  const { agregarAlCarrito } = useCarrito()
  // Filtros llegan por la URL: /productos?categoria=...&q=...
  const [params, setParams] = useSearchParams()
  const categoria = params.get('categoria') || ''
  const busqueda = (params.get('q') || '').toLowerCase()

  const categorias = [...new Set(productos.map((p) => p.categoria))]

  const filtrados = productos.filter((p) => {
    const coincideCategoria = !categoria || p.categoria === categoria
    const texto = `${p.nombre} ${p.atributo} ${p.categoria}`.toLowerCase()
    const coincideBusqueda = !busqueda || texto.includes(busqueda)
    return coincideCategoria && coincideBusqueda
  })

  const cambiarParametro = (clave, valor) => {
    const nuevos = new URLSearchParams(params)
    if (valor) {
      nuevos.set(clave, valor)
    } else {
      nuevos.delete(clave)
    }
    setParams(nuevos)
  }

  const hayFiltro = categoria !== '' || busqueda !== ''

  return (
    <main className="px-4 py-5">
      <h2 className="text-center mb-4">Nuestro Catálogo</h2>

      <div className="filtros-catalogo d-flex flex-wrap gap-2 justify-content-center mb-4">
        <button
          className={`btn btn-sm ${categoria === '' ? 'btn-morado' : 'btn-outline-light'}`}
          onClick={() => cambiarParametro('categoria', '')}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            className={`btn btn-sm ${categoria === c ? 'btn-morado' : 'btn-outline-light'}`}
            onClick={() => cambiarParametro('categoria', c)}
          >
            {c}
          </button>
        ))}
      </div>

      {hayFiltro && (
        <p className="text-center text-secundario mb-4">
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          {busqueda && <> para «{params.get('q')}»</>}
          {categoria && <> en {categoria}</>}
          {' '}
          <button className="btn btn-link p-0" onClick={() => setParams({})}>Limpiar filtros</button>
        </p>
      )}

      {filtrados.length === 0 ? (
        <div className="carrito-vacio">
          <p>No encontramos productos que coincidan con tu búsqueda.</p>
          <Link to="/productos" className="btn btn-morado" onClick={() => setParams({})}>
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filtrados.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Productos
