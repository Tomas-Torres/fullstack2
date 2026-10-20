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

  it('filtra por categoría cuando llega por la URL', () => {
    renderConProveedores(<Productos />, { ruta: '/productos?categoria=Juegos%20de%20Mesa' })
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.getByText(/2 resultados en Juegos de Mesa/)).toBeInTheDocument()
  })

  it('filtra por búsqueda cuando llega por la URL', () => {
    renderConProveedores(<Productos />, { ruta: '/productos?q=catan' })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Catan' })).toBeInTheDocument()
  })

  it('muestra el estado vacío si la búsqueda no tiene coincidencias', () => {
    renderConProveedores(<Productos />, { ruta: '/productos?q=noexistente' })
    expect(screen.getByText('No encontramos productos que coincidan con tu búsqueda.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todo el catálogo' })).toBeInTheDocument()
  })

  it('filtra al presionar un botón de categoría', async () => {
    renderConProveedores(<Productos />)
    await userEvent.click(screen.getByRole('button', { name: 'Videojuegos' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'GTA6 (Versión Digital)' })).toBeInTheDocument()
  })

  it('limpia los filtros con el botón correspondiente', async () => {
    renderConProveedores(<Productos />, { ruta: '/productos?q=catan' })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getAllByRole('article')).toHaveLength(8)
  })
})
