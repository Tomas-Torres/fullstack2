import { Link } from 'react-router-dom'
import { formatoCLP, precioConOferta } from '../utils/precios'

function ProductCard({ producto, onAgregar }) {
  const agotado = producto.stock <= 0
  const enOferta = producto.oferta > 0
  const precioFinal = precioConOferta(producto)

  return (
    <article className="col-6 col-md-3">
      <div className={`producto-card ${agotado ? 'producto-agotado' : ''}`}>
        {enOferta && <span className="etiqueta-oferta">-{producto.oferta}%</span>}
        <Link to={`/producto/${producto.id}`} className="d-block">
          <img src={producto.imagen} alt={producto.nombre} className="img-fluid" />
        </Link>
        <h3>
          <Link to={`/producto/${producto.id}`} className="link-producto">{producto.nombre}</Link>
        </h3>
        <p className="atributo">{producto.atributo}</p>
        <p className="precio">
          {enOferta && <s className="precio-antes">{formatoCLP(producto.precio)}</s>}{' '}
          {formatoCLP(precioFinal)} CLP
        </p>
        {agotado && <p className="etiqueta-agotado">Sin stock</p>}
        <button
          className="btn btn-morado w-100"
          disabled={agotado}
          onClick={() => onAgregar(producto)}
        >
          {agotado ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  )
}

export default ProductCard
