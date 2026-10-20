import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
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
    renderConProveedores(<ProductCard producto={producto} onAgregar={() => {}} />)
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('3-4 jugadores')).toBeInTheDocument()
    expect(screen.getByText('$29.990 CLP')).toBeInTheDocument()
    expect(screen.getByAltText('Catan')).toHaveAttribute('src', '/img/catan.png')
  })

  it('linkea al detalle del producto', () => {
    renderConProveedores(<ProductCard producto={producto} onAgregar={() => {}} />)
    expect(screen.getAllByRole('link', { name: 'Catan' })[0]).toHaveAttribute('href', '/producto/catan')
  })

  it('llama a onAgregar con el producto al presionar el botón', async () => {
    const onAgregar = jasmine.createSpy('onAgregar')
    renderConProveedores(<ProductCard producto={producto} onAgregar={onAgregar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(onAgregar).toHaveBeenCalledWith(producto)
  })

  it('si no hay stock, avisa y deshabilita el botón', () => {
    renderConProveedores(<ProductCard producto={{ ...producto, stock: 0 }} onAgregar={() => {}} />)
    expect(screen.getAllByText('Sin stock')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })

  it('en oferta muestra el descuento y el precio tachado', () => {
    renderConProveedores(<ProductCard producto={{ ...producto, oferta: 20 }} onAgregar={() => {}} />)
    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText('$29.990')).toBeInTheDocument()
    expect(screen.getByText('$23.992 CLP')).toBeInTheDocument()
  })
})
