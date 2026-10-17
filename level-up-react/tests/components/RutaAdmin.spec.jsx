import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../src/context/AuthContext'
import RutaAdmin from '../../src/components/RutaAdmin'

function renderRuta() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<RutaAdmin><p>Contenido admin</p></RutaAdmin>} />
          <Route path="/login" element={<p>Pantalla login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('RutaAdmin', () => {
  it('redirige al login si no hay sesión', () => {
    renderRuta()
    expect(screen.getByText('Pantalla login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido admin')).not.toBeInTheDocument()
  })

  it('redirige al login si el usuario es un cliente', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Ana', correo: 'ana@correo.com', rol: 'cliente' }))
    renderRuta()
    expect(screen.getByText('Pantalla login')).toBeInTheDocument()
  })

  it('deja pasar al administrador', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Administrador', correo: 'admin@levelup.cl', rol: 'admin' }))
    renderRuta()
    expect(screen.getByText('Contenido admin')).toBeInTheDocument()
  })
})
