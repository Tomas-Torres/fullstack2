function ProductCard({ producto, onAgregar }) {
  const agotado = producto.stock <= 0

  return (
    <article className="col-6 col-md-3">
      <div className={`producto-card ${agotado ? 'producto-agotado' : ''}`}>
        <img src={producto.imagen} alt={producto.nombre} className="img-fluid" />
        <h3>{producto.nombre}</h3>
        <p className="atributo">{producto.atributo}</p>
        <p className="precio">${producto.precio.toLocaleString('es-CL')} CLP</p>
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