// Cliente HTTP unico del frontend. Todas las URL se toman de variables de
// entorno de Vite (VITE_API_*) para poder cambiar los puertos sin recompilar
// la logica de la aplicacion.

const limpiar = (url) => String(url).replace(/\/+$/, '')

// Vite reemplaza import.meta.env al compilar. En las pruebas el codigo se
// empaqueta con esbuild en formato IIFE, donde ese objeto puede venir vacio;
// por eso se protege la lectura y se usan valores por defecto de localhost.
const entorno = import.meta.env || {}

export const API = {
  login: limpiar(entorno.VITE_API_LOGIN || 'http://localhost:8081'),
  productos: limpiar(entorno.VITE_API_PRODUCTOS || 'http://localhost:8082'),
  carrito: limpiar(entorno.VITE_API_CARRITO || 'http://localhost:8083'),
  pagos: limpiar(entorno.VITE_API_PAGOS || 'http://localhost:8085'),
}

const ESPERA_MAXIMA_MS = 8000

/**
 * Error con el codigo HTTP y los detalles que devuelve el backend.
 */
export class ErrorApi extends Error {
  constructor(mensaje, estado = 0, detalles = null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.detalles = detalles
  }
}

/**
 * Ejecuta una peticion y devuelve el JSON (o null si la respuesta es 204).
 * Traduce cualquier fallo a ErrorApi para que las paginas solo muestren
 * `error.message`.
 */
export async function pedir(url, { metodo = 'GET', cuerpo, token } = {}) {
  const headers = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS)

  let respuesta
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers,
      signal: controlador.signal,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(
      'No pudimos conectar con el servidor. Verifica que los microservicios esten en ejecucion.',
      0
    )
  } finally {
    clearTimeout(temporizador)
  }

  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  let datos = null
  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    // ms-login usa {campo, mensaje}; el resto de los servicios usa ApiError.
    const mensaje =
      datos?.message ||
      datos?.mensaje ||
      `La operacion fallo con el codigo ${respuesta.status}.`
    throw new ErrorApi(mensaje, respuesta.status, datos?.detalles || datos)
  }

  return datos
}

export const authApi = {
  login: (correo, password) =>
    pedir(`${API.login}/api/auth/login`, { metodo: 'POST', cuerpo: { correo, password } }),

  registro: (datos) => pedir(`${API.login}/api/usuarios/registro`, { metodo: 'POST', cuerpo: datos }),

  perfil: (id, token) => pedir(`${API.login}/api/usuarios/${id}`, { token }),

  listarUsuarios: (token, rol) =>
    pedir(`${API.login}/api/usuarios${rol ? `?rol=${encodeURIComponent(rol)}` : ''}`, { token }),

  crearUsuario: (token, datos) =>
    pedir(`${API.login}/api/usuarios`, { metodo: 'POST', token, cuerpo: datos }),

  actualizarUsuario: (token, id, datos) =>
    pedir(`${API.login}/api/usuarios/${id}`, { metodo: 'PUT', token, cuerpo: datos }),

  eliminarUsuario: (token, id) =>
    pedir(`${API.login}/api/usuarios/${id}`, { metodo: 'DELETE', token }),
}

export const productosApi = {
  listar: () => pedir(`${API.productos}/api/productos`),

  categorias: () => pedir(`${API.productos}/api/categorias`),

  crear: (token, datos) =>
    pedir(`${API.productos}/api/productos`, { metodo: 'POST', token, cuerpo: datos }),

  actualizar: (token, id, datos) =>
    pedir(`${API.productos}/api/productos/${id}`, { metodo: 'PUT', token, cuerpo: datos }),

  eliminar: (token, id) =>
    pedir(`${API.productos}/api/productos/${id}`, { metodo: 'DELETE', token }),

  crearCategoria: (token, nombre) =>
    pedir(`${API.productos}/api/categorias`, { metodo: 'POST', token, cuerpo: { nombre } }),
}

export const carritoApi = {
  obtener: (usuarioId, token) => pedir(`${API.carrito}/api/carritos/${usuarioId}`, { token }),

  agregar: (usuarioId, token, productoId, cantidad) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}/items`, {
      metodo: 'POST',
      token,
      cuerpo: { productoId, cantidad },
    }),

  actualizar: (usuarioId, token, productoId, cantidad) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}/items/${productoId}`, {
      metodo: 'PUT',
      token,
      cuerpo: { cantidad },
    }),

  eliminarItem: (usuarioId, token, productoId) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}/items/${productoId}`, {
      metodo: 'DELETE',
      token,
    }),

  vaciar: (usuarioId, token) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}`, { metodo: 'DELETE', token }),

  aplicarCupon: (usuarioId, token, codigo) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}/cupon`, {
      metodo: 'POST',
      token,
      cuerpo: { codigo },
    }),

  quitarCupon: (usuarioId, token) =>
    pedir(`${API.carrito}/api/carritos/${usuarioId}/cupon`, { metodo: 'DELETE', token }),
}

export const pagosApi = {
  registrar: (token, pago) =>
    pedir(`${API.pagos}/api/pagos`, { metodo: 'POST', token, cuerpo: pago }),

  porOrden: (token, ordenId) => pedir(`${API.pagos}/api/pagos/orden/${ordenId}`, { token }),
}
