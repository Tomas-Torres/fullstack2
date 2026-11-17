import { screen, waitFor } from '@testing-library/react'
import { renderConProveedores } from '../utils'
import Categorias from '../../src/pages/Categorias'
import { instalarBackend } from '../fakeBackend'

describe('Página Categorías', () => {
  it('muestra el título y la introducción', () => {
    renderConProveedores(<Categorias />)
    expect(screen.getByRole('heading', { level: 2, name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getByText('Explora el catálogo por categoría.')).toBeInTheDocument()
  })

  it('lista cada categoría con el conteo de productos', () => {
    renderConProveedores(<Categorias />)
    expect(screen.getByText('Juegos de Mesa')).toBeInTheDocument()
    expect(screen.getAllByText(/productos?/).length).toBeGreaterThan(0)
    expect(screen.getByText('Videojuegos')).toBeInTheDocument()
  })

  it('linkea cada categoría al catálogo filtrado', () => {
    renderConProveedores(<Categorias />)
    expect(
      screen.getByRole('link', { name: /Juegos de Mesa/ })
    ).toHaveAttribute('href', '/productos?categoria=Juegos%20de%20Mesa')
    expect(
      screen.getByRole('link', { name: /Sillas Gamers/ })
    ).toHaveAttribute('href', '/productos?categoria=Sillas%20Gamers')
  })

  it('muestra el mensaje vacío si el catálogo no tiene productos', async () => {
    instalarBackend({ productos: [] })
    renderConProveedores(<Categorias />)
    await waitFor(() =>
      expect(screen.getByText('No hay categorías para mostrar.')).toBeInTheDocument()
    )
  })
})
