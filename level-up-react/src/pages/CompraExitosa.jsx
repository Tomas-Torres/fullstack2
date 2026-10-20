import { Link } from 'react-router-dom'
import { formatoCLP } from '../utils/precios'

function CompraExitosa() {
  // Se lee la última orden guardada por el checkout.
  const guardada = localStorage.getItem('ultimaCompra')

  if (!guardada) {
    return (
      <main className="px-4 py-5">
        <div className="carrito-vacio">
          <h2>No hay compras recientes</h2>
          <p>Cuando completes una compra verás aquí el resumen.</p>
          <Link to="/productos" className="btn btn-morado">Ver catálogo</Link>
        </div>
      </main>
    )
  }

  const orden = JSON.parse(guardada)

  return (
    <main className="px-4 py-5">
      <div className="text-center mb-4">
        <span className="icono-exito" aria-hidden="true">✅</span>
        <h1>¡Compra realizada con éxito!</h1>
        <p className="text-secundario">
          Gracias por tu compra, {orden.direccion.nombre}. Hemos enviado la confirmación a{' '}
          <strong>{orden.direccion.correo}</strong>.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="panel-admin">
            <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
              <h2 className="mb-0">Resumen de compra</h2>
              <span className="orden-numero">Orden N.° {orden.numero}</span>
            </div>

            <ul className="lista-resumen mb-3">
              {orden.productos.map((item) => (
                <li key={item.id} className="d-flex justify-content-between">
                  <span>{item.nombre} × {item.cantidad}</span>
                  <span>{formatoCLP(item.precio * item.cantidad)}</span>
                </li>
              ))}
            </ul>

            <p className="d-flex justify-content-between">
              <span>Subtotal:</span> <span>{formatoCLP(orden.subtotal)}</span>
            </p>
            {orden.descuento > 0 && (
              <p className="d-flex justify-content-between text-success">
                <span>Cupón {orden.cupon}:</span> <span>-{formatoCLP(orden.descuento)}</span>
              </p>
            )}
            <p className="d-flex justify-content-between">
              <span>Envío ({orden.entrega}):</span>
              <span>{orden.envio === 0 ? 'Gratis' : formatoCLP(orden.envio)}</span>
            </p>
            <p className="d-flex justify-content-between fs-5 border-top pt-2">
              <span>Total pagado:</span> <strong>{formatoCLP(orden.total)}</strong>
            </p>

            <h3 className="mt-4 mb-2">Dirección de entrega</h3>
            <p className="text-secundario mb-0">
              {orden.direccion.calle} {orden.direccion.numero}, {orden.direccion.comuna},{' '}
              Región {orden.direccion.region}
              {orden.direccion.telefono && <> · Tel: {orden.direccion.telefono}</>}
            </p>
            <p className="text-secundario small mt-2 mb-0">Fecha: {orden.fecha}</p>
          </div>

          <div className="text-center mt-4">
            <Link to="/productos" className="btn btn-morado">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CompraExitosa
