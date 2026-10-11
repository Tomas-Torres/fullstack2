function Footer() {
  return (
    <footer className="footer-tienda px-4 py-5">
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <h3>Level-Up Gamer</h3>
          <p className="text-secundario">Tu tienda gamer de confianza en Chile. Despacho a todo el país.</p>
        </div>

        <div className="col-12 col-md-4">
          <h4>Categorías</h4>
          <ul className="lista-footer">
            <li>Consolas</li>
            <li>Accesorios</li>
            <li>Sillas Gamers</li>
          </ul>
          <h4 className="mt-3">Medios de pago</h4>
          <p className="text-secundario">💳 Débito · Crédito · Transferencia</p>
        </div>

        <div className="col-12 col-md-4">
          <h4>Únete al boletín</h4>
          <form className="form-boletin" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="email-boletin" className="visually-hidden">Correo electrónico</label>
            <input type="email" id="email-boletin" placeholder="Tu correo electrónico" required />
            <button type="submit" className="btn btn-morado">Suscribirse</button>
          </form>
        </div>
      </div>

      <p className="text-center text-secundario mt-4 mb-0">© 2026 Level-Up Gamer. Todos los derechos reservados.</p>
    </footer>
  )
}

export default Footer