import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import ProductoDetalle from '../../src/pages/ProductoDetalle'

function renderDetalle(ruta) {
  return renderConProveedores(
    <Routes>
      <Route path="/producto/:id" element={<ProductoDetalle />} />
      <Route path="/productos" element={<h1>Catálogo</h1>} />
      <Route path="/carrito" element={<h1>Carrito</h1>} />
    </Routes>,
    { ruta }
  )
}

describe('Página Producto Detalle', () => {
  it('muestra la información del producto', () => {
    renderDetalle('/producto/1')
    expect(screen.getByRole('heading', { level: 1, name: 'Catan' })).toBeInTheDocument()
    expect(screen.getByText('3-4 jugadores')).toBeInTheDocument()
    expect(screen.getByAltText('Catan')).toHaveAttribute('src', '/img/catan.png')
    expect(screen.getByText('Stock disponible: 10 unidades')).toBeInTheDocument()
    expect(screen.getByText(/El clásico juego de estrategia/)).toBeInTheDocument()
  })

  it('muestra el precio con oferta y el precio tachado', () => {
    renderDetalle('/producto/2')
    expect(screen.getByText('-15% de descuento')).toBeInTheDocument()
    expect(screen.getByText('$24.990')).toBeInTheDocument()
    expect(screen.getByText('$21.242 CLP')).toBeInTheDocument()
  })

  it('muestra el precio normal si el producto no está en oferta', () => {
    renderDetalle('/producto/1')
    expect(screen.queryByText(/de descuento/)).not.toBeInTheDocument()
    expect(screen.getByText('$29.990 CLP')).toBeInTheDocument()
  })

  it('muestra el mensaje de no encontrado ante un id inexistente', () => {
    renderDetalle('/producto/noexiste')
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/productos')
  })

  it('agrega el producto al carrito y muestra la confirmación', async () => {
    renderDetalle('/producto/1')
    await userEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    const carrito = JSON.parse(localStorage.getItem('carrito'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0].id).toBe(1)
    expect(await screen.findByRole('alert')).toHaveTextContent('Producto agregado al carrito.')
    expect(screen.getByRole('link', { name: 'Ir al carrito' })).toHaveAttribute('href', '/carrito')
  })

  it('sin stock muestra el aviso y deshabilita el botón', () => {
    renderDetalle('/producto/5')
    expect(screen.getAllByText('Sin stock').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })

  it('el breadcrumb enlaza al catálogo y a la categoría', () => {
    renderDetalle('/producto/3')
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Accesorios' })).toHaveAttribute(
      'href',
      '/productos?categoria=Accesorios'
    )
  })
})
