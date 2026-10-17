import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Productos from '../../src/pages/Productos'

describe('Página Productos', () => {
  it('muestra los 8 productos del catálogo', () => {
    renderConProveedores(<Productos />)
    expect(screen.getByRole('heading', { name: 'Nuestro Catálogo' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(8)
  })

  it('el producto sin stock tiene el botón deshabilitado', () => {
    renderConProveedores(<Productos />)
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })

  it('agrega un producto al carrito y lo guarda en localStorage', async () => {
    renderConProveedores(<Productos />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])
    const carrito = JSON.parse(localStorage.getItem('carrito'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0].id).toBe('catan')
  })

  it('suma la cantidad al agregar el mismo producto dos veces', async () => {
    renderConProveedores(<Productos />)
    const boton = screen.getAllByRole('button', { name: 'Agregar al carrito' })[0]
    await userEvent.click(boton)
    await userEvent.click(boton)
    const carrito = JSON.parse(localStorage.getItem('carrito'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0].cantidad).toBe(2)
  })
})
