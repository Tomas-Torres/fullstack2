import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../src/context/AuthContext'
import { ProductosProvider, useProductos } from '../../src/context/ProductosContext'
import { productosIniciales } from '../../src/data/ProductosIniciales'
import { instalarBackend } from '../fakeBackend'
import { esperarEfectos } from '../utils'

const wrapper = ({ children }) => (
  <AuthProvider>
    <ProductosProvider>{children}</ProductosProvider>
  </AuthProvider>
)

const nuevoProducto = {
  nombre: 'Teclado Pro',
  categoria: 'Accesorios',
  atributo: 'Mecánico',
  precio: 39990,
  stock: 3,
  imagen: '/img/teclado.png',
}

describe('ProductosContext', () => {
  it('sin backend mantiene el catálogo local y expone el error', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    expect(result.current.productos).toHaveLength(productosIniciales.length)
    await esperarEfectos()
    expect(result.current.error).not.toBe('')
    expect(result.current.productos[0].nombre).toBe('Catan')
  })

  it('con backend reemplaza el catálogo y traduce los campos de la API', async () => {
    instalarBackend({
      productos: [
        {
          id: 10, nombre: 'Solo uno', categoriaId: 2, categoriaNombre: 'Accesorios',
          atributo: 'Único', precio: 1000, descuento: 25, precioFinal: 750,
          stock: 4, imagen: '/img/uno.png', activo: true,
        },
      ],
    })
    const { result } = renderHook(() => useProductos(), { wrapper })

    await esperarEfectos()
    expect(result.current.productos).toHaveLength(1)
    expect(result.current.productos[0]).toEqual(
      jasmine.objectContaining({
        id: 10,
        nombre: 'Solo uno',
        categoria: 'Accesorios',
        oferta: 25,
        stock: 4,
      })
    )
  })

  it('carga las categorías reales de ms-productos', async () => {
    instalarBackend({ categorias: [{ id: 1, nombre: 'Juegos de Mesa' }, { id: 7, nombre: 'Teclados' }] })
    const { result } = renderHook(() => useProductos(), { wrapper })

    await esperarEfectos()
    expect(result.current.categorias).toHaveLength(2)
    expect(result.current.categorias[1].nombre).toBe('Teclados')
  })

  it('crea un producto nuevo en la API y lo agrega al estado', async () => {
    localStorage.setItem('token', 'token-1')
    localStorage.setItem('usuarioActivo', JSON.stringify({ id: 1, nombre: 'Administrador', correo: 'admin@levelup.cl', rol: 'admin' }))
    const backend = instalarBackend()

    const { result } = renderHook(() => useProductos(), { wrapper })
    await waitFor(() => expect(result.current.productos).toHaveLength(productosIniciales.length))

    let respuesta
    await act(async () => {
      respuesta = await result.current.agregarProducto(nuevoProducto)
    })

    expect(respuesta.ok).toBe(true)
    expect(result.current.productos).toHaveLength(productosIniciales.length + 1)
    expect(typeof respuesta.producto.id).toBe('number')
    expect(backend.estado.productos.some((p) => p.nombre === 'Teclado Pro')).toBe(true)
  })

  it('edita solo el producto indicado', async () => {
    localStorage.setItem('token', 'token-1')
    instalarBackend()
    const { result } = renderHook(() => useProductos(), { wrapper })
    await waitFor(() => expect(result.current.productos).toHaveLength(productosIniciales.length))

    let respuesta
    await act(async () => {
      respuesta = await result.current.editarProducto(1, { precio: 1000 })
    })

    expect(respuesta.ok).toBe(true)
    expect(result.current.productos.find((p) => p.id === 1).precio).toBe(1000)
    expect(result.current.productos.find((p) => p.id === 2).precio).toBe(24990)
  })

  it('elimina el producto indicado', async () => {
    localStorage.setItem('token', 'token-1')
    instalarBackend()
    const { result } = renderHook(() => useProductos(), { wrapper })
    await waitFor(() => expect(result.current.productos).toHaveLength(productosIniciales.length))

    let respuesta
    await act(async () => {
      respuesta = await result.current.eliminarProducto(1)
    })

    expect(respuesta.ok).toBe(true)
    expect(result.current.productos).toHaveLength(productosIniciales.length - 1)
    expect(result.current.productos.some((p) => p.id === 1)).toBe(false)
  })

  it('devuelve un error legible cuando la API falla al crear', async () => {
    localStorage.setItem('token', 'token-1')
    instalarBackend({ caido: true })
    const { result } = renderHook(() => useProductos(), { wrapper })

    let respuesta
    await act(async () => {
      respuesta = await result.current.agregarProducto(nuevoProducto)
    })

    expect(respuesta.ok).toBe(false)
    expect(respuesta.mensaje).toContain('ms-productos')
  })
})
