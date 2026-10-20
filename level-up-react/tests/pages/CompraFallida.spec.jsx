import { screen } from '@testing-library/react'
import { renderConProveedores } from '../utils'
import CompraFallida from '../../src/pages/CompraFallida'

describe('Página Compra Fallida', () => {
  it('explica que el pago fue rechazado', () => {
    renderConProveedores(<CompraFallida />)
    expect(screen.getByRole('heading', { level: 1, name: 'No se pudo realizar el pago' })).toBeInTheDocument()
    expect(screen.getByText(/Tu pago fue rechazado/)).toBeInTheDocument()
    expect(screen.getByText(/Tus productos siguen en el carrito/)).toBeInTheDocument()
  })

  it('lista los pasos a seguir', () => {
    renderConProveedores(<CompraFallida />)
    expect(screen.getByText('Verifica los datos de tu tarjeta o medio de pago.')).toBeInTheDocument()
    expect(screen.getByText('Confirma que la dirección de entrega esté completa.')).toBeInTheDocument()
    expect(screen.getByText('Si el problema persiste, prueba con otro medio de pago.')).toBeInTheDocument()
  })

  it('ofrece reintentar el pago o volver al carrito', () => {
    renderConProveedores(<CompraFallida />)
    expect(screen.getByRole('link', { name: 'Reintentar el pago' })).toHaveAttribute('href', '/checkout')
    expect(screen.getByRole('link', { name: 'Volver al carrito' })).toHaveAttribute('href', '/carrito')
  })
})
