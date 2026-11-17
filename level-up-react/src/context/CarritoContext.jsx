import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { carritoApi } from '../api/cliente'
import { carritoDesdeApi } from '../api/mapeo'
import { precioConOferta } from '../utils/precios'
import { useAuth } from './AuthContext'

const CarritoContext = createContext()

// Cupones de descuento aceptados por la tienda (deben coincidir con el enum
// Cupon de ms-carrito).
export const CUPONES = { LEVELUP10: 0.1, GAMER20: 0.2 }

const leerCarritoLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || []
  } catch {
    return []
  }
}

const leerCuponLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('cupon')) || null
  } catch {
    return null
  }
}

/**
 * Carrito de la tienda.
 *
 * - Con sesión iniciada usa ms-carrito (fuente de verdad: stock, cupones y
 *   totales calculados en el servidor).
 * - Sin sesión funciona en modo invitado con localStorage para que el
 *   visitante pueda armar su carrito antes de registrarse. Al iniciar sesión
 *   esos productos se envían al servidor.
 */
export function CarritoProvider({ children }) {
  const auth = useAuth() || {}
  const { token, usuarioActivo } = auth

  const [carrito, setCarrito] = useState(leerCarritoLocal)
  const [cupon, setCupon] = useState(leerCuponLocal)
  const [totales, setTotales] = useState(null)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [sincronizando, setSincronizando] = useState(false)
  const sesionPrevia = useRef(Boolean(token))

  // Persistencia del modo invitado. Con sesión manda el servidor.
  useEffect(() => {
    if (!token) localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito, token])

  useEffect(() => {
    if (!token) {
      if (cupon) {
        localStorage.setItem('cupon', JSON.stringify(cupon))
      } else {
        localStorage.removeItem('cupon')
      }
    }
  }, [cupon, token])

  const aplicarRespuesta = (respuesta) => {
    const estado = carritoDesdeApi(respuesta)
    setCarrito(estado.items)
    setCupon(estado.cupon)
    setTotales({
      totalUnidades: estado.totalUnidades,
      subtotal: estado.subtotal,
      descuento: estado.descuento,
      total: estado.total,
    })
  }

  const vaciarEstado = () => {
    setCarrito([])
    setCupon(null)
    setTotales(null)
    setMensaje({ tipo: '', texto: '' })
  }

  /**
   * Al iniciar sesión sube el carrito de invitado y luego lee el carrito real.
   * Al cerrar sesión se limpia para no mostrar el carrito de otra cuenta.
   */
  useEffect(() => {
    const habiaSesion = sesionPrevia.current
    sesionPrevia.current = Boolean(token)
    if (!token) {
      if (habiaSesion) vaciarEstado()
      return
    }
    if (!usuarioActivo?.id) return

    let vigente = true
    const sincronizar = async () => {
      setSincronizando(true)
      try {
        const invitado = leerCarritoLocal()
        if (invitado.length > 0) {
          for (const item of invitado) {
            try {
              await carritoApi.agregar(usuarioActivo.id, token, item.id, item.cantidad)
            } catch {
              // Si un producto ya no existe o no tiene stock, se omite.
            }
          }
          localStorage.removeItem('carrito')
          localStorage.removeItem('cupon')
        }
        const respuesta = await carritoApi.obtener(usuarioActivo.id, token)
        if (vigente) aplicarRespuesta(respuesta)
      } catch (fallo) {
        if (vigente) setMensaje({ tipo: 'error', texto: fallo.message })
      } finally {
        if (vigente) setSincronizando(false)
      }
    }
    sincronizar()

    return () => {
      vigente = false
    }
  }, [token, usuarioActivo?.id])

  /**
   * Agrega el producto respetando su stock (no supera las unidades disponibles).
   */
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    if (token && usuarioActivo?.id) {
      try {
        const respuesta = await carritoApi.agregar(usuarioActivo.id, token, producto.id, cantidad)
        aplicarRespuesta(respuesta)
        setMensaje({ tipo: 'ok', texto: `${producto.nombre} se agregó al carrito.` })
        return { ok: true }
      } catch (fallo) {
        setMensaje({ tipo: 'error', texto: fallo.message })
        return { ok: false, mensaje: fallo.message }
      }
    }

    const precio = precioConOferta(producto)
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id)
      if (existe) {
        const tope = typeof producto.stock === 'number' ? producto.stock : Infinity
        if (existe.cantidad >= tope) return prev
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio,
          imagen: producto.imagen,
          cantidad,
          stock: producto.stock,
        },
      ]
    })
    return { ok: true }
  }

  /**
   * Ajusta la cantidad (1..stock); al llegar a cero el producto se elimina.
   */
  const cambiarCantidad = async (id, cambio) => {
    if (token && usuarioActivo?.id) {
      const item = carrito.find((linea) => linea.id === id)
      const nueva = Math.max(0, (item?.cantidad ?? 0) + cambio)
      try {
        const respuesta = await carritoApi.actualizar(usuarioActivo.id, token, id, nueva)
        aplicarRespuesta(respuesta)
        return { ok: true }
      } catch (fallo) {
        setMensaje({ tipo: 'error', texto: fallo.message })
        return { ok: false, mensaje: fallo.message }
      }
    }

    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item
          const nueva = item.cantidad + cambio
          const tope = typeof item.stock === 'number' ? item.stock : Infinity
          return { ...item, cantidad: Math.min(nueva, tope) }
        })
        .filter((item) => item.cantidad > 0)
    )
    return { ok: true }
  }

  /**
   * Aplica un cupón. Devuelve `{ok, texto}` para que la página muestre el
   * mensaje sin conocer si el cálculo lo hizo el servidor o el navegador.
   */
  const aplicarCupon = async (codigo) => {
    if (token && usuarioActivo?.id) {
      try {
        const respuesta = await carritoApi.aplicarCupon(usuarioActivo.id, token, codigo)
        aplicarRespuesta(respuesta)
        const porcentaje = (carritoDesdeApi(respuesta).cupon?.porcentaje ?? 0) * 100
        return { ok: true, texto: `¡Cupón aplicado! Descuento del ${porcentaje}%.` }
      } catch (fallo) {
        return { ok: false, texto: fallo.message }
      }
    }

    const normalizado = (codigo || '').trim().toUpperCase()
    if (CUPONES[normalizado]) {
      setCupon({ codigo: normalizado, porcentaje: CUPONES[normalizado] })
      return { ok: true, texto: `¡Cupón aplicado! Descuento del ${CUPONES[normalizado] * 100}%.` }
    }
    setCupon(null)
    return { ok: false, texto: 'Cupón inválido.' }
  }

  const quitarCupon = async () => {
    if (token && usuarioActivo?.id) {
      try {
        aplicarRespuesta(await carritoApi.quitarCupon(usuarioActivo.id, token))
      } catch (fallo) {
        setMensaje({ tipo: 'error', texto: fallo.message })
      }
      return
    }
    setCupon(null)
  }

  const vaciarCarrito = async () => {
    if (token && usuarioActivo?.id) {
      try {
        await carritoApi.vaciar(usuarioActivo.id, token)
      } catch (fallo) {
        setMensaje({ tipo: 'error', texto: fallo.message })
      }
      setCarrito([])
      setCupon(null)
      setTotales(null)
      return
    }
    vaciarEstado()
  }

  const totalUnidadesLocal = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  const subtotalLocal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const descuentoLocal = cupon ? Math.round(subtotalLocal * cupon.porcentaje) : 0

  const enApi = Boolean(token && totales)
  const totalUnidades = enApi ? totales.totalUnidades : totalUnidadesLocal
  const total = enApi ? totales.subtotal : subtotalLocal
  const totalDescuento = enApi ? totales.descuento : descuentoLocal
  const totalFinal = enApi ? totales.total : subtotalLocal - descuentoLocal

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        cupon,
        mensaje,
        sincronizando,
        enApi,
        agregarAlCarrito,
        cambiarCantidad,
        aplicarCupon,
        quitarCupon,
        vaciarCarrito,
        limpiarMensaje: () => setMensaje({ tipo: '', texto: '' }),
        totalUnidades,
        total,
        totalDescuento,
        totalFinal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}
