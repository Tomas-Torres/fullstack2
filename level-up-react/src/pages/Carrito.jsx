import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { formatoCLP } from '../utils/precios'

function Carrito() {
  const {
    carrito, cambiarCantidad, cupon, aplicarCupon, mensaje,
    total, totalDescuento, totalFinal,
  } = useCarrito()
  const [codigoCupon, setCodigoCupon] = useState('')
  const [mensajeCupon, setMensajeCupon] = useState({ texto: '', ok: false })
  const navigate = useNavigate()

  const handleAplicarCupon = async () => {
    setMensajeCupon(await aplicarCupon(codigoCupon))
  }

  const irAlCheckout = () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de pagar.')
      return
    }
    navigate('/checkout')
  }

  return (
    <main className="px-4 py-5">
      <h1 className="mb-4">Mi carrito de compras</h1>

      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'alert-danger' : 'alert-success'} py-2`}>
          {mensaje.texto}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-md-8">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>Tu carrito está vacío.</p>
              <Link to="/productos" className="btn btn-morado">Ver catálogo</Link>
            </div>
          ) : (
            carrito.map((item) => (
              <article key={item.id} className="producto-carrito">
                <img src={item.imagen} alt={item.nombre} />
                <div className="info-producto">
                  <h3>{item.nombre}</h3>
                  <p>{formatoCLP(item.precio)} c/u</p>
                </div>
                <div className="control-cantidad">
                  <button aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, -1)}>−</button>
                  <span>{item.cantidad}</span>
                  <button aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                </div>
                <strong>{formatoCLP(item.precio * item.cantidad)}</strong>
              </article>
            ))
          )}
        </div>

        <div className="col-12 col-md-4">
          <div className="resumen-carrito">
            <p className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>{formatoCLP(total)}</span>
            </p>

            <div className="campo-formulario">
              <label htmlFor="cupon">Cupón de descuento</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  id="cupon"
                  placeholder="Ingresa tu cupón"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                />
                <button className="btn btn-outline-light" onClick={handleAplicarCupon}>Aplicar</button>
              </div>
              <span className="error" style={{ color: mensajeCupon.ok ? 'lightgreen' : '#ff5c5c' }}>
                {mensajeCupon.texto}
              </span>
            </div>

            {cupon && (
              <p className="d-flex justify-content-between text-success">
                <span>Cupón {cupon.codigo} (-{cupon.porcentaje * 100}%):</span>
                <span>-{formatoCLP(totalDescuento)}</span>
              </p>
            )}

            <p className="d-flex justify-content-between fs-5 border-top pt-2">
              <span>Total:</span>
              <strong>{formatoCLP(totalFinal)}</strong>
            </p>

            <button className="btn btn-morado w-100 mt-3" onClick={irAlCheckout}>Pagar</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Carrito
