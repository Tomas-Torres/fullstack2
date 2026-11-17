import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import Checkout from '../../src/pages/Checkout'
import { carritoConItems, instalarBackend } from '../fakeBackend'

const PRODUCTO_CATAN = { id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png' }

function renderCheckout() {
  return renderConProveedores(
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/compra-exitosa" element={<h1>Pantalla de éxito</h1>} />
      <Route path="/compra-fallida" element={<h1>Pantalla de fallo</h1>} />
      <Route path="/productos" element={<h1>Catálogo</h1>} />
      <Route path="/login" element={<h1>Pantalla de login</h1>} />
      <Route path="/registro" element={<h1>Pantalla de registro</h1>} />
    </Routes>,
    { ruta: '/checkout' }
  )
}

function sembrarSesion(extra = {}) {
  localStorage.setItem('token', 'token-3')
  localStorage.setItem(
    'usuarioActivo',
    JSON.stringify({
      id: 3,
      nombre: 'Cliente Pagos',
      correo: 'cliente.pagos@levelup.cl',
      rol: 'cliente',
      telefono: '912345678',
      region: 'metropolitana',
      comuna: 'Santiago',
      ...extra,
    })
  )
}

function sembrarCarritoEnBackend(opciones = {}) {
  return instalarBackend({
    carritos: {
      3: carritoConItems(3, [{ producto: PRODUCTO_CATAN, cantidad: 2 }]),
    },
    ...opciones,
  })
}

async function completarDireccion() {
  await userEvent.type(screen.getByLabelText('Calle'), 'Av. Gamers')
  await userEvent.type(screen.getByLabelText('Número'), '123')
}

describe('Página Checkout', () => {
  it('muestra un aviso si el carrito está vacío', () => {
    renderCheckout()
    expect(screen.getByRole('heading', { name: 'No hay nada que pagar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/productos')
  })

  it('pide iniciar sesión para pagar si hay productos pero no hay sesión', () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([{ id: 1, nombre: 'Catan', precio: 29990, imagen: '/img/catan.png', cantidad: 1 }])
    )
    renderCheckout()
    expect(screen.getByRole('heading', { name: 'Inicia sesión para pagar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
  })

  it('muestra el formulario con las opciones de entrega y de pago', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    expect(screen.getByRole('heading', { level: 1, name: 'Finalizar compra' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Calle')).toBeInTheDocument()
    expect(screen.getByLabelText('Región')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Despacho a domicilio/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Despacho exprés/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Retiro en tienda/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Tarjeta de crédito/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Transferencia bancaria/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument()
  })

  it('muestra el resumen con el subtotal y el total a pagar', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    expect(screen.getByRole('heading', { name: 'Resumen de compra' })).toBeInTheDocument()
    expect(screen.getAllByText(/\$59\.980/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText(/Gratis/).length).toBeGreaterThanOrEqual(1)
  })

  it('marca los campos obligatorios cuando se envía vacío', async () => {
    sembrarSesion({ nombre: '', correo: '', telefono: '', region: '', comuna: '' })
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(screen.getByText('Ingresa tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa la calle de tu dirección.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el número de la dirección.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una región.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una comuna.')).toBeInTheDocument()
    expect(screen.getByText('Elige una opción de entrega.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa los 16 dígitos de tu tarjeta.')).toBeInTheDocument()
  })

  it('marca error si el teléfono tiene un formato inválido', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    const telefono = screen.getByLabelText('Teléfono (opcional)')
    await userEvent.clear(telefono)
    await userEvent.type(telefono, '12345')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(screen.getByText('Formato inválido. Ej: +56 9 1234 5678.')).toBeInTheDocument()
  })

  it('autocompleta la dirección con los datos de la sesión iniciada', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    expect(screen.getByText('Completamos tus datos porque tienes sesión iniciada.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Cliente Pagos')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('cliente.pagos@levelup.cl')
    expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('912345678')
    expect(screen.getByLabelText('Región')).toHaveValue('metropolitana')
    expect(screen.getByLabelText('Comuna')).toHaveValue('Santiago')
  })

  it('al elegir un envío se agrega su costo al total', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await userEvent.click(screen.getByRole('radio', { name: /Despacho exprés/ }))
    expect(screen.getAllByText('$4.990').length).toBeGreaterThan(0)
    expect(screen.getByText('$64.970')).toBeInTheDocument() // 59.980 + 4.990
  })

  it('un pago aprobado guarda la orden, vacía el carrito y navega al éxito', async () => {
    sembrarSesion()
    const backend = sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Despacho a domicilio/ }))
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4111111111111234')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de éxito' })).toBeInTheDocument()

    const orden = JSON.parse(localStorage.getItem('ultimaCompra'))
    expect(orden.productos).toHaveLength(1)
    expect(orden.direccion.calle).toBe('Av. Gamers')
    expect(orden.direccion.comuna).toBe('Santiago')
    expect(orden.envio).toBe(2990)
    expect(orden.total).toBe(62970)
    expect(orden.pago.estado).toBe('APROBADO')
    expect(orden.pago.ultimosDigitos).toBe('1234')

    expect(backend.estado.carritos[3].items).toHaveLength(0)
  })

  it('una tarjeta rechazada lleva al fallo y conserva el carrito', async () => {
    sembrarSesion()
    const backend = sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4111111111111111')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de fallo' })).toBeInTheDocument()
    expect(localStorage.getItem('ultimaCompra')).toBeNull()
    expect(JSON.parse(localStorage.getItem('ultimoPagoRechazado')).motivo).toBe('Tarjeta rechazada')
    expect(backend.estado.carritos[3].items).toHaveLength(1)
  })

  it('una tarjeta sin fondos también se rechaza', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4111111111110000')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de fallo' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ultimoPagoRechazado')).motivo).toBe('Fondos insuficientes')
  })

  it('la transferencia se aprueba sin número de tarjeta', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.click(screen.getByRole('radio', { name: /Transferencia bancaria/ }))
    expect(screen.queryByLabelText('Número de tarjeta')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de éxito' })).toBeInTheDocument()
    const orden = JSON.parse(localStorage.getItem('ultimaCompra'))
    expect(orden.pago.metodo).toBe('TRANSFERENCIA')
    expect(orden.pago.ultimosDigitos).toBeNull()
  })

  it('valida el largo de la tarjeta antes de llamar a ms-pagos', async () => {
    sembrarSesion()
    const backend = sembrarCarritoEnBackend()
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '1234')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(screen.getByText('Ingresa los 16 dígitos de tu tarjeta.')).toBeInTheDocument()
    expect(backend.llamadas.some((llamada) => llamada.pathname === '/api/pagos')).toBe(false)
  })

  it('muestra el error de ms-pagos y no navega si el servicio falla', async () => {
    sembrarSesion()
    sembrarCarritoEnBackend({ pagosCaidos: true })
    renderCheckout()
    await screen.findByText('Catan × 2')

    await completarDireccion()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4111111111111234')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByText('ms-pagos no está disponible en este momento.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Finalizar compra' })).toBeInTheDocument()
  })

  it('permite volver al catálogo desde el carrito vacío', async () => {
    renderCheckout()
    await userEvent.click(screen.getByRole('link', { name: 'Ver catálogo' }))
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
  })
})
