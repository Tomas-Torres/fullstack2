import { createContext, useContext, useEffect, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id)
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [
        ...prev,
        { id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: 1 },
      ]
    })
  }

  const cambiarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + cambio } : item))
        .filter((item) => item.cantidad > 0)
    )
  }

  const vaciarCarrito = () => setCarrito([])

  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{ carrito, agregarAlCarrito, cambiarCantidad, vaciarCarrito, totalUnidades, total }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}