import { createContext, useContext, useEffect, useState } from 'react'
import { precioConOferta } from '../utils/precios'

const CarritoContext = createContext()

// Cupones de descuento aceptados por la tienda.
export const CUPONES = { LEVELUP10: 0.1, GAMER20: 0.2 }

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })

  // El cupón aplicado se persiste junto al carrito.
  const [cupon, setCupon] = useState(() => {
    const guardado = localStorage.getItem('cupon')
    return guardado ? JSON.parse(guardado) : null
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    if (cupon) {
      localStorage.setItem('cupon', JSON.stringify(cupon))
    } else {
      localStorage.removeItem('cupon')
    }
  }, [cupon])

  // Agrega el producto respetando su stock (no supera las unidades disponibles).
  const agregarAlCarrito = (producto) => {
    const precioFinal = precioConOferta(producto)
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id)
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal,
          imagen: producto.imagen,
          cantidad: 1,
          stock: producto.stock,
        },
      ]
    })
  }

  // Ajusta la cantidad (1..stock); al llegar a cero el producto se elimina.
  const cambiarCantidad = (id, cambio) => {
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
  }

  const aplicarCupon = (codigo) => {
    const normalizado = (codigo || '').trim().toUpperCase()
    if (CUPONES[normalizado]) {
      setCupon({ codigo: normalizado, porcentaje: CUPONES[normalizado] })
      return { ok: true, texto: `¡Cupón aplicado! Descuento del ${CUPONES[normalizado] * 100}%.` }
    }
    setCupon(null)
    return { ok: false, texto: 'Cupón inválido.' }
  }

  const vaciarCarrito = () => {
    setCarrito([])
    setCupon(null)
  }

  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const totalDescuento = cupon ? Math.round(total * cupon.porcentaje) : 0
  const totalFinal = total - totalDescuento

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        cupon,
        agregarAlCarrito,
        cambiarCantidad,
        aplicarCupon,
        vaciarCarrito,
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
