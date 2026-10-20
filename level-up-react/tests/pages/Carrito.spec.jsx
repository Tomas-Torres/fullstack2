import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import Carrito from '../../src/pages/Carrito'

const producto = { id: 'pc', nombre: 'PC de prueba', precio: 100000, imagen: '/img/pc.png', cantidad: 1, stock: 5 }

function sembrarCarrito(items) {
  localStorage.setItem('carrito', JSON.stringify(items))
}

// Renderiza el carrito con una ruta de pago simulada para comprobar la navegación.
function renderCarrito() {
  return renderConProveedores(
    <Routes>
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/checkout" element={<h1>Pantalla de pago</h1>} />
    </Routes>,
    { ruta: '/carrito' }
  )
}

describe('Página Carrito', () => {
  beforeEach(() => {
    spyOn(window, 'alert')
  })

  it('muestra el estado vacío con un link al catálogo', () => {
    renderCarrito()
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toBeInTheDocument()
  })

  it('muestra los productos con su precio, el subtotal y el total', () => {
    sembrarCarrito([{ ...producto, cantidad: 2 }])
    renderCarrito()
    expect(screen.getByRole('heading', { name: 'PC de prueba' })).toBeInTheDocument()
    expect(screen.getByText('$100.000 c/u')).toBeInTheDocument()
    // Precio del artículo, subtotal del resumen y total final
    expect(screen.getAllByText('$200.000')).toHaveLength(3)
  })

  it('aumenta la cantidad con el botón +', async () => {
    sembrarCarrito([producto])
    renderCarrito()
    const [, sumar] = within(screen.getByRole('article')).getAllByRole('button')
    await userEvent.click(sumar)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('$200.000')).toHaveLength(3)
  })

  it('elimina el producto cuando la cantidad baja a cero', async () => {
    sembrarCarrito([producto])
    renderCarrito()
    const [restar] = within(screen.getByRole('article')).getAllByRole('button')
    await userEvent.click(restar)
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })

  it('aplica un cupón válido y reduce el total', async () => {
    sembrarCarrito([producto])
    renderCarrito()
    await userEvent.type(screen.getByLabelText('Cupón de descuento'), 'gamer20')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText(/Cupón aplicado/)).toBeInTheDocument()
    expect(screen.getByText('$80.000')).toBeInTheDocument()
  })

  it('muestra un error con un cupón inválido', async () => {
    sembrarCarrito([producto])
    renderCarrito()
    await userEvent.type(screen.getByLabelText('Cupón de descuento'), 'NOEXISTE')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText('Cupón inválido.')).toBeInTheDocument()
  })

  it('no deja pagar con el carrito vacío', async () => {
    renderCarrito()
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(window.alert).toHaveBeenCalledWith('Tu carrito está vacío. Agrega productos antes de pagar.')
  })

  it('Pagar con productos lleva al checkout', async () => {
    sembrarCarrito([producto])
    renderCarrito()
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(await screen.findByRole('heading', { name: 'Pantalla de pago' })).toBeInTheDocument()
  })
})
