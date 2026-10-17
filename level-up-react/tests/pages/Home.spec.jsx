import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Home from '../../src/pages/Home'

describe('Página Home', () => {
  it('muestra la portada con su título y el botón hacia el catálogo', () => {
    renderConProveedores(<Home />)
    expect(screen.getByRole('heading', { level: 1, name: 'Sube de nivel tu setup' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveAttribute('href', '/productos')
  })

  it('muestra 4 productos destacados y un link al catálogo completo', () => {
    renderConProveedores(<Home />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Ver todo el catálogo' })).toHaveAttribute('href', '/productos')
  })

  it('agrega un destacado al carrito y lo guarda', async () => {
    renderConProveedores(<Home />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])
    const carrito = JSON.parse(localStorage.getItem('carrito'))
    expect(carrito).toHaveLength(1)
  })
})
