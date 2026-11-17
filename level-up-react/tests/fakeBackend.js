// Backend simulado para las pruebas del frontend.
//
// No levanta servidores: reemplaza window.fetch y responde con los mismos
// codigos y formatos que los cuatro microservicios. Asi las pruebas ejercitan
// el cliente real (src/api/cliente.js) y los contextos, sin depender de red.

import { categoriasIniciales, productosIniciales } from '../src/data/ProductosIniciales'

const CUPONES = { LEVELUP10: 0.1, GAMER20: 0.2 }

const copia = (valor) => JSON.parse(JSON.stringify(valor))

const responder = (estado, cuerpo) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  text: async () => (cuerpo === null || cuerpo === undefined ? '' : JSON.stringify(cuerpo)),
})

function productoApi(producto) {
  const descuento = producto.oferta ?? producto.descuento ?? 0
  return {
    id: producto.id,
    nombre: producto.nombre,
    categoriaId: producto.categoriaId,
    categoriaNombre: producto.categoriaNombre ?? producto.categoria,
    atributo: producto.atributo ?? '',
    precio: producto.precio,
    descuento,
    precioFinal: Math.round(producto.precio * (1 - descuento / 100)),
    stock: producto.stock ?? 0,
    imagen: producto.imagen ?? '',
    activo: producto.activo !== false,
    enOferta: descuento > 0,
    sinStock: (producto.stock ?? 0) <= 0,
  }
}

const normalizarProducto = (producto) =>
  producto.categoriaNombre !== undefined ? copia(producto) : productoApi(producto)

const sinPassword = ({ password: _password, ...resto }) => resto

const usuariosIniciales = () => [
  {
    id: 1,
    nombre: 'Administrador',
    correo: 'admin@levelup.cl',
    password: 'Admin123!',
    telefono: '',
    region: 'metropolitana',
    comuna: 'Santiago',
    rol: 'ADMIN',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Cliente Pagos',
    correo: 'cliente.pagos@levelup.cl',
    password: 'Cliente123!',
    telefono: '912345678',
    region: 'metropolitana',
    comuna: 'Santiago',
    rol: 'CLIENTE',
    activo: true,
  },
]

/**
 * Crea un backend en memoria. Devuelve `fetch`, el estado mutable y el
 * registro de llamadas para poder hacer aserciones.
 */
