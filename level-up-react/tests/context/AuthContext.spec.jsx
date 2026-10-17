import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/context/AuthContext'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

const datos = {
  nombre: 'Ana Pérez',
  correo: 'ana@correo.com',
  password: 'Clave123!',
  telefono: '',
  region: 'metropolitana',
  comuna: 'Santiago',
}

describe('AuthContext', () => {
  it('incluye la cuenta de administrador de demostración', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.usuarios.some((u) => u.correo === 'admin@levelup.cl' && u.rol === 'admin')).toBe(true)
  })

  it('registra un cliente nuevo', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    act(() => {
      respuesta = result.current.registrar(datos)
    })
    expect(respuesta.ok).toBe(true)
    const ana = result.current.usuarios.find((u) => u.correo === 'ana@correo.com')
    expect(ana.rol).toBe('cliente')
  })

  it('rechaza un correo ya registrado, sin importar mayúsculas', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.registrar(datos)
    })
    let respuesta
    act(() => {
      respuesta = result.current.registrar({ ...datos, correo: 'ANA@correo.com' })
    })
    expect(respuesta.ok).toBe(false)
  })

  it('informa cuando la cuenta no existe', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    act(() => {
      respuesta = result.current.login('nadie@correo.com', 'Clave123!')
    })
    expect(respuesta).toMatchObject({ ok: false, campo: 'correo' })
  })

  it('informa cuando la contraseña es incorrecta', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    act(() => {
      respuesta = result.current.login('admin@levelup.cl', 'ClaveMala1!')
    })
    expect(respuesta).toMatchObject({ ok: false, campo: 'password' })
  })

  it('inicia sesión y reconoce al administrador', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    act(() => {
      respuesta = result.current.login('admin@levelup.cl', 'Admin123!')
    })
    expect(respuesta.ok).toBe(true)
    expect(result.current.usuarioActivo.correo).toBe('admin@levelup.cl')
    expect(result.current.esAdmin).toBe(true)
  })

  it('un cliente inicia sesión pero no es administrador', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.registrar(datos)
    })
    act(() => {
      result.current.login('ana@correo.com', 'Clave123!')
    })
    expect(result.current.usuarioActivo.nombre).toBe('Ana Pérez')
    expect(result.current.esAdmin).toBe(false)
  })

  it('guarda la sesión en localStorage y la borra al cerrar sesión', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('admin@levelup.cl', 'Admin123!')
    })
    expect(JSON.parse(localStorage.getItem('usuarioActivo')).correo).toBe('admin@levelup.cl')

    act(() => {
      result.current.logout()
    })
    expect(result.current.usuarioActivo).toBeNull()
    expect(localStorage.getItem('usuarioActivo')).toBeNull()
  })

  it('recupera la sesión guardada al iniciar', () => {
    localStorage.setItem(
      'usuarioActivo',
      JSON.stringify({ nombre: 'Ana', correo: 'ana@correo.com', rol: 'cliente' })
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.usuarioActivo.correo).toBe('ana@correo.com')
  })
})
