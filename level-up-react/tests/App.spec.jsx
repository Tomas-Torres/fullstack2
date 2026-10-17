import { screen } from '@testing-library/react'
import { renderConProveedores } from './utils'
import App from '../src/App'

describe('App (rutas)', () => {
  it('muestra el Home en /', () => {
    renderConProveedores(<App />, { ruta: '/' })
    expect(screen.getByRole('heading', { level: 1, name: 'Sube de nivel tu setup' })).toBeInTheDocument()
  })

  it('muestra el catálogo en /productos', () => {
    renderConProveedores(<App />, { ruta: '/productos' })
    expect(screen.getByRole('heading', { name: 'Nuestro Catálogo' })).toBeInTheDocument()
  })

  it('muestra el carrito en /carrito', () => {
    renderConProveedores(<App />, { ruta: '/carrito' })
    expect(screen.getByRole('heading', { name: 'Mi carrito de compras' })).toBeInTheDocument()
  })

  it('muestra el login en /login', () => {
    renderConProveedores(<App />, { ruta: '/login' })
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
  })

  it('muestra el registro en /registro', () => {
    renderConProveedores(<App />, { ruta: '/registro' })
    expect(screen.getByRole('heading', { name: 'Registro de usuario' })).toBeInTheDocument()
  })

  it('redirige al login si un visitante entra a /admin', () => {
    renderConProveedores(<App />, { ruta: '/admin' })
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
  })

  it('deja entrar al administrador a /admin', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Administrador', correo: 'admin@levelup.cl', rol: 'admin' }))
    renderConProveedores(<App />, { ruta: '/admin' })
    expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
  })
})
