// Pruebas de integración: usan el cliente HTTP real del frontend contra un
// backend simulado que respeta los contratos de los microservicios.

import { renderHook, act } from '@testing-library/react'
import { authApi, carritoApi, pagosApi, productosApi, ErrorApi } from '../src/api/cliente'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { CarritoProvider, useCarrito } from '../src/context/CarritoContext'
import { ProductosProvider, useProductos } from '../src/context/ProductosContext'
import { instalarBackend } from './fakeBackend'
import { esperarEfectos } from './utils'

const wrapperCarrito = ({ children }) => (
  <AuthProvider>
    <CarritoProvider>{children}</CarritoProvider>
  </AuthProvider>
)

const wrapperProductos = ({ children }) => (
  <AuthProvider>
    <ProductosProvider>{children}</ProductosProvider>
  </AuthProvider>
)

async function capturarError(promesa) {
  try {
    await promesa
    return null
  } catch (error) {
    return error
  }
}

describe('Integración API ms-login', () => {
  beforeEach(() => {
    instalarBackend()
  })

  it('autentica al administrador y devuelve su JWT', async () => {
    const sesion = await authApi.login('admin@levelup.cl', 'Admin123!')
    expect(sesion).toEqual(
      jasmine.objectContaining({
        id: 1,
        correo: 'admin@levelup.cl',
        rol: 'ADMIN',
        token: jasmine.any(String),
      })
    )
  })

  it('traduce el 404 de correo inexistente a ErrorApi con campo', async () => {
    const error = await capturarError(authApi.login('nadie@levelup.cl', 'Clave123!'))
    expect(error instanceof ErrorApi).toBe(true)
    expect(error.estado).toBe(404)
    expect(error.detalles.campo).toBe('correo')
    expect(error.message).toBe('No existe una cuenta con este correo.')
  })

  it('registra un usuario y luego permite iniciar sesión', async () => {
    await authApi.registro({
      nombre: 'Ana Pérez',
      correo: 'ana@levelup.cl',
      password: 'Clave123!',
      telefono: '912345678',
      region: 'metropolitana',
      comuna: 'Santiago',
    })
    const sesion = await authApi.login('ana@levelup.cl', 'Clave123!')
    expect(sesion.correo).toBe('ana@levelup.cl')
    expect(sesion.token).toBeTruthy()
  })
})

describe('Integración API ms-productos', () => {
  it('lista el catálogo público con precios finales', async () => {
    instalarBackend()
    const productos = await productosApi.listar()
    expect(productos).toHaveLength(8)
    const carcassonne = productos.find((p) => p.id === 2)
    expect(carcassonne.descuento).toBe(15)
    expect(carcassonne.precioFinal).toBe(21242)
  })

  it('rechaza crear un producto sin JWT', async () => {
    instalarBackend()
    const error = await capturarError(
      productosApi.crear(null, {
        nombre: 'Sin token', categoriaId: 1, atributo: 'x',
        precio: 1000, descuento: 0, stock: 1, imagen: '/img/x.png',
      })
    )
    expect(error.estado).toBe(401)
  })

  it('informa de forma legible cuando ms-productos está caído', async () => {
    instalarBackend({ caido: true })
    const error = await capturarError(productosApi.listar())
    expect(error.estado).toBe(503)
    expect(error.message).toContain('ms-productos')
  })

  it('crea, edita y elimina un producto con JWT de administrador', async () => {
    const backend = instalarBackend()
    const token = 'token-1'

    const creado = await productosApi.crear(token, {
      nombre: 'Teclado Pro', categoriaId: 2, atributo: 'Mecánico',
      precio: 39990, descuento: 0, stock: 5, imagen: '/img/teclado.png',
    })
    expect(creado.nombre).toBe('Teclado Pro')
    expect(creado.categoriaNombre).toBe('Accesorios')

    const editado = await productosApi.actualizar(token, creado.id, {
      ...creado, precio: 34990, descuento: 10,
    })
    expect(editado.precio).toBe(34990)
    expect(editado.descuento).toBe(10)

    await productosApi.eliminar(token, creado.id)
    expect(backend.estado.productos.some((p) => p.id === creado.id)).toBe(false)
  })

  it('el contexto de productos pinta el catálogo de la API', async () => {
    instalarBackend()
    const { result } = renderHook(() => useProductos(), { wrapper: wrapperProductos })
    await esperarEfectos()
    expect(result.current.productos).toHaveLength(8)
    expect(result.current.categorias.length).toBeGreaterThanOrEqual(6)
    expect(result.current.error).toBe('')
  })
})

