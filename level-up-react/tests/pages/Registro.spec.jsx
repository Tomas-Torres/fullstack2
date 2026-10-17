import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import Registro from '../../src/pages/Registro'

function renderRegistro() {
  return renderConProveedores(
    <Routes>
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<p>Pantalla login</p>} />
    </Routes>,
    { ruta: '/registro' }
  )
}

async function llenar({ correo = 'ana@correo.com', password = 'Clave123!', confirmarPassword = password } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
  await userEvent.type(screen.getByLabelText('Correo electrónico'), correo)
  await userEvent.type(screen.getByLabelText('Confirmar correo'), correo)
  await userEvent.type(screen.getByLabelText('Contraseña'), password)
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), confirmarPassword)
  await userEvent.selectOptions(screen.getByLabelText('Región'), 'metropolitana')
  await userEvent.selectOptions(screen.getByLabelText('Comuna'), 'Santiago')
}

const enviar = () => userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

describe('Página Registro', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('muestra un error junto a cada campo si se envía vacío', async () => {
    renderRegistro()
    await enviar()
    expect(screen.getByText('Ingresa un correo con formato válido.')).toBeInTheDocument()
    expect(screen.getByText('Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una región.')).toBeInTheDocument()
    expect(screen.getByText('Debes seleccionar una comuna.')).toBeInTheDocument()
    // La sugerencia y el error del nombre tienen el mismo texto
    expect(screen.getAllByText('Solo letras y espacios, máximo 50 caracteres.')).toHaveLength(2)
  })

  it('las comunas dependen de la región elegida', async () => {
    renderRegistro()
    const comuna = screen.getByLabelText('Comuna')
    expect(within(comuna).getAllByRole('option')).toHaveLength(1)

    await userEvent.selectOptions(screen.getByLabelText('Región'), 'valparaiso')
    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Santiago' })).not.toBeInTheDocument()
  })

  it('rechaza una contraseña débil', async () => {
    renderRegistro()
    await llenar({ password: 'abc' })
    await enviar()
    expect(screen.getByText('Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.')).toBeInTheDocument()
  })

  it('rechaza contraseñas que no coinciden', async () => {
    renderRegistro()
    await llenar({ password: 'Clave123!', confirmarPassword: 'Otra123!' })
    await enviar()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('rechaza un teléfono con formato inválido', async () => {
    renderRegistro()
    await llenar()
    await userEvent.type(screen.getByLabelText('Teléfono (opcional)'), '12345')
    await enviar()
    expect(screen.getByText('Formato inválido. Ej: +56 9 1234 5678.')).toBeInTheDocument()
  })

  it('rechaza un correo que ya está registrado', async () => {
    renderRegistro()
    await llenar({ correo: 'admin@levelup.cl' })
    await enviar()
    expect(screen.getByText('Este correo ya está registrado.')).toBeInTheDocument()
  })

  it('registra al usuario, lo guarda y lo envía al login', async () => {
    renderRegistro()
    await llenar()
    await enviar()
    expect(await screen.findByText('Pantalla login')).toBeInTheDocument()
    expect(window.alert).toHaveBeenCalled()

    const guardados = JSON.parse(localStorage.getItem('usuarios'))
    expect(guardados.some((u) => u.correo === 'ana@correo.com')).toBe(true)
  })
})
