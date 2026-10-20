import { screen } from '@testing-library/react'
import { renderConProveedores } from '../utils'
import CompraExitosa from '../../src/pages/CompraExitosa'

const orden = {
  numero: 'LV-1234567890',
  fecha: '15/10/2026, 10:30:00',
  productos: [
    { id: 'catan', nombre: 'Catan', precio: 25492, cantidad: 2 },
    { id: 'logitech', nombre: 'Mouse Logitech G502 HERO', precio: 49990, cantidad: 1 },
  ],
  subtotal: 100974,
  descuento: 10097,
  cupon: 'LEVELUP10',
  envio: 2990,
  total: 93867,
  direccion: {
    nombre: 'Ana Pérez',
    correo: 'ana@correo.com',
    telefono: '912345678',
    calle: 'Av. Gamers',
    numero: '123',
    region: 'metropolitana',
    comuna: 'Santiago',
  },
  entrega: 'Despacho a domicilio (2-3 días hábiles)',
}

function sembrarOrden(o) {
  localStorage.setItem('ultimaCompra', JSON.stringify(o))
}

describe('Página Compra Exitosa', () => {
  it('muestra el mensaje de éxito con el nombre y correo del comprador', () => {
    sembrarOrden(orden)
    renderConProveedores(<CompraExitosa />)
    expect(screen.getByRole('heading', { level: 1, name: '¡Compra realizada con éxito!' })).toBeInTheDocument()
    expect(screen.getByText(/Gracias por tu compra, Ana Pérez/)).toBeInTheDocument()
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
  })

  it('muestra el resumen con productos, descuento, envío y total', () => {
    sembrarOrden(orden)
    renderConProveedores(<CompraExitosa />)
    expect(screen.getByRole('heading', { name: 'Resumen de compra' })).toBeInTheDocument()
    expect(screen.getByText(/LV-1234567890/)).toBeInTheDocument()
    expect(screen.getByText('Catan × 2')).toBeInTheDocument()
    expect(screen.getByText('$50.984')).toBeInTheDocument()
    expect(screen.getByText('Cupón LEVELUP10:')).toBeInTheDocument()
    expect(screen.getByText('-$10.097')).toBeInTheDocument()
    expect(screen.getByText(/Envío \(Despacho a domicilio/)).toBeInTheDocument()
    expect(screen.getByText('$2.990')).toBeInTheDocument()
    expect(screen.getByText('$93.867')).toBeInTheDocument()
  })

  it('muestra la dirección de entrega y la fecha', () => {
    sembrarOrden(orden)
    renderConProveedores(<CompraExitosa />)
    expect(screen.getByRole('heading', { name: 'Dirección de entrega' })).toBeInTheDocument()
    expect(screen.getByText(/Av\. Gamers 123, Santiago, Región metropolitana/)).toBeInTheDocument()
    expect(screen.getByText('Fecha: 15/10/2026, 10:30:00')).toBeInTheDocument()
  })

  it('el envío gratis se muestra como "Gratis"', () => {
    sembrarOrden({ ...orden, envio: 0, entrega: 'Retiro en tienda (Centro de Santiago)' })
    renderConProveedores(<CompraExitosa />)
    expect(screen.getAllByText('Gratis')).toHaveLength(1)
  })

  it('muestra el enlace para seguir comprando', () => {
    sembrarOrden(orden)
    renderConProveedores(<CompraExitosa />)
    expect(screen.getByRole('link', { name: 'Seguir comprando' })).toHaveAttribute('href', '/productos')
  })

  it('si no hay compra guardada muestra el estado vacío', () => {
    renderConProveedores(<CompraExitosa />)
    expect(screen.getByRole('heading', { name: 'No hay compras recientes' })).toBeInTheDocument()
    expect(screen.getByText('Cuando completes una compra verás aquí el resumen.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/productos')
  })
})
