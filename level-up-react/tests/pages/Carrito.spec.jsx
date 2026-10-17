import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Carrito from '../../src/pages/Carrito'

const producto = { id: 'pc', nombre: 'PC de prueba', precio: 100000, imagen: '/img/pc.png', cantidad: 1 }

function sembrarCarrito(items) {
  localStorage.setItem('carrito', JSON.stringify(items))
}

describe('Página Carrito', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('muestra el estado vacío con un link al catálogo', () => {
    renderConProveedores(<Carrito />)
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toBeInTheDocument()
  })

  it('muestra los productos con su precio y el total', () => {
    sembrarCarrito([{ ...producto, cantidad: 2 }])
    renderConProveedores(<Carrito />)
    expect(screen.getByRole('heading', { name: 'PC de prueba' })).toBeInTheDocument()
    expect(screen.getByText('$100.000 c/u')).toBeInTheDocument()
    // El subtotal del producto y el total del resumen
    expect(screen.getAllByText('$200.000')).toHaveLength(2)
  })

  it('aumenta la cantidad con el botón +', async () => {
    sembrarCarrito([producto])
    renderConProveedores(<Carrito />)
    const [, sumar] = within(screen.getByRole('article')).getAllByRole('button')
    await userEvent.click(sumar)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('$200.000')).toHaveLength(2)
  })

  it('elimina el producto cuando la cantidad baja a cero', async () => {
    sembrarCarrito([producto])
    renderConProveedores(<Carrito />)
    const [restar] = within(screen.getByRole('article')).getAllByRole('button')
    await userEvent.click(restar)
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })

  it('aplica un cupón válido y reduce el total', async () => {
    sembrarCarrito([producto])
    renderConProveedores(<Carrito />)
    await userEvent.type(screen.getByLabelText('Cupón de descuento'), 'gamer20')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText(/Cupón aplicado/)).toBeInTheDocument()
    expect(screen.getByText('$80.000')).toBeInTheDocument()
  })

  it('muestra un error con un cupón inválido', async () => {
    sembrarCarrito([producto])
    renderConProveedores(<Carrito />)
    await userEvent.type(screen.getByLabelText('Cupón de descuento'), 'NOEXISTE')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText('Cupón inválido.')).toBeInTheDocument()
  })

  it('no deja pagar con el carrito vacío', async () => {
    renderConProveedores(<Carrito />)
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(window.alert).toHaveBeenCalledWith('Tu carrito está vacío. Agrega productos antes de pagar.')
  })

  it('simula el pago y vacía el carrito', async () => {
    sembrarCarrito([producto])
    renderConProveedores(<Carrito />)
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }))
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Compra simulada'))
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([])
  })
})
