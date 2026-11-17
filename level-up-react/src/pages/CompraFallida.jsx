import { Link } from 'react-router-dom'
import { formatoCLP } from '../utils/precios'

function CompraFallida() {
  // El checkout guarda el motivo del rechazo devuelto por ms-pagos.
  let rechazo = null
  try {
    rechazo = JSON.parse(localStorage.getItem('ultimoPagoRechazado'))
  } catch {
    rechazo = null
  }

  return (
    <main className="px-4 py-5">
      <div className="text-center mb-4">
        <span className="icono-error" aria-hidden="true">⛔</span>
        <h1>No se pudo realizar el pago</h1>
        <p className="text-secundario">
          Tu pago fue rechazado y no se realizó ningún cobro. Tus productos siguen en el carrito
          para que puedas intentarlo de nuevo.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="panel-admin text-center">
            {rechazo && (
              <div className="alert alert-danger py-2 text-start">
                <strong>Motivo:</strong> {rechazo.motivo}
                {rechazo.monto && (
                  <div className="small mt-1">Monto intentado: {formatoCLP(rechazo.monto)}</div>
                )}
              </div>
            )}

            <h2 className="mb-3">¿Qué puedo hacer?</h2>
            <ul className="lista-footer text-start mb-4">
              <li>Verifica los datos de tu tarjeta o medio de pago.</li>
              <li>Confirma que la dirección de entrega esté completa.</li>
              <li>Si el problema persiste, prueba con otro medio de pago.</li>
              <li>Si usaste una tarjeta de prueba terminada en 0000 o 1111, el cobro siempre se rechaza.</li>
            </ul>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/checkout" className="btn btn-morado">Reintentar el pago</Link>
              <Link to="/carrito" className="btn btn-outline-light">Volver al carrito</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CompraFallida
