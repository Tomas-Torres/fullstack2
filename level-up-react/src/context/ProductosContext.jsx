import { createContext, useContext, useEffect, useState } from 'react'
import { productosIniciales } from '../data/productosIniciales'

const ProductosContext = createContext()

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem('productos')
    return guardados ? JSON.parse(guardados) : productosIniciales
  })

  useEffect(() => {
    localStorage.setItem('productos', JSON.stringify(productos))
  }, [productos])

  const agregarProducto = (nuevo) => {
    setProductos((prev) => [...prev, { ...nuevo, id: String(Date.now()) }])
  }

  const editarProducto = (id, cambios) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)))
  }

  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProductosContext.Provider value={{ productos, agregarProducto, editarProducto, eliminarProducto }}>
      {children}
    </ProductosContext.Provider>
  )
}

export function useProductos() {
  return useContext(ProductosContext)
}