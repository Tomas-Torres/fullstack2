import { render, screen } from '@testing-library/react'
import Campo from '../../src/components/Campo'

describe('Campo', () => {
  it('asocia el label con el input', () => {
    render(<Campo id="nombre" label="Nombre" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
  })

  it('muestra la sugerencia cuando se entrega', () => {
    render(<Campo id="nombre" label="Nombre" sugerencia="Solo letras" value="" onChange={() => {}} />)
    expect(screen.getByText('Solo letras')).toBeInTheDocument()
  })

  it('no muestra sugerencia si no se entrega', () => {
    const { container } = render(<Campo id="nombre" label="Nombre" value="" onChange={() => {}} />)
    expect(container.querySelector('small')).toBeNull()
  })

  it('muestra el error y marca el input en rojo', () => {
    render(<Campo id="nombre" label="Nombre" error="Campo obligatorio" value="" onChange={() => {}} />)
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveClass('input-error')
  })

  it('no marca el input si no hay error', () => {
    render(<Campo id="nombre" label="Nombre" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Nombre')).not.toHaveClass('input-error')
  })

  it('reenvía el resto de atributos al input', () => {
    render(<Campo id="clave" label="Clave" type="password" placeholder="Tu clave" value="" onChange={() => {}} />)
    const input = screen.getByLabelText('Clave')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('placeholder', 'Tu clave')
  })
})
