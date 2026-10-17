import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '../../src/components/ProductCard'

const producto = {
  id: 'catan',
  nombre: 'Catan',
  categoria: 'Juegos de Mesa',
  atributo: '3-4 jugadores',
  precio: 29990,
  imagen: '/img/catan.png',
  stock: 10,
}

describe('ProductCard', () => {
  it('muestra nombre, atributo, precio e imagen', () => {
    render(<ProductCard producto={producto} onAgregar={() => {}} />)
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('3-4 jugadores')).toBeInTheDocument()
    expect(screen.getByText('$29.990 CLP')).toBeInTheDocument()
    expect(screen.getByAltText('Catan')).toHaveAttribute('src', '/img/catan.png')
  })

  it('llama a onAgregar con el producto al presionar el botón', async () => {
    const onAgregar = vi.fn()
    render(<ProductCard producto={producto} onAgregar={onAgregar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(onAgregar).toHaveBeenCalledWith(producto)
  })

  it('si no hay stock, avisa y deshabilita el botón', () => {
    render(<ProductCard producto={{ ...producto, stock: 0 }} onAgregar={() => {}} />)
    expect(screen.getAllByText('Sin stock')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })
})
