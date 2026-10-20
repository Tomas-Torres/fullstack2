import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { regiones } from '../data/regiones'
import { ENTREGAS, formatoCLP } from '../utils/precios'
import Campo from '../components/Campo'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_TELEFONO = /^(\+56\s?9\s?\d{4}\s?\d{4}|9\d{8})$/

const vacio = {
  nombre: '', correo: '', telefono: '', direccion: '', numero: '',
  region: '', comuna: '', entrega: '', simularError: false,
}

function validar(d) {
  const e = {}
  if (d.nombre.trim() === '') e.nombre = 'Ingresa tu nombre completo.'
  if (!REGEX_CORREO.test(d.correo.trim())) e.correo = 'Ingresa un correo válido.'
  if (d.telefono.trim() !== '' && !REGEX_TELEFONO.test(d.telefono.trim()))
    e.telefono = 'Formato inválido. Ej: +56 9 1234 5678.'
  if (d.direccion.trim() === '') e.direccion = 'Ingresa la calle de tu dirección.'
  if (d.numero.trim() === '') e.numero = 'Ingresa el número de la dirección.'
  if (d.region === '') e.region = 'Debes seleccionar una región.'
  if (d.comuna === '') e.comuna = 'Debes seleccionar una comuna.'
  if (d.entrega === '') e.entrega = 'Elige una opción de entrega.'
  return e
}

