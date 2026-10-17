import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderConProveedores } from '../utils'
import Login from '../../src/pages/Login'

function renderLogin() {
  return renderConProveedores(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<p>Panel admin</p>} />
      <Route path="/" element={<p>Página de inicio</p>} />
    </Routes>,
    { ruta: '/login' }
  )
}

async function ingresar(correo, password) {
  if (correo) await userEvent.type(screen.getByLabelText('Correo'), correo)
  if (password) await userEvent.type(screen.getByLabelText('Contraseña'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('Página Login', () => {
  it('pide correo y contraseña si se envía vacío', async () => {
    renderLogin()
    await ingresar('', '')
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })

  it('rechaza un correo con formato inválido', async () => {
    renderLogin()
    await ingresar('abc', 'Clave123!')
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
  })

  it('informa que la cuenta no existe', async () => {
    renderLogin()
    await ingresar('nadie@correo.com', 'Clave123!')
    expect(screen.getByText('No existe una cuenta con este correo.')).toBeInTheDocument()
  })

  it('informa que la contraseña es incorrecta', async () => {
    renderLogin()
    await ingresar('admin@levelup.cl', 'ClaveMala1!')
    expect(screen.getByText('Contraseña incorrecta.')).toBeInTheDocument()
  })

  it('el administrador entra y es enviado al panel', async () => {
    renderLogin()
    await ingresar('admin@levelup.cl', 'Admin123!')
    expect(await screen.findByText('Panel admin')).toBeInTheDocument()
  })

  it('un cliente entra y es enviado al inicio', async () => {
    localStorage.setItem(
      'usuarios',
      JSON.stringify([
        { nombre: 'Ana Pérez', correo: 'ana@correo.com', password: 'Clave123!', telefono: '', region: 'metropolitana', comuna: 'Santiago', rol: 'cliente' },
      ])
    )
    renderLogin()
    await ingresar('ana@correo.com', 'Clave123!')
    expect(await screen.findByText('Página de inicio')).toBeInTheDocument()
  })
})
