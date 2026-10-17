import { renderHook, act } from '@testing-library/react'
import { CarritoProvider, useCarrito } from '../../src/context/CarritoContext'

const wrapper = ({ children }) => <CarritoProvider>{children}</CarritoProvider>

const catan = { id: 'catan', nombre: 'Catan', precio: 29990, imagen: '/img/catan.png' }
const mouse = { id: 'logitech', nombre: 'Mouse Logitech', precio: 49990, imagen: '/img/mouse.png' }

describe('CarritoContext', () => {
  it('empieza vacío', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    expect(result.current.carrito).toEqual([])
    expect(result.current.totalUnidades).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('agrega un producto nuevo con cantidad 1', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.carrito[0]).toMatchObject({ id: 'catan', cantidad: 1 })
  })

  it('suma la cantidad si el producto ya estaba en el carrito', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.carrito[0].cantidad).toBe(2)
  })

  it('calcula el total de unidades y el total en pesos', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
      result.current.agregarAlCarrito(catan)
      result.current.agregarAlCarrito(mouse)
    })
    expect(result.current.totalUnidades).toBe(3)
    expect(result.current.total).toBe(29990 * 2 + 49990)
  })

  it('aumenta y disminuye la cantidad con cambiarCantidad', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    act(() => {
      result.current.cambiarCantidad('catan', 1)
    })
    expect(result.current.carrito[0].cantidad).toBe(2)
    act(() => {
      result.current.cambiarCantidad('catan', -1)
    })
    expect(result.current.carrito[0].cantidad).toBe(1)
  })

  it('elimina el producto cuando la cantidad llega a cero', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    act(() => {
      result.current.cambiarCantidad('catan', -1)
    })
    expect(result.current.carrito).toHaveLength(0)
  })

  it('vacía el carrito completo', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
      result.current.agregarAlCarrito(mouse)
    })
    act(() => {
      result.current.vaciarCarrito()
    })
    expect(result.current.carrito).toEqual([])
  })

  it('guarda el carrito en localStorage', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    const guardado = JSON.parse(localStorage.getItem('carrito'))
    expect(guardado).toHaveLength(1)
    expect(guardado[0].id).toBe('catan')
  })

  it('recupera el carrito guardado al iniciar', () => {
    localStorage.setItem('carrito', JSON.stringify([{ ...catan, cantidad: 4 }]))
    const { result } = renderHook(() => useCarrito(), { wrapper })
    expect(result.current.totalUnidades).toBe(4)
  })
})
