import { Link } from 'react-router-dom'

function CompraFallida() {
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
            <h2 className="mb-3">¿Qué puedo hacer?</h2>
            <ul className="lista-footer text-start mb-4">
              <li>Verifica los datos de tu tarjeta o medio de pago.</li>
              <li>Confirma que la dirección de entrega esté completa.</li>
              <li>Si el problema persiste, prueba con otro medio de pago.</li>
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
