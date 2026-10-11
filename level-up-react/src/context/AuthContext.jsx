import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

// Cuenta de administrador de prueba (no hay servidor en esta etapa)
const ADMIN = {
  nombre: 'Administrador',
  correo: 'admin@levelup.cl',
  password: 'Admin123!',
  telefono: '',
  region: 'metropolitana',
  comuna: 'Santiago',
  rol: 'admin',
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    const guardados = JSON.parse(localStorage.getItem('usuarios')) || []
    return guardados.some((u) => u.correo === ADMIN.correo) ? guardados : [ADMIN, ...guardados]
  })

  const [usuarioActivo, setUsuarioActivo] = useState(
    () => JSON.parse(localStorage.getItem('usuarioActivo')) || null
  )

  useEffect(() => {
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
  }, [usuarios])

  useEffect(() => {
    if (usuarioActivo) {
      localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo))
    } else {
      localStorage.removeItem('usuarioActivo')
    }
  }, [usuarioActivo])

  const registrar = (datos) => {
    const correo = datos.correo.trim().toLowerCase()
    if (usuarios.some((u) => u.correo.toLowerCase() === correo)) {
      return { ok: false }
    }
    const nuevo = {
      nombre: datos.nombre.trim(),
      correo,
      password: datos.password,
      telefono: datos.telefono.trim(),
      region: datos.region,
      comuna: datos.comuna,
      rol: 'cliente',
    }
    setUsuarios((prev) => [...prev, nuevo])
    return { ok: true }
  }

  const login = (correo, password) => {
    const usuario = usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase())

    if (!usuario) {
      return { ok: false, campo: 'correo', mensaje: 'No existe una cuenta con este correo.' }
    }
    if (usuario.password !== password) {
      return { ok: false, campo: 'password', mensaje: 'Contraseña incorrecta.' }
    }

    const sesion = { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    setUsuarioActivo(sesion)
    return { ok: true, usuario: sesion }
  }

  const logout = () => setUsuarioActivo(null)

  const esAdmin = usuarioActivo?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ usuarios, usuarioActivo, esAdmin, registrar, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}