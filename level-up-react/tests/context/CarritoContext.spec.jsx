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
    expect(result.current.carrito[0]).toEqual(jasmine.objectContaining({ id: 'catan', cantidad: 1 }))
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

  it('no permite agregar más unidades que el stock disponible', () => {
    const conStock = { ...catan, stock: 1 }
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(conStock)
      result.current.agregarAlCarrito(conStock)
    })
    expect(result.current.carrito[0].cantidad).toBe(1)
  })

  it('no supera el stock al aumentar con cambiarCantidad', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito({ ...catan, stock: 2 })
    })
    act(() => {
      result.current.cambiarCantidad('catan', 1)
      result.current.cambiarCantidad('catan', 1)
      result.current.cambiarCantidad('catan', 1)
    })
    expect(result.current.carrito[0].cantidad).toBe(2)
  })

  it('aplica un cupón válido y descuenta del total', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    let respuesta
    act(() => {
      respuesta = result.current.aplicarCupon('gamer20')
    })
    expect(respuesta.ok).toBe(true)
    expect(result.current.cupon).toEqual(jasmine.objectContaining({ codigo: 'GAMER20', porcentaje: 0.2 }))
    expect(result.current.totalDescuento).toBe(Math.round(29990 * 0.2))
    expect(result.current.totalFinal).toBe(29990 - Math.round(29990 * 0.2))
    expect(JSON.parse(localStorage.getItem('cupon')).codigo).toBe('GAMER20')
  })

  it('rechaza un cupón inválido', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
    })
    let respuesta
    act(() => {
      respuesta = result.current.aplicarCupon('NOEXISTE')
    })
    expect(respuesta.ok).toBe(false)
    expect(result.current.cupon).toBeNull()
    expect(result.current.totalDescuento).toBe(0)
  })

  it('vaciarCarrito también limpia el cupón aplicado', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito(catan)
      result.current.aplicarCupon('LEVELUP10')
    })
    act(() => {
      result.current.vaciarCarrito()
    })
    expect(result.current.cupon).toBeNull()
    expect(localStorage.getItem('cupon')).toBeNull()
  })

  it('agrega el producto con su precio de oferta aplicado', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    act(() => {
      result.current.agregarAlCarrito({ ...catan, oferta: 20 })
    })
    expect(result.current.carrito[0].precio).toBe(Math.round(29990 * 0.8))
    expect(result.current.total).toBe(Math.round(29990 * 0.8))
  })
})
