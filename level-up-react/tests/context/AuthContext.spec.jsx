import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/context/AuthContext'
import { instalarBackend } from '../fakeBackend'

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
  let backend

  beforeEach(() => {
    backend = instalarBackend()
  })

  it('arranca sin sesión ni usuarios cargados', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.usuarioActivo).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.usuarios).toEqual([])
  })

  it('inicia sesión con el administrador y completa el perfil', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    await act(async () => {
      respuesta = await result.current.login('admin@levelup.cl', 'Admin123!')
    })

    expect(respuesta.ok).toBe(true)
    expect(result.current.usuarioActivo.correo).toBe('admin@levelup.cl')
    expect(result.current.usuarioActivo.rol).toBe('admin')
    expect(result.current.esAdmin).toBe(true)
    expect(result.current.token).toBe('token-1')
    expect(localStorage.getItem('token')).toBe('token-1')
  })

  it('normaliza a minúsculas el rol y completa región y comuna del cliente', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('cliente.pagos@levelup.cl', 'Cliente123!')
    })

    expect(result.current.usuarioActivo.rol).toBe('cliente')
    expect(result.current.usuarioActivo.telefono).toBe('912345678')
    expect(result.current.usuarioActivo.region).toBe('metropolitana')
    expect(result.current.usuarioActivo.comuna).toBe('Santiago')
    expect(result.current.esAdmin).toBe(false)
  })

  it('informa cuando la cuenta no existe', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    await act(async () => {
      respuesta = await result.current.login('nadie@correo.com', 'Clave123!')
    })
    expect(respuesta).toEqual(jasmine.objectContaining({ ok: false, campo: 'correo' }))
  })

  it('informa cuando la contraseña es incorrecta', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    await act(async () => {
      respuesta = await result.current.login('admin@levelup.cl', 'ClaveMala1!')
    })
    expect(respuesta).toEqual(jasmine.objectContaining({ ok: false, campo: 'password' }))
  })

  it('rechaza una cuenta desactivada', async () => {
    backend = instalarBackend({
      usuarios: [
        {
          id: 9, nombre: 'Inactivo', correo: 'inactivo@levelup.cl', password: 'Clave123!',
          rol: 'CLIENTE', activo: false,
        },
      ],
    })
    const { result } = renderHook(() => useAuth(), { wrapper })
    let respuesta
    await act(async () => {
      respuesta = await result.current.login('inactivo@levelup.cl', 'Clave123!')
    })
    expect(respuesta.ok).toBe(false)
    expect(respuesta.mensaje).toBe('La cuenta está desactivada.')
  })

  it('registra un cliente nuevo y permite iniciar sesión', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let registro
    await act(async () => {
      registro = await result.current.registrar(datos)
    })
    expect(registro.ok).toBe(true)
    expect(backend.estado.usuarios.some((u) => u.correo === 'ana@correo.com')).toBe(true)

    let sesion
    await act(async () => {
      sesion = await result.current.login('ana@correo.com', 'Clave123!')
    })
    expect(sesion.ok).toBe(true)
    expect(result.current.usuarioActivo.nombre).toBe('Ana Pérez')
    expect(result.current.esAdmin).toBe(false)
  })

  it('rechaza un correo ya registrado con estado 409', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.registrar(datos)
    })
    let respuesta
    await act(async () => {
      respuesta = await result.current.registrar({ ...datos, correo: 'ANA@correo.com' })
    })
    expect(respuesta.ok).toBe(false)
    expect(respuesta.estado).toBe(409)
  })

  it('guarda la sesión y la borra al cerrar sesión', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('admin@levelup.cl', 'Admin123!')
    })
    expect(JSON.parse(localStorage.getItem('usuarioActivo')).correo).toBe('admin@levelup.cl')

    act(() => {
      result.current.logout()
    })
    expect(result.current.usuarioActivo).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('usuarioActivo')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('recupera la sesión guardada al iniciar', () => {
    localStorage.setItem(
      'usuarioActivo',
      JSON.stringify({ nombre: 'Ana', correo: 'ana@correo.com', rol: 'cliente' })
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.usuarioActivo.correo).toBe('ana@correo.com')
  })

  it('carga, crea, actualiza y da de baja usuarios como administrador', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('admin@levelup.cl', 'Admin123!')
    })

    let lista
    await act(async () => {
      lista = await result.current.cargarUsuarios()
    })
    expect(lista).toHaveLength(2)

    await act(async () => {
      await result.current.crearUsuario({
        nombre: 'Nuevo Cliente', correo: 'nuevo@levelup.cl', password: 'Clave123!',
        telefono: '', region: '', comuna: '', rol: 'CLIENTE', activo: true,
      })
    })
    expect(result.current.usuarios).toHaveLength(3)

    const creado = result.current.usuarios.find((u) => u.correo === 'nuevo@levelup.cl')
    await act(async () => {
      await result.current.actualizarUsuario(creado.id, { nombre: 'Cliente Editado' })
    })
    expect(
      result.current.usuarios.find((u) => u.id === creado.id).nombre
    ).toBe('Cliente Editado')

    await act(async () => {
      await result.current.eliminarUsuario(creado.id)
    })
    expect(result.current.usuarios.some((u) => u.id === creado.id)).toBe(false)
    expect(backend.estado.usuarios.find((u) => u.id === creado.id).activo).toBe(false)
  })
})
