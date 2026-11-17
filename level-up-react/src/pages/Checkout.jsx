import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { pagosApi } from '../api/cliente'
import { regiones } from '../data/regiones'
import { ENTREGAS, formatoCLP } from '../utils/precios'
import Campo from '../components/Campo'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_TELEFONO = /^(\+56\s?9\s?\d{4}\s?\d{4}|9\d{8})$/
const REGEX_TARJETA = /^\d{16}$/

const METODOS = [
  { id: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito' },
  { id: 'TARJETA_DEBITO', nombre: 'Tarjeta de débito' },
  { id: 'TRANSFERENCIA', nombre: 'Transferencia bancaria' },
]

const vacio = {
  nombre: '', correo: '', telefono: '', direccion: '', numero: '',
  region: '', comuna: '', entrega: '',
  metodo: 'TARJETA_CREDITO', numeroTarjeta: '',
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

  // Solo las tarjetas exigen número; la transferencia se aprueba directo.
  if (d.metodo !== 'TRANSFERENCIA') {
    const limpio = d.numeroTarjeta.replace(/\s/g, '')
    if (!REGEX_TARJETA.test(limpio)) e.numeroTarjeta = 'Ingresa los 16 dígitos de tu tarjeta.'
  }
  return e
}

function Checkout() {
  const { carrito, total, totalDescuento, cupon, vaciarCarrito } = useCarrito()
  const { usuarioActivo, token } = useAuth()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(() => ({
    ...vacio,
    nombre: usuarioActivo?.nombre || '',
    correo: usuarioActivo?.correo || '',
    telefono: usuarioActivo?.telefono || '',
    region: usuarioActivo?.region || '',
    comuna: usuarioActivo?.comuna || '',
  }))
  const [errores, setErrores] = useState({})
  const [errorPago, setErrorPago] = useState('')
  const [procesando, setProcesando] = useState(false)

  const comunas = regiones.find((r) => r.id === datos.region)?.comunas || []
  const opcionEntrega = ENTREGAS.find((op) => op.id === datos.entrega)
  const costoEnvio = opcionEntrega ? opcionEntrega.costo : 0
  const totalPagar = total - totalDescuento + costoEnvio
  const esTarjeta = datos.metodo !== 'TRANSFERENCIA'

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
  }

  const procesarPago = async () => {
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    setErrorPago('')
    if (Object.keys(nuevosErrores).length > 0) return

    setProcesando(true)
    try {
      // No existe ms-ordenes: usamos un identificador simbólico para el cobro.
      const ordenId = Date.now()
      const pago = await pagosApi.registrar(token, {
        ordenId,
        monto: totalPagar,
        metodo: datos.metodo,
        numeroTarjeta: esTarjeta ? datos.numeroTarjeta.replace(/\s/g, '') : null,
      })

      const resumenPago = {
        estado: pago.estado,
        metodo: pago.metodo,
        ultimosDigitos: pago.ultimosDigitos,
        codigoTransaccion: pago.codigoTransaccion,
      }

      if (pago.estado !== 'APROBADO') {
        localStorage.setItem(
          'ultimoPagoRechazado',
          JSON.stringify({
            monto: pago.monto,
            motivo: pago.motivoRechazo || 'El pago fue rechazado.',
            codigoTransaccion: pago.codigoTransaccion,
          })
        )
        navigate('/compra-fallida')
        return
      }

      const orden = {
        numero: 'LV-' + ordenId,
        ordenId,
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
        pago: resumenPago,
      }

      localStorage.removeItem('ultimoPagoRechazado')
      localStorage.setItem('ultimaCompra', JSON.stringify(orden))
      await vaciarCarrito()
      navigate('/compra-exitosa')
    } catch (fallo) {
      setErrorPago(fallo.message)
    } finally {
      setProcesando(false)
    }
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

  // El cobro se hace contra ms-pagos, que exige un JWT válido.
  if (!token || !usuarioActivo) {
    return (
      <main className="px-4 py-5">
        <div className="carrito-vacio">
          <h2>Inicia sesión para pagar</h2>
          <p>Para cobrar tu compra necesitamos identificar tu cuenta.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/login" className="btn btn-morado">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn-outline-light">Crear cuenta</Link>
          </div>
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

            <p className="text-secundario small">Completamos tus datos porque tienes sesión iniciada.</p>

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

            <h2 className="mb-3 mt-4">Medio de pago</h2>
            <fieldset className="opciones-entrega">
              <legend className="visually-hidden">Elige tu medio de pago</legend>
              {METODOS.map((metodo) => (
                <label key={metodo.id} className={`opcion-entrega ${datos.metodo === metodo.id ? 'seleccionada' : ''}`}>
                  <input
                    type="radio"
                    name="metodo"
                    value={metodo.id}
                    checked={datos.metodo === metodo.id}
                    onChange={handleChange}
                  />
                  <span className="nombre-opcion">{metodo.nombre}</span>
                  <span className="costo-opcion">
                    {metodo.id === 'TRANSFERENCIA' ? 'Aprobación inmediata' : 'Débito inmediato'}
                  </span>
                </label>
              ))}
            </fieldset>

            {esTarjeta && (
              <div className="mt-2">
                <Campo id="numeroTarjeta" label="Número de tarjeta" type="text"
                  placeholder="Ej: 4111 1111 1111 1234" inputMode="numeric"
                  value={datos.numeroTarjeta} onChange={handleChange} error={errores.numeroTarjeta}
                  sugerencia="Prueba terminando en 0000 (fondos insuficientes) o 1111 (rechazada)." />
              </div>
            )}

            {errorPago && <div className="alert alert-danger py-2 mt-3">{errorPago}</div>}
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

            <button className="btn btn-morado w-100 mt-3" onClick={procesarPago} disabled={procesando}>
              {procesando ? 'Procesando pago...' : 'Pagar'}
            </button>
            <p className="text-secundario small mt-2 mb-0">
              El cobro es simulado: no se descuenta dinero real.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Checkout
