import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../src/context/AuthContext'
import { CarritoProvider, useCarrito } from '../../src/context/CarritoContext'
import { carritoConItems, instalarBackend } from '../fakeBackend'
import { esperarEfectos } from '../utils'

const wrapper = ({ children }) => (
  <AuthProvider>
    <CarritoProvider>{children}</CarritoProvider>
  </AuthProvider>
)

const catan = { id: 'catan', nombre: 'Catan', precio: 29990, imagen: '/img/catan.png' }
const mouse = { id: 'logitech', nombre: 'Mouse Logitech', precio: 49990, imagen: '/img/mouse.png' }

const PRODUCTO_CATAN = { id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png' }

function sembrarSesion() {
  localStorage.setItem('token', 'token-3')
  localStorage.setItem(
    'usuarioActivo',
    JSON.stringify({ id: 3, nombre: 'Cliente Pagos', correo: 'cliente.pagos@levelup.cl', rol: 'cliente' })
  )
}

describe('CarritoContext (modo invitado)', () => {
  it('empieza vacío', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    expect(result.current.carrito).toEqual([])
    expect(result.current.totalUnidades).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('agrega un producto nuevo con cantidad 1', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
    })
    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.carrito[0]).toEqual(jasmine.objectContaining({ id: 'catan', cantidad: 1 }))
  })

  it('suma la cantidad si el producto ya estaba en el carrito', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
      await result.current.agregarAlCarrito(catan)
    })
    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.carrito[0].cantidad).toBe(2)
  })

  it('calcula el total de unidades y el total en pesos', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
      await result.current.agregarAlCarrito(catan)
      await result.current.agregarAlCarrito(mouse)
    })
    expect(result.current.totalUnidades).toBe(3)
    expect(result.current.total).toBe(29990 * 2 + 49990)
  })

  it('aumenta y disminuye la cantidad con cambiarCantidad', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
    })
    await act(async () => {
      await result.current.cambiarCantidad('catan', 1)
    })
    expect(result.current.carrito[0].cantidad).toBe(2)
    await act(async () => {
      await result.current.cambiarCantidad('catan', -1)
    })
    expect(result.current.carrito[0].cantidad).toBe(1)
  })

  it('elimina el producto cuando la cantidad llega a cero', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
      await result.current.cambiarCantidad('catan', -1)
    })
    expect(result.current.carrito).toHaveLength(0)
  })

  it('vacía el carrito completo', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
      await result.current.agregarAlCarrito(mouse)
    })
    await act(async () => {
      await result.current.vaciarCarrito()
    })
    expect(result.current.carrito).toEqual([])
  })

  it('guarda el carrito en localStorage', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
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

  it('no permite agregar más unidades que el stock disponible', async () => {
    const conStock = { ...catan, stock: 1 }
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(conStock)
      await result.current.agregarAlCarrito(conStock)
    })
    expect(result.current.carrito[0].cantidad).toBe(1)
  })

  it('no supera el stock al aumentar con cambiarCantidad', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito({ ...catan, stock: 2 })
    })
    await act(async () => {
      await result.current.cambiarCantidad('catan', 1)
      await result.current.cambiarCantidad('catan', 1)
      await result.current.cambiarCantidad('catan', 1)
    })
    expect(result.current.carrito[0].cantidad).toBe(2)
  })

  it('aplica un cupón válido y descuenta del total', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
    })
    let respuesta
    await act(async () => {
      respuesta = await result.current.aplicarCupon('gamer20')
    })
    expect(respuesta.ok).toBe(true)
    expect(result.current.cupon).toEqual(jasmine.objectContaining({ codigo: 'GAMER20', porcentaje: 0.2 }))
    expect(result.current.totalDescuento).toBe(Math.round(29990 * 0.2))
    expect(result.current.totalFinal).toBe(29990 - Math.round(29990 * 0.2))
    expect(JSON.parse(localStorage.getItem('cupon')).codigo).toBe('GAMER20')
  })

  it('rechaza un cupón inválido', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
    })
    let respuesta
    await act(async () => {
      respuesta = await result.current.aplicarCupon('NOEXISTE')
    })
    expect(respuesta.ok).toBe(false)
    expect(result.current.cupon).toBeNull()
    expect(result.current.totalDescuento).toBe(0)
  })

  it('vaciarCarrito también limpia el cupón aplicado', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito(catan)
      await result.current.aplicarCupon('LEVELUP10')
    })
    await act(async () => {
      await result.current.vaciarCarrito()
    })
    expect(result.current.cupon).toBeNull()
    expect(localStorage.getItem('cupon')).toBeNull()
  })

  it('agrega el producto con su precio de oferta aplicado', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await act(async () => {
      await result.current.agregarAlCarrito({ ...catan, oferta: 20 })
    })
    expect(result.current.carrito[0].precio).toBe(Math.round(29990 * 0.8))
    expect(result.current.total).toBe(Math.round(29990 * 0.8))
  })
})

