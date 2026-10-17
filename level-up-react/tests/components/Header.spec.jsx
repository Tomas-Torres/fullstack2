import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Header from '../../src/components/Header'

const admin = { nombre: 'Administrador', correo: 'admin@levelup.cl', rol: 'admin' }

describe('Header', () => {
  it('sin sesión muestra los accesos de login y registro', () => {
    renderConProveedores(<Header />)
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrar usuario' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('el contador del carrito suma las unidades', () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([
        { id: 'a', nombre: 'A', precio: 100, imagen: '', cantidad: 2 },
        { id: 'b', nombre: 'B', precio: 200, imagen: '', cantidad: 3 },
      ])
    )
    renderConProveedores(<Header />)
    expect(screen.getByRole('link', { name: 'Cart (5)' })).toBeInTheDocument()
  })

  it('con sesión de administrador muestra saludo, panel admin y cerrar sesión', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify(admin))
    renderConProveedores(<Header />)
    expect(screen.getByText('Hola, Administrador')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Panel admin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('un cliente con sesión no ve el panel admin', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Ana Pérez', correo: 'ana@correo.com', rol: 'cliente' }))
    renderConProveedores(<Header />)
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Panel admin' })).not.toBeInTheDocument()
  })

  it('al cerrar sesión vuelve a mostrar el acceso al login', async () => {
    localStorage.setItem('usuarioActivo', JSON.stringify(admin))
    renderConProveedores(<Header />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(localStorage.getItem('usuarioActivo')).toBeNull()
  })
})
