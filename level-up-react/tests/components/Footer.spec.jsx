import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from '../../src/components/Footer'

describe('Footer', () => {
  it('muestra el nombre de la tienda, categorías y medios de pago', () => {
    render(<Footer />)
    expect(screen.getByRole('heading', { name: 'Level-Up Gamer' })).toBeInTheDocument()
    expect(screen.getByText('Consolas')).toBeInTheDocument()
    expect(screen.getByText(/Débito/)).toBeInTheDocument()
  })

  it('tiene un formulario de boletín que se puede enviar sin recargar', async () => {
    render(<Footer />)
    const correo = screen.getByLabelText('Correo electrónico')
    await userEvent.type(correo, 'ana@correo.com')
    await userEvent.click(screen.getByRole('button', { name: 'Suscribirse' }))
    expect(correo).toBeInTheDocument()
  })
})
