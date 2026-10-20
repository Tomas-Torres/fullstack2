import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProductos } from '../context/ProductosContext'
import { useCarrito } from '../context/CarritoContext'
import { formatoCLP, precioConOferta } from '../utils/precios'

function ProductoDetalle() {
  const { id } = useParams()
  const { productos } = useProductos()
  const { agregarAlCarrito } = useCarrito()
  const [agregado, setAgregado] = useState(false)

  const producto = productos.find((p) => p.id === id)

  if (!producto) {
    return (
      <main className="px-4 py-5">
        <div className="carrito-vacio">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o fue eliminado del catálogo.</p>
          <Link to="/productos" className="btn btn-morado">Volver al catálogo</Link>
        </div>
      </main>
    )
  }

  const agotado = producto.stock <= 0
  const enOferta = producto.oferta > 0
  const precioFinal = precioConOferta(producto)

  const handleAgregar = () => {
    agregarAlCarrito(producto)
    setAgregado(true)
  }

  return (
    <main className="px-4 py-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/productos">Productos</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/productos?categoria=${encodeURIComponent(producto.categoria)}`}>
              {producto.categoria}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <div className="row g-4 detalle-producto">
        <div className="col-12 col-md-6">
          <div className="producto-card">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid" />
          </div>
        </div>

        <div className="col-12 col-md-6">
          {enOferta && <span className="etiqueta-oferta mb-2 d-inline-block">-{producto.oferta}% de descuento</span>}
          <h1>{producto.nombre}</h1>
          <p className="atributo">{producto.atributo}</p>

          <p className="precio-detalle">
            {enOferta && <s className="precio-antes">{formatoCLP(producto.precio)}</s>}{' '}
            <strong>{formatoCLP(precioFinal)} CLP</strong>
          </p>

          <p className={agotado ? 'etiqueta-agotado' : 'stock-disponible'}>
            {agotado ? 'Sin stock' : `Stock disponible: ${producto.stock} unidades`}
          </p>

          <p className="descripcion my-3">{producto.descripcion}</p>

          <button className="btn btn-morado btn-lg" disabled={agotado} onClick={handleAgregar}>
            {agotado ? 'Sin stock' : 'Agregar al carrito'}
          </button>

          {agregado && !agotado && (
            <div className="alert alert-success mt-3" role="alert">
              Producto agregado al carrito. <Link to="/carrito" className="alert-link">Ir al carrito</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default ProductoDetalle