export function crearBackend(opciones = {}) {
  const estado = {
    productos: (opciones.productos || productosIniciales).map(normalizarProducto),
    categorias: copia(opciones.categorias || categoriasIniciales),
    usuarios: copia(opciones.usuarios || usuariosIniciales()),
    carritos: copia(opciones.carritos || {}),
    pagos: [],
    siguienteProducto: 100,
    siguienteUsuario: 100,
    siguienteCategoria: 100,
    caido: Boolean(opciones.caido),
    pagosCaidos: Boolean(opciones.pagosCaidos),
  }

  const llamadas = []

  const carritoDe = (usuarioId) => {
    if (!estado.carritos[usuarioId]) {
      estado.carritos[usuarioId] = {
        usuarioId: Number(usuarioId),
        items: [],
        cuponCodigo: null,
      }
    }
    return estado.carritos[usuarioId]
  }

  const respuestaCarrito = (carrito) => {
    const items = carrito.items.map((item) => ({
      ...item,
      subtotal: item.precioUnitario * item.cantidad,
    }))
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0)
    const porcentaje = CUPONES[carrito.cuponCodigo] || 0
    const descuento = Math.round(subtotal * porcentaje)
    return {
      usuarioId: carrito.usuarioId,
      items,
      totalUnidades: items.reduce((total, item) => total + item.cantidad, 0),
      subtotal,
      descuento,
      total: subtotal - descuento,
      cuponCodigo: carrito.cuponCodigo,
    }
  }

  const buscarProducto = (id) =>
    estado.productos.find((producto) => String(producto.id) === String(id))

  const agregarItem = (carrito, producto, cantidad) => {
    const existente = carrito.items.find(
      (item) => String(item.productoId) === String(producto.id)
    )
    const nuevaCantidad = (existente?.cantidad || 0) + cantidad
    if (nuevaCantidad > producto.stock) {
      return { error: responder(409, { message: 'No hay stock suficiente para esa cantidad.' }) }
    }
    if (existente) {
      existente.cantidad = nuevaCantidad
    } else {
      carrito.items.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precioFinal,
        imagen: producto.imagen,
        cantidad,
      })
    }
    return { ok: true }
  }

  const fetchSimulado = async (url, config = {}) => {
    const { pathname } = new URL(url)
    const metodo = (config.method || 'GET').toUpperCase()
    const partes = pathname.split('/').filter(Boolean)
    const cuerpo = config.body ? JSON.parse(config.body) : {}
    const autorizacion = config.headers?.Authorization || config.headers?.authorization
    const autorizado = typeof autorizacion === 'string' && autorizacion.startsWith('Bearer ')

    llamadas.push({ metodo, pathname, cuerpo })

    // ---------- ms-login ----------
    if (metodo === 'POST' && pathname === '/api/auth/login') {
      const usuario = estado.usuarios.find(
        (item) => item.correo.toLowerCase() === String(cuerpo.correo).toLowerCase()
      )
      if (!usuario) {
        return responder(404, { campo: 'correo', mensaje: 'No existe una cuenta con este correo.' })
      }
      if (usuario.password !== cuerpo.password) {
        return responder(401, { campo: 'password', mensaje: 'Contraseña incorrecta.' })
      }
      if (usuario.activo === false) {
        return responder(403, { campo: 'correo', mensaje: 'La cuenta está desactivada.' })
      }
      return responder(200, {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        token: `token-${usuario.id}`,
      })
    }

    if (metodo === 'POST' && pathname === '/api/usuarios/registro') {
      const existe = estado.usuarios.some(
        (item) => item.correo.toLowerCase() === String(cuerpo.correo).toLowerCase()
      )
      if (existe) {
        return responder(409, { message: 'Ya existe una cuenta con este correo.' })
      }
      const usuario = {
        id: estado.siguienteUsuario++,
        nombre: cuerpo.nombre,
        correo: cuerpo.correo,
        password: cuerpo.password,
        telefono: cuerpo.telefono || '',
        region: cuerpo.region || '',
        comuna: cuerpo.comuna || '',
        rol: 'CLIENTE',
        activo: true,
      }
      estado.usuarios.push(usuario)
      return responder(201, sinPassword(usuario))
    }

    if (partes[0] === 'api' && partes[1] === 'usuarios') {
      if (!autorizado) return responder(401, { message: 'No autorizado.' })

      if (metodo === 'GET' && partes.length === 2) {
        return responder(200, estado.usuarios.map(sinPassword))
      }
      if (metodo === 'GET' && partes.length === 3) {
        const usuario = estado.usuarios.find((item) => String(item.id) === partes[2])
        if (!usuario) return responder(404, { message: 'Usuario no encontrado.' })
        return responder(200, sinPassword(usuario))
      }
      if (metodo === 'POST' && partes.length === 2) {
        const existe = estado.usuarios.some(
          (item) => item.correo.toLowerCase() === String(cuerpo.correo).toLowerCase()
        )
        if (existe) return responder(409, { message: 'Ya existe una cuenta con este correo.' })
        const usuario = {
          id: estado.siguienteUsuario++,
          nombre: cuerpo.nombre,
          correo: cuerpo.correo,
          password: cuerpo.password || 'Temporal123!',
          telefono: cuerpo.telefono || '',
          region: cuerpo.region || '',
          comuna: cuerpo.comuna || '',
          rol: String(cuerpo.rol || 'CLIENTE').toUpperCase(),
          activo: cuerpo.activo !== false,
        }
        estado.usuarios.push(usuario)
        return responder(201, sinPassword(usuario))
      }
      if (metodo === 'PUT' && partes.length === 3) {
        const usuario = estado.usuarios.find((item) => String(item.id) === partes[2])
        if (!usuario) return responder(404, { message: 'Usuario no encontrado.' })
        Object.assign(usuario, cuerpo)
        if (cuerpo.rol) usuario.rol = String(cuerpo.rol).toUpperCase()
        return responder(200, sinPassword(usuario))
      }
      if (metodo === 'DELETE' && partes.length === 3) {
        const usuario = estado.usuarios.find((item) => String(item.id) === partes[2])
        if (!usuario) return responder(404, { message: 'Usuario no encontrado.' })
        usuario.activo = false
        return responder(204, null)
      }
    }

    // ---------- ms-productos ----------
    if (partes[0] === 'api' && partes[1] === 'categorias') {
      if (estado.caido) return responder(503, { message: 'ms-productos no disponible.' })

      if (metodo === 'GET' && partes.length === 2) {
        return responder(200, estado.categorias)
      }
      if (metodo === 'POST' && partes.length === 2) {
        if (!autorizado) return responder(401, { message: 'No autorizado.' })
        const categoria = { id: estado.siguienteCategoria++, nombre: cuerpo.nombre }
        estado.categorias.push(categoria)
        return responder(201, categoria)
      }
    }

    if (partes[0] === 'api' && partes[1] === 'productos') {
      if (estado.caido) {
        return responder(503, { message: 'No se pudo contactar a ms-productos.' })
      }

      if (metodo === 'GET' && partes.length === 2) {
        return responder(200, estado.productos.filter((producto) => producto.activo !== false))
      }
      if (metodo === 'GET' && partes.length === 3) {
        const producto = buscarProducto(partes[2])
        if (!producto) return responder(404, { message: 'Producto no encontrado.' })
        return responder(200, producto)
      }
      if (metodo === 'POST' && partes.length === 2) {
        if (!autorizado) return responder(401, { message: 'No autorizado.' })
        const categoria = estado.categorias.find(
          (item) => String(item.id) === String(cuerpo.categoriaId)
        )
        const producto = normalizarProducto({
          id: estado.siguienteProducto++,
          nombre: cuerpo.nombre,
          categoriaId: cuerpo.categoriaId,
          categoria: categoria?.nombre || 'Sin categoría',
          atributo: cuerpo.atributo,
          precio: cuerpo.precio,
          oferta: cuerpo.descuento ?? 0,
          stock: cuerpo.stock,
          imagen: cuerpo.imagen,
          activo: cuerpo.activo !== false,
        })
        estado.productos.push(producto)
        return responder(201, producto)
      }
      if (metodo === 'PUT' && partes.length === 3) {
        if (!autorizado) return responder(401, { message: 'No autorizado.' })
        const producto = buscarProducto(partes[2])
        if (!producto) return responder(404, { message: 'Producto no encontrado.' })
        const categoria = estado.categorias.find(
          (item) => String(item.id) === String(cuerpo.categoriaId)
        )
        Object.assign(
          producto,
          normalizarProducto({
            id: producto.id,
            nombre: cuerpo.nombre ?? producto.nombre,
            categoriaId: cuerpo.categoriaId ?? producto.categoriaId,
            categoria: categoria?.nombre || producto.categoriaNombre,
            atributo: cuerpo.atributo ?? producto.atributo,
            precio: cuerpo.precio ?? producto.precio,
            oferta: cuerpo.descuento ?? producto.descuento,
            stock: cuerpo.stock ?? producto.stock,
            imagen: cuerpo.imagen ?? producto.imagen,
            activo: cuerpo.activo !== false,
          })
        )
        return responder(200, producto)
      }
      if (metodo === 'DELETE' && partes.length === 3) {
        if (!autorizado) return responder(401, { message: 'No autorizado.' })
        const indice = estado.productos.findIndex(
          (producto) => String(producto.id) === partes[2]
        )
        if (indice === -1) return responder(404, { message: 'Producto no encontrado.' })
        estado.productos.splice(indice, 1)
        return responder(204, null)
      }
    }

    // ---------- ms-carrito ----------
    if (partes[0] === 'api' && partes[1] === 'carritos') {
      if (!autorizado) return responder(401, { message: 'No autorizado.' })
      const usuarioId = partes[2]

      if (metodo === 'GET' && partes.length === 3) {
        return responder(200, respuestaCarrito(carritoDe(usuarioId)))
      }
      if (metodo === 'DELETE' && partes.length === 3) {
        estado.carritos[usuarioId] = {
          usuarioId: Number(usuarioId),
          items: [],
          cuponCodigo: null,
        }
        return responder(204, null)
      }

      const carrito = carritoDe(usuarioId)

      if (partes[3] === 'items') {
        if (metodo === 'POST' && partes.length === 4) {
          const producto = buscarProducto(cuerpo.productoId)
          if (!producto) return responder(404, { message: 'Producto no encontrado.' })
          const resultado = agregarItem(carrito, producto, cuerpo.cantidad ?? 1)
          if (resultado.error) return resultado.error
          return responder(200, respuestaCarrito(carrito))
        }
        if (metodo === 'PUT' && partes.length === 5) {
          const item = carrito.items.find(
            (linea) => String(linea.productoId) === partes[4]
          )
          if (!item) return responder(404, { message: 'El producto no está en el carrito.' })
          if (cuerpo.cantidad <= 0) {
            carrito.items = carrito.items.filter((linea) => linea !== item)
          } else {
            item.cantidad = cuerpo.cantidad
          }
          return responder(200, respuestaCarrito(carrito))
        }
        if (metodo === 'DELETE' && partes.length === 5) {
          const existe = carrito.items.some(
            (linea) => String(linea.productoId) === partes[4]
          )
          if (!existe) return responder(404, { message: 'El producto no está en el carrito.' })
          carrito.items = carrito.items.filter(
            (linea) => String(linea.productoId) !== partes[4]
          )
          return responder(204, null)
        }
      }

      if (partes[3] === 'cupon') {
        if (metodo === 'POST') {
          const codigo = String(cuerpo.codigo || '').trim().toUpperCase()
          if (!CUPONES[codigo]) {
            return responder(400, {
              message: 'Cupón inválido.',
              detalles: { codigo: 'Cupón inválido.' },
            })
          }
          carrito.cuponCodigo = codigo
          return responder(200, respuestaCarrito(carrito))
        }
        if (metodo === 'DELETE') {
          carrito.cuponCodigo = null
          return responder(200, respuestaCarrito(carrito))
        }
      }
    }

    // ---------- ms-pagos ----------
    if (metodo === 'POST' && pathname === '/api/pagos') {
      if (!autorizado) return responder(401, { message: 'No autorizado.' })
      if (estado.pagosCaidos) {
        return responder(503, { message: 'ms-pagos no está disponible en este momento.' })
      }

      const metodoPago = cuerpo.metodo
      const esTarjeta = metodoPago !== 'TRANSFERENCIA'
      let numero = null

      if (esTarjeta) {
        numero = String(cuerpo.numeroTarjeta || '').replace(/\s/g, '')
        if (!/^\d{16}$/.test(numero)) {
          return responder(400, {
            message: 'El numero de tarjeta debe tener 16 digitos numericos',
            detalles: { campo: 'numeroTarjeta' },
          })
        }
      }

      if (
        estado.pagos.some(
          (pago) => pago.ordenId === cuerpo.ordenId && pago.estado === 'APROBADO'
        )
      ) {
        return responder(409, {
          message: `La orden ${cuerpo.ordenId} ya tiene un pago aprobado`,
        })
      }

      let pagoEstado = 'APROBADO'
      let motivoRechazo = null
      if (numero?.endsWith('0000')) {
        pagoEstado = 'RECHAZADO'
        motivoRechazo = 'Fondos insuficientes'
      } else if (numero?.endsWith('1111')) {
        pagoEstado = 'RECHAZADO'
        motivoRechazo = 'Tarjeta rechazada'
      }

      const pago = {
        id: estado.pagos.length + 1,
        ordenId: cuerpo.ordenId,
        monto: cuerpo.monto,
        metodo: metodoPago,
        ultimosDigitos: numero ? numero.slice(-4) : null,
        estado: pagoEstado,
        codigoTransaccion: `tx-${estado.pagos.length + 1}`,
        motivoRechazo,
        fecha: new Date().toISOString(),
      }
      estado.pagos.push(pago)
      return responder(201, pago)
    }

    return responder(404, { message: `Ruta simulada no implementada: ${metodo} ${pathname}` })
  }

  return { fetch: fetchSimulado, estado, llamadas }
}

/**
 * Reemplaza window.fetch por el backend simulado.
 */
export function instalarBackend(opciones = {}) {
  const backend = crearBackend(opciones)
  window.fetch = backend.fetch
  return backend
}

/**
 * Carrito de prueba listo para sembrar en el backend.
 */
export function carritoConItems(usuarioId, items) {
  return {
    usuarioId,
    cuponCodigo: null,
    items: items.map(({ producto, cantidad }) => ({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      imagen: producto.imagen,
      cantidad,
    })),
  }
}