function Checkout() {
  const { carrito, total, totalDescuento, cupon, vaciarCarrito } = useCarrito()
  const { usuarioActivo, usuarios } = useAuth()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(() => {
    // Si hay sesión iniciada, la dirección se autocompleta con los datos del usuario.
    if (usuarioActivo) {
      const completo = usuarios.find((u) => u.correo === usuarioActivo.correo)
      if (completo) {
        return {
          ...vacio,
          nombre: completo.nombre,
          correo: completo.correo,
          telefono: completo.telefono || '',
          region: completo.region || '',
          comuna: completo.comuna || '',
        }
      }
    }
    return vacio
  })
  const [errores, setErrores] = useState({})

  const comunas = regiones.find((r) => r.id === datos.region)?.comunas || []
  const opcionEntrega = ENTREGAS.find((op) => op.id === datos.entrega)
  const costoEnvio = opcionEntrega ? opcionEntrega.costo : 0
  const totalPagar = total - totalDescuento + costoEnvio

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDatos((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
  }

  const procesarPago = () => {
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // Modo demo: permite mostrar el flujo de pago fallido sin un backend real.
    if (datos.simularError) {
      navigate('/compra-fallida')
      return
    }

    const orden = {
      numero: 'LV-' + Date.now(),
      fecha: new Date().toLocaleString('es-CL'),
      productos: carrito,
      subtotal: total,
      descuento: totalDescuento,
      cupon: cupon ? cupon.codigo : null,
      envio: costoEnvio,
      total: totalPagar,
      direccion: {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.trim(),
        calle: datos.direccion.trim(),
        numero: datos.numero.trim(),
        region: datos.region,
        comuna: datos.comuna,
      },
      entrega: opcionEntrega.nombre,
    }

    localStorage.setItem('ultimaCompra', JSON.stringify(orden))
    vaciarCarrito()
    navigate('/compra-exitosa')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    procesarPago()
  }

  // Sin productos no tiene sentido el checkout.
  if (carrito.length === 0) {
    return (
      <main className="px-4 py-5">
        <div className="carrito-vacio">
          <h2>No hay nada que pagar</h2>
          <p>Tu carrito está vacío. Agrega productos antes de continuar.</p>
          <Link to="/productos" className="btn btn-morado">Ver catálogo</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-5">
      <h1 className="mb-4">Finalizar compra</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="panel-admin" onSubmit={handleSubmit} noValidate>
            <h2 className="mb-3">Datos de envío</h2>

            {usuarioActivo && (
              <p className="text-secundario small">Completamos tus datos porque tienes sesión iniciada.</p>
            )}

            <Campo id="nombre" label="Nombre completo" type="text" placeholder="Ej: Juan Pérez"
              value={datos.nombre} onChange={handleChange} error={errores.nombre} />

            <Campo id="correo" label="Correo electrónico" type="email" placeholder="Ej: nombre@correo.com"
              value={datos.correo} onChange={handleChange} error={errores.correo} />

            <Campo id="telefono" label="Teléfono (opcional)" type="tel" placeholder="Ej: +56 9 1234 5678"
              value={datos.telefono} onChange={handleChange} error={errores.telefono} />

            <div className="row g-3">
              <div className="col-12 col-md-8">
                <Campo id="direccion" label="Calle" type="text" placeholder="Ej: Av. Gamers"
                  value={datos.direccion} onChange={handleChange} error={errores.direccion} />
              </div>
              <div className="col-12 col-md-4">
                <Campo id="numero" label="Número" type="text" placeholder="Ej: 123"
                  value={datos.numero} onChange={handleChange} error={errores.numero} />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6 campo-formulario">
                <label htmlFor="region">Región</label>
                <select id="region" name="region" value={datos.region} onChange={handleChange}
                  className={errores.region ? 'input-error' : ''}>
                  <option value="">-- Selecciona tu región --</option>
                  {regiones.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
                <span className="error">{errores.region}</span>
              </div>

              <div className="col-12 col-md-6 campo-formulario">
                <label htmlFor="comuna">Comuna</label>
                <select id="comuna" name="comuna" value={datos.comuna} onChange={handleChange}
                  className={errores.comuna ? 'input-error' : ''}>
                  <option value="">-- Selecciona tu comuna --</option>
                  {comunas.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="error">{errores.comuna}</span>
              </div>
            </div>

            <h2 className="mb-3 mt-4">Opción de entrega</h2>
            <fieldset className="opciones-entrega">
              <legend className="visually-hidden">Elige cómo quieres recibir tu compra</legend>
              {ENTREGAS.map((op) => (
                <label key={op.id} className={`opcion-entrega ${datos.entrega === op.id ? 'seleccionada' : ''}`}>
                  <input
                    type="radio"
                    name="entrega"
                    value={op.id}
                    checked={datos.entrega === op.id}
                    onChange={handleChange}
                  />
                  <span className="nombre-opcion">{op.nombre}</span>
                  <span className="costo-opcion">{op.costo === 0 ? 'Gratis' : formatoCLP(op.costo)}</span>
                </label>
              ))}
              <span className="error">{errores.entrega}</span>
            </fieldset>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="resumen-carrito">
            <h2 className="mb-3">Resumen de compra</h2>

            <ul className="lista-resumen mb-3">
              {carrito.map((item) => (
                <li key={item.id} className="d-flex justify-content-between">
                  <span>{item.nombre} × {item.cantidad}</span>
                  <span>{formatoCLP(item.precio * item.cantidad)}</span>
                </li>
              ))}
            </ul>

            <p className="d-flex justify-content-between">
              <span>Subtotal:</span> <span>{formatoCLP(total)}</span>
            </p>
            {cupon && (
              <p className="d-flex justify-content-between text-success">
                <span>Cupón {cupon.codigo} (-{cupon.porcentaje * 100}%):</span>
                <span>-{formatoCLP(totalDescuento)}</span>
              </p>
            )}
            <p className="d-flex justify-content-between">
              <span>Envío:</span> <span>{costoEnvio === 0 ? 'Gratis' : formatoCLP(costoEnvio)}</span>
            </p>
            <p className="d-flex justify-content-between fs-5 border-top pt-2">
              <span>Total:</span> <strong>{formatoCLP(totalPagar)}</strong>
            </p>

            <label className={`opcion-entrega ${datos.simularError ? 'seleccionada' : ''} mt-3`}>
              <input
                type="checkbox"
                id="simular-error"
                name="simularError"
                checked={datos.simularError}
                onChange={handleChange}
              />
              <span className="nombre-opcion">Simular un error de pago (demo)</span>
            </label>

            <button className="btn btn-morado w-100 mt-3" onClick={procesarPago}>Pagar</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Checkout
