import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import Checkout from '../../src/pages/Checkout'

function renderCheckout() {
  return renderConProveedores(
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/compra-exitosa" element={<h1>Pantalla de éxito</h1>} />
      <Route path="/compra-fallida" element={<h1>Pantalla de fallo</h1>} />
      <Route path="/productos" element={<h1>Catálogo</h1>} />
    </Routes>,
    { ruta: '/checkout' }
  )
}

function sembrarCarrito() {
  localStorage.setItem(
    'carrito',
    JSON.stringify([{ id: 'catan', nombre: 'Catan', precio: 25492, imagen: '/img/catan.png', cantidad: 2, stock: 10 }])
  )
}

function sembrarSesion() {
  localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Ana Pérez', correo: 'ana@correo.com', rol: 'cliente' }))
  localStorage.setItem(
    'usuarios',
    JSON.stringify([
      { nombre: 'Ana Pérez', correo: 'ana@correo.com', password: 'Clave123!', telefono: '912345678', region: 'metropolitana', comuna: 'Santiago', rol: 'cliente' },
    ])
  )
}

async function llenarFormulario() {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
  await userEvent.type(screen.getByLabelText('Calle'), 'Av. Gamers')
  await userEvent.type(screen.getByLabelText('Número'), '123')
  await userEvent.selectOptions(screen.getByLabelText('Región'), 'metropolitana')
  await userEvent.selectOptions(screen.getByLabelText('Comuna'), 'Santiago')
}

describe('Página Checkout', () => {
  it('muestra un aviso si el carrito está vacío', () => {
    renderCheckout()
    expect(screen.getByRole('heading', { name: 'No hay nada que pagar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/productos')
  })

  it('muestra el formulario con todas las opciones de entrega', () => {
    sembrarCarrito()
    renderCheckout()
    expect(screen.getByRole('heading', { level: 1, name: 'Finalizar compra' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Calle')).toBeInTheDocument()
    expect(screen.getByLabelText('Región')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Despacho a domicilio/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Despacho exprés/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Retiro en tienda/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Simular un error de pago (demo)')).toBeInTheDocument()
  })

  it('muestra el resumen con el subtotal y el total a pagar', () => {
    sembrarCarrito()
    renderCheckout()
    expect(screen.getByRole('heading', { name: 'Resumen de compra' })).toBeInTheDocument()
    expect(screen.getByText('Catan × 2')).toBeInTheDocument()
    expect(screen.getAllByText(/\$50\.984/).length).toBeGreaterThanOrEqual(2) // subtotal y total
    expect(screen.getAllByText(/Gratis/).length).toBeGreaterThanOrEqual(1) // envío sin elegir
  })

  it('marca los campos obligatorios cuando se envía vacío', async () => {
    sembrarCarrito()
    renderCheckout()
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(screen.getByText('Ingresa tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa la calle de tu dirección.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el número de la dirección.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una región.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una comuna.')).toBeInTheDocument()
    expect(screen.getByText('Elige una opción de entrega.')).toBeInTheDocument()
  })

  it('marca error si el teléfono tiene un formato inválido', async () => {
    sembrarCarrito()
    renderCheckout()
    await userEvent.type(screen.getByLabelText('Teléfono (opcional)'), '12345')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(screen.getByText('Formato inválido. Ej: +56 9 1234 5678.')).toBeInTheDocument()
  })

  it('autocompleta la dirección con los datos de la sesión iniciada', () => {
    sembrarCarrito()
    sembrarSesion()
    renderCheckout()
    expect(screen.getByText('Completamos tus datos porque tienes sesión iniciada.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@correo.com')
    expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('912345678')
    expect(screen.getByLabelText('Región')).toHaveValue('metropolitana')
    expect(screen.getByLabelText('Comuna')).toHaveValue('Santiago')
  })

  it('al elegir un envío se agrega su costo al total', async () => {
    sembrarCarrito()
    renderCheckout()
    await userEvent.click(screen.getByRole('radio', { name: /Despacho exprés/ }))
    expect(screen.getAllByText('$4.990').length).toBeGreaterThan(0) // costo exprés
    expect(screen.getByText('$55.974')).toBeInTheDocument() // 50.984 + 4.990
  })

  it('un pago exitoso guarda la orden, vacía el carrito y navega al éxito', async () => {
    sembrarCarrito()
    renderCheckout()
    await llenarFormulario()
    await userEvent.click(screen.getByRole('radio', { name: /Despacho a domicilio/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de éxito' })).toBeInTheDocument()

    const orden = JSON.parse(localStorage.getItem('ultimaCompra'))
    expect(orden.productos).toHaveLength(1)
    expect(orden.direccion.calle).toBe('Av. Gamers')
    expect(orden.direccion.comuna).toBe('Santiago')
    expect(orden.envio).toBe(2990)
    expect(orden.total).toBe(50984 + 2990)
    expect(localStorage.getItem('carrito')).toBe('[]')
  })

  it('con la simulación de error activa navega al fallo sin vaciar el carrito', async () => {
    sembrarCarrito()
    renderCheckout()
    await llenarFormulario()
    await userEvent.click(screen.getByRole('radio', { name: /Retiro en tienda/ }))
    await userEvent.click(screen.getByLabelText('Simular un error de pago (demo)'))
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))

    expect(await screen.findByRole('heading', { name: 'Pantalla de fallo' })).toBeInTheDocument()
    expect(localStorage.getItem('ultimaCompra')).toBeNull()
    expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(1)
  })

  it('permite volver al catálogo desde el carrito vacío', async () => {
    renderCheckout()
    await userEvent.click(screen.getByRole('link', { name: 'Ver catálogo' }))
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
  })
})