describe('Integración frontend + ms-carrito', () => {
  it('sube el carrito de invitado al iniciar sesión', async () => {
    const backend = instalarBackend()
    const { result } = renderHook(
      () => ({ auth: useAuth(), carrito: useCarrito() }),
      { wrapper: wrapperCarrito }
    )

    await act(async () => {
      await result.current.carrito.agregarAlCarrito(
        { id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png', stock: 10 },
        2
      )
    })
    expect(result.current.carrito.carrito).toHaveLength(1)

    await act(async () => {
      await result.current.auth.login('cliente.pagos@levelup.cl', 'Cliente123!')
    })

    await esperarEfectos()
    expect(result.current.carrito.enApi).toBe(true)
    expect(result.current.carrito.totalUnidades).toBe(2)
    expect(backend.estado.carritos[3].items).toHaveLength(1)
    expect(backend.estado.carritos[3].items[0].cantidad).toBe(2)
  })

  it('calcula cupones y totales en el servidor', async () => {
    localStorage.setItem('token', 'token-3')
    localStorage.setItem(
      'usuarioActivo',
      JSON.stringify({ id: 3, nombre: 'Cliente Pagos', correo: 'cliente.pagos@levelup.cl', rol: 'cliente' })
    )
    instalarBackend()

    const { result } = renderHook(() => useCarrito(), { wrapper: wrapperCarrito })
    await esperarEfectos()
    expect(result.current.enApi).toBe(true)

    await act(async () => {
      await result.current.agregarAlCarrito(
        { id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png' },
        2
      )
    })
    await act(async () => {
      await result.current.aplicarCupon('LEVELUP10')
    })

    expect(result.current.total).toBe(59980)
    expect(result.current.totalDescuento).toBe(5998)
    expect(result.current.totalFinal).toBe(53982)
  })

  it('traduce el cupón inválido de ms-carrito a ErrorApi con detalles', async () => {
    instalarBackend()
    const error = await capturarError(carritoApi.aplicarCupon(3, 'token-3', 'NOEXISTE'))
    expect(error.estado).toBe(400)
    expect(error.message).toBe('Cupón inválido.')
    expect(error.detalles.codigo).toBe('Cupón inválido.')
  })
})

describe('Integración API ms-pagos', () => {
  beforeEach(() => {
    instalarBackend()
  })

  it('aprueba una tarjeta válida y guarda solo los últimos 4 dígitos', async () => {
    const pago = await pagosApi.registrar('token-3', {
      ordenId: 1001,
      monto: 29990,
      metodo: 'TARJETA_CREDITO',
      numeroTarjeta: '4111111111111234',
    })
    expect(pago.estado).toBe('APROBADO')
    expect(pago.ultimosDigitos).toBe('1234')
    expect(pago.motivoRechazo).toBeNull()
  })

  it('rechaza tarjetas terminadas en 0000 y 1111 con su motivo', async () => {
    const sinFondos = await pagosApi.registrar('token-3', {
      ordenId: 1002, monto: 29990, metodo: 'TARJETA_DEBITO', numeroTarjeta: '4111111111110000',
    })
    expect(sinFondos.estado).toBe('RECHAZADO')
    expect(sinFondos.motivoRechazo).toBe('Fondos insuficientes')

    const rechazada = await pagosApi.registrar('token-3', {
      ordenId: 1003, monto: 29990, metodo: 'TARJETA_CREDITO', numeroTarjeta: '4111111111111111',
    })
    expect(rechazada.estado).toBe('RECHAZADO')
    expect(rechazada.motivoRechazo).toBe('Tarjeta rechazada')
  })

  it('aprueba la transferencia sin tarjeta', async () => {
    const pago = await pagosApi.registrar('token-3', {
      ordenId: 1004, monto: 29990, metodo: 'TRANSFERENCIA',
    })
    expect(pago.estado).toBe('APROBADO')
    expect(pago.ultimosDigitos).toBeNull()
  })

  it('exige un JWT para registrar el cobro', async () => {
    const error = await capturarError(
      pagosApi.registrar(null, { ordenId: 1005, monto: 1000, metodo: 'TRANSFERENCIA' })
    )
    expect(error.estado).toBe(401)
  })
})
