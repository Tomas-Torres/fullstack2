import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/cliente'

const AuthContext = createContext()

const CLAVE_SESION = 'usuarioActivo'
const CLAVE_TOKEN = 'token'

const leerJson = (clave) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) || null
  } catch {
    return null
  }
}

/**
 * Sesion real contra ms-login. Guarda el JWT para que los demas contextos
 * puedan llamar a ms-carrito, ms-productos (escritura) y ms-pagos.
 */
export function AuthProvider({ children }) {
  const [usuarioActivo, setUsuarioActivo] = useState(() => leerJson(CLAVE_SESION))
  const [token, setToken] = useState(() => localStorage.getItem(CLAVE_TOKEN))
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (usuarioActivo) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioActivo))
    } else {
      localStorage.removeItem(CLAVE_SESION)
    }
  }, [usuarioActivo])

  useEffect(() => {
    if (token) {
      localStorage.setItem(CLAVE_TOKEN, token)
    } else {
      localStorage.removeItem(CLAVE_TOKEN)
    }
  }, [token])

  /**
   * Inicia sesion contra ms-login y completa el perfil con telefono, region y
   * comuna para autocompletar el checkout.
   */
  const login = async (correo, password) => {
    setCargando(true)
    try {
      const datos = await authApi.login(correo.trim().toLowerCase(), password)
      const sesion = {
        id: datos.id,
        nombre: datos.nombre,
        correo: datos.correo,
        rol: String(datos.rol || '').toLowerCase(),
      }

      try {
        const perfil = await authApi.perfil(datos.id, datos.token)
        sesion.telefono = perfil.telefono || ''
        sesion.region = perfil.region || ''
        sesion.comuna = perfil.comuna || ''
      } catch {
        // El perfil es solo un extra: si falla, la sesion sigue siendo valida.
      }

      setToken(datos.token)
      setUsuarioActivo(sesion)
      return { ok: true, usuario: sesion }
    } catch (error) {
      const campo =
        error.detalles?.campo ||
        (error.estado === 401 ? 'password' : error.estado === 404 ? 'correo' : null)
      return {
        ok: false,
        campo,
        mensaje: error.message,
      }
    } finally {
      setCargando(false)
    }
  }

  /**
   * Registro publico. ms-login responde 409 si el correo ya existe.
   */
  const registrar = async (datos) => {
    setCargando(true)
    try {
      await authApi.registro({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase(),
        password: datos.password,
        telefono: datos.telefono.trim(),
        region: datos.region,
        comuna: datos.comuna,
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, estado: error.estado, mensaje: error.message }
    } finally {
      setCargando(false)
    }
  }

  const logout = () => {
    setUsuarioActivo(null)
    setToken(null)
  }

  const cargarUsuarios = useCallback(async () => {
    if (!token) return []
    const lista = await authApi.listarUsuarios(token)
    const normalizados = (lista || []).map((usuario) => ({
      ...usuario,
      rol: String(usuario.rol || '').toLowerCase(),
    }))
    setUsuarios(normalizados)
    return normalizados
  }, [token])

  const crearUsuario = async (datos) => {
    const creado = await authApi.crearUsuario(token, datos)
    await cargarUsuarios()
    return { ...creado, rol: String(creado.rol || '').toLowerCase() }
  }

  const actualizarUsuario = async (id, datos) => {
    const actualizado = await authApi.actualizarUsuario(token, id, datos)
    await cargarUsuarios()
    return { ...actualizado, rol: String(actualizado.rol || '').toLowerCase() }
  }

  const eliminarUsuario = async (id) => {
    await authApi.eliminarUsuario(token, id)
    setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id))
  }

  const esAdmin = usuarioActivo?.rol === 'admin'

  return (
    <AuthContext.Provider
      value={{
        usuarioActivo,
        token,
        usuarios,
        cargando,
        esAdmin,
        login,
        logout,
        registrar,
        cargarUsuarios,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
