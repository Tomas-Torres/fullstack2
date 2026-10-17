import { renderHook, act } from '@testing-library/react'
import { ProductosProvider, useProductos } from '../../src/context/ProductosContext'
import { productosIniciales } from '../../src/data/productosIniciales'

const wrapper = ({ children }) => <ProductosProvider>{children}</ProductosProvider>

const nuevoProducto = {
  nombre: 'Teclado Pro',
  categoria: 'Accesorios',
  atributo: 'Mecánico',
  precio: 39990,
  stock: 3,
  imagen: '/img/teclado.png',
}

describe('ProductosContext', () => {
  it('carga los productos iniciales si localStorage está vacío', () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    expect(result.current.productos).toHaveLength(productosIniciales.length)
  })

  it('usa los productos guardados en localStorage si existen', () => {
    localStorage.setItem('productos', JSON.stringify([{ id: 'x', nombre: 'Solo uno', precio: 1, stock: 1 }]))
    const { result } = renderHook(() => useProductos(), { wrapper })
    expect(result.current.productos).toHaveLength(1)
    expect(result.current.productos[0].nombre).toBe('Solo uno')
  })

  it('crea un producto nuevo y lo guarda en localStorage', () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    act(() => {
      result.current.agregarProducto(nuevoProducto)
    })
    expect(result.current.productos).toHaveLength(productosIniciales.length + 1)

    const guardados = JSON.parse(localStorage.getItem('productos'))
    expect(guardados.some((p) => p.nombre === 'Teclado Pro')).toBe(true)
  })

  it('le asigna un id al producto nuevo', () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    act(() => {
      result.current.agregarProducto(nuevoProducto)
    })
    const creado = result.current.productos.find((p) => p.nombre === 'Teclado Pro')
    expect(creado.id).toBeTruthy()
  })

  it('edita solo el producto indicado', () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    act(() => {
      result.current.editarProducto('catan', { precio: 1000 })
    })
    expect(result.current.productos.find((p) => p.id === 'catan').precio).toBe(1000)
    expect(result.current.productos.find((p) => p.id === 'carcassonne').precio).toBe(24990)
  })

  it('elimina el producto indicado', () => {
    const { result } = renderHook(() => useProductos(), { wrapper })
    act(() => {
      result.current.eliminarProducto('catan')
    })
    expect(result.current.productos).toHaveLength(productosIniciales.length - 1)
    expect(result.current.productos.some((p) => p.id === 'catan')).toBe(false)
  })
})
