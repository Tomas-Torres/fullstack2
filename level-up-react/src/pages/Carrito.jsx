import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'

const CUPONES = { LEVELUP10: 0.1, GAMER20: 0.2 }

function Carrito() {
  const { carrito, cambiarCantidad, vaciarCarrito, total } = useCarrito()
  const [cupon, setCupon] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [mensajeCupon, setMensajeCupon] = useState({ texto: '', ok: false })

  const formato = (n) => '$' + n.toLocaleString('es-CL')
  const totalFinal = total - total * descuento

  const aplicarCupon = () => {
    const codigo = cupon.trim().toUpperCase()
    if (CUPONES[codigo]) {
      setDescuento(CUPONES[codigo])
      setMensajeCupon({ texto: `¡Cupón aplicado! Descuento del ${CUPONES[codigo] * 100}%.`, ok: true })
    } else {
      setDescuento(0)
      setMensajeCupon({ texto: 'Cupón inválido.', ok: false })
    }
  }

  const pagar = () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de pagar.')
      return
    }
    alert('¡Compra simulada con éxito! Gracias por tu compra en Level-Up Gamer.')
    vaciarCarrito()
    setCupon('')
    setDescuento(0)
    setMensajeCupon({ texto: '', ok: false })
  }

  return (
    <main className="px-4 py-5">
      <h1 className="mb-4">Mi carrito de compras</h1>

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
                  <p>{formato(item.precio)} c/u</p>
                </div>
                <div className="control-cantidad">
                  <button onClick={() => cambiarCantidad(item.id, -1)}>−</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                </div>
                <strong>{formato(item.precio * item.cantidad)}</strong>
              </article>
            ))
          )}
        </div>

        <div className="col-12 col-md-4">
          <div className="resumen-carrito">
            <p className="d-flex justify-content-between">
              <span>Total:</span>
              <strong>{formato(totalFinal)}</strong>
            </p>

            <div className="campo-formulario">
              <label htmlFor="cupon">Cupón de descuento</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  id="cupon"
                  placeholder="Ingresa tu cupón"
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value)}
                />
                <button className="btn btn-outline-light" onClick={aplicarCupon}>Aplicar</button>
              </div>
              <span className="error" style={{ color: mensajeCupon.ok ? 'lightgreen' : '#ff5c5c' }}>
                {mensajeCupon.texto}
              </span>
            </div>

            <button className="btn btn-morado w-100 mt-3" onClick={pagar}>Pagar</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Carrito