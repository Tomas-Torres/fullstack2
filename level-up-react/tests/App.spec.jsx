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

  it('muestra las categorías en /categorias', () => {
    renderConProveedores(<App />, { ruta: '/categorias' })
    expect(screen.getByRole('heading', { level: 2, name: 'Categorías' })).toBeInTheDocument()
  })

  it('muestra las ofertas en /ofertas', () => {
    renderConProveedores(<App />, { ruta: '/ofertas' })
    expect(screen.getByRole('heading', { level: 2, name: 'Ofertas' })).toBeInTheDocument()
  })

  it('muestra el detalle del producto en /producto/:id', () => {
    renderConProveedores(<App />, { ruta: '/producto/catan' })
    expect(screen.getByRole('heading', { level: 1, name: 'Catan' })).toBeInTheDocument()
  })

  it('muestra el aviso de producto inexistente en /producto/:id', () => {
    renderConProveedores(<App />, { ruta: '/producto/noexiste' })
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
  })

  it('filtra el catálogo con los parámetros de la URL', () => {
    renderConProveedores(<App />, { ruta: '/productos?q=catan' })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Catan' })).toBeInTheDocument()
  })

  it('muestra el aviso de carrito vacío en /checkout', () => {
    renderConProveedores(<App />, { ruta: '/checkout' })
    expect(screen.getByRole('heading', { name: 'No hay nada que pagar' })).toBeInTheDocument()
  })

  it('muestra el estado vacío de /compra-exitosa', () => {
    renderConProveedores(<App />, { ruta: '/compra-exitosa' })
    expect(screen.getByRole('heading', { name: 'No hay compras recientes' })).toBeInTheDocument()
  })

  it('muestra la compra fallida en /compra-fallida', () => {
    renderConProveedores(<App />, { ruta: '/compra-fallida' })
    expect(screen.getByRole('heading', { level: 1, name: 'No se pudo realizar el pago' })).toBeInTheDocument()
  })
})
