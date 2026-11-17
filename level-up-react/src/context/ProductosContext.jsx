import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { productosApi } from '../api/cliente'
import { productoDesdeApi, productoParaApi } from '../api/mapeo'
import { categoriasIniciales, productosIniciales } from '../data/ProductosIniciales'
import { useAuth } from './AuthContext'

const ProductosContext = createContext()

/**
 * Catalogo real de ms-productos. Arranca con una copia local para pintar la
 * tienda al instante y luego se sincroniza con la API.
 */
export function ProductosProvider({ children }) {
  const { token } = useAuth()
  const [productos, setProductos] = useState(productosIniciales)
  const [categorias, setCategorias] = useState(categoriasIniciales)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [lista, listaCategorias] = await Promise.all([
        productosApi.listar(),
        productosApi.categorias(),
      ])
      if (Array.isArray(lista)) {
        setProductos(lista.map(productoDesdeApi))
      }
      if (Array.isArray(listaCategorias)) {
        setCategorias(listaCategorias.map(({ id, nombre }) => ({ id, nombre })))
      }
      setError('')
    } catch (fallo) {
      // Sin backend la tienda sigue mostrando el catalogo local.
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  /**
   * Devuelve el id de la categoria indicada, creandola si aun no existe.
   */
  const resolverCategoria = async (nombre, categoriaId) => {
    if (categoriaId) return categoriaId
    const existente = categorias.find(
      (categoria) => categoria.nombre.toLowerCase() === String(nombre).toLowerCase()
    )
    if (existente) return existente.id

    const creada = await productosApi.crearCategoria(token, nombre)
    setCategorias((prev) => [...prev, { id: creada.id, nombre: creada.nombre }])
    return creada.id
  }

  const agregarProducto = async (datos) => {
    try {
      const categoriaId = await resolverCategoria(datos.categoria, datos.categoriaId)
      const creado = await productosApi.crear(
        token,
        productoParaApi({ ...datos, categoriaId })
      )
      const producto = productoDesdeApi(creado)
      setProductos((prev) => [producto, ...prev])
      return { ok: true, producto }
    } catch (fallo) {
      return { ok: false, mensaje: fallo.message }
    }
  }

  const editarProducto = async (id, cambios) => {
    const actual = productos.find((producto) => producto.id === id)
    try {
      const categoriaId = await resolverCategoria(
        cambios.categoria ?? actual?.categoria,
        cambios.categoriaId ?? actual?.categoriaId
      )
      const actualizado = await productosApi.actualizar(
        token,
        id,
        productoParaApi({ ...actual, ...cambios, categoriaId })
      )
      const producto = productoDesdeApi(actualizado)
      setProductos((prev) => prev.map((item) => (item.id === id ? producto : item)))
      return { ok: true, producto }
    } catch (fallo) {
      return { ok: false, mensaje: fallo.message }
    }
  }

  const eliminarProducto = async (id) => {
    try {
      await productosApi.eliminar(token, id)
      setProductos((prev) => prev.filter((producto) => producto.id !== id))
      return { ok: true }
    } catch (fallo) {
      return { ok: false, mensaje: fallo.message }
    }
  }

  return (
    <ProductosContext.Provider
      value={{
        productos,
        categorias,
        cargando,
        error,
        cargar,
        agregarProducto,
        editarProducto,
        eliminarProducto,
      }}
    >
      {children}
    </ProductosContext.Provider>
  )
}

export function useProductos() {
  return useContext(ProductosContext)
}