describe('CarritoContext (con sesión, contra ms-carrito)', () => {
  beforeEach(() => {
    sembrarSesion()
  })

  it('lee el carrito del servidor al iniciar sesión', async () => {
    instalarBackend({
      carritos: {
        3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 2 }]),
      },
    })
    const { result } = renderHook(() => useCarrito(), { wrapper })

    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(2)
    expect(result.current.enApi).toBe(true)
    expect(result.current.total).toBe(59980)
    expect(result.current.carrito[0].id).toBe(1)
  })

  it('agrega un producto llamando a la API', async () => {
    const backend = instalarBackend()
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.enApi).toBe(true)

    await act(async () => {
      await result.current.agregarAlCarrito(PRODUCTO_CATAN, 2)
    })

    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.totalUnidades).toBe(2)
    expect(result.current.mensaje.tipo).toBe('ok')
    expect(backend.llamadas.some((llamada) => llamada.metodo === 'POST')).toBe(true)
  })

  it('actualiza la cantidad en el servidor', async () => {
    instalarBackend({
      carritos: {
        3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 1 }]),
      },
    })
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(1)

    await act(async () => {
      await result.current.cambiarCantidad(1, 1)
    })

    expect(result.current.totalUnidades).toBe(2)
    expect(result.current.total).toBe(59980)
  })

  it('aplica un cupón usando el cálculo del servidor', async () => {
    instalarBackend({
      carritos: {
        3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 2 }]),
      },
    })
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(2)

    let respuesta
    await act(async () => {
      respuesta = await result.current.aplicarCupon('LEVELUP10')
    })

    expect(respuesta.ok).toBe(true)
    expect(result.current.cupon.codigo).toBe('LEVELUP10')
    expect(result.current.totalDescuento).toBe(5998)
    expect(result.current.totalFinal).toBe(53982)
  })

  it('muestra el mensaje del servidor cuando el cupón es inválido', async () => {
    instalarBackend({
      carritos: {
        3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 1 }]),
      },
    })
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(1)

    let respuesta
    await act(async () => {
      respuesta = await result.current.aplicarCupon('NOEXISTE')
    })

    expect(respuesta.ok).toBe(false)
    expect(respuesta.texto).toBe('Cupón inválido.')
  })

  it('quita el cupón y vacía el carrito en el servidor', async () => {
    instalarBackend({
      carritos: {
        3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 1 }]),
      },
    })
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(1)

    await act(async () => {
      await result.current.aplicarCupon('GAMER20')
    })
    expect(result.current.cupon.codigo).toBe('GAMER20')

    await act(async () => {
      await result.current.quitarCupon()
    })
    expect(result.current.cupon).toBeNull()

    await act(async () => {
      await result.current.vaciarCarrito()
    })
    expect(result.current.carrito).toEqual([])
    expect(result.current.totalUnidades).toBe(0)
  })

  it('sube el carrito de invitado al iniciar sesión', async () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([{ id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png', cantidad: 2 }])
    )
    const backend = instalarBackend()
    const { result } = renderHook(() => useCarrito(), { wrapper })

    await esperarEfectos()
    expect(result.current.totalUnidades).toBe(2)
    expect(backend.estado.carritos[3].items).toHaveLength(1)
    expect(backend.estado.carritos[3].items[0].cantidad).toBe(2)
    expect(localStorage.getItem('carrito')).toBeNull()
  })

  it('expone un mensaje de error si ms-carrito no responde', async () => {
    const { result } = renderHook(() => useCarrito(), { wrapper })
    await esperarEfectos()
    expect(result.current.mensaje.tipo).toBe('error')
    expect(result.current.mensaje.texto).toContain('No pudimos conectar')
  })
})
