import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Ofertas from '../../src/pages/Ofertas'
import { productosIniciales } from '../../src/data/ProductosIniciales'
import { instalarBackend } from '../fakeBackend'

describe('Página Ofertas', () => {
  it('muestra el título de la sección', () => {
    renderConProveedores(<Ofertas />)
    expect(screen.getByRole('heading', { level: 2, name: 'Ofertas' })).toBeInTheDocument()
    expect(screen.getByText('Productos con descuento por tiempo limitado.')).toBeInTheDocument()
  })

  it('lista solo los productos con descuento', () => {
    renderConProveedores(<Ofertas />)
    // Carcassonne (15%), HyperX (20%) y Mouse (10%) tienen oferta.
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByText('-15%')).toBeInTheDocument()
    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText('-10%')).toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(screen.getByText('Mouse Logitech G502 HERO')).toBeInTheDocument()
  })

  it('muestra el precio tachado y el precio final de la oferta', () => {
    renderConProveedores(<Ofertas />)
    expect(screen.getByText('$24.990')).toBeInTheDocument() // antes (Carcassonne)
    expect(screen.getByText('$21.242 CLP')).toBeInTheDocument() // 24990 - 15%
  })

  it('permite agregar una oferta al carrito', async () => {
    renderConProveedores(<Ofertas />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])
    const carrito = JSON.parse(localStorage.getItem('carrito'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0].precio).toBe(Math.round(24990 * 0.85))
  })

  it('muestra el estado vacío cuando ningún producto está en oferta', async () => {
    instalarBackend({ productos: productosIniciales.map((p) => ({ ...p, oferta: 0 })) })
    renderConProveedores(<Ofertas />)
    await waitFor(() =>
      expect(screen.getByText('No hay ofertas disponibles en este momento.')).toBeInTheDocument()
    )
    expect(screen.getByRole('link', { name: 'Ver catálogo completo' })).toHaveAttribute('href', '/productos')
  })
})
