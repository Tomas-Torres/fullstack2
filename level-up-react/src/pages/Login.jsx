import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Campo from '../components/Campo'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevos = {}
    if (!REGEX_CORREO.test(correo.trim())) nuevos.correo = 'Ingresa un correo válido.'
    if (password.trim() === '') nuevos.password = 'Ingresa tu contraseña.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = login(correo, password)
    if (!resultado.ok) {
      setErrores({ [resultado.campo]: resultado.mensaje })
      return
    }

    navigate(resultado.usuario.rol === 'admin' ? '/admin' : '/')
  }

  return (
    <main className="d-flex flex-column align-items-center py-5 px-3">
      <img src="/img/logo_Lv_Up.webp" alt="Logo Level-Up Gamer" width="80" className="mb-3" />
      <h1 className="mb-4">Level-Up Gamer</h1>

      <form className="formulario-tienda" onSubmit={handleSubmit} noValidate>
        <h2 className="text-center mb-4">Inicio de sesión</h2>

        <Campo id="loginCorreo" label="Correo" type="email" placeholder="Ej: nombre@correo.com"
          value={correo} onChange={(e) => setCorreo(e.target.value)} error={errores.correo} />

        <Campo id="loginPassword" label="Contraseña" type="password" placeholder="Tu contraseña"
          value={password} onChange={(e) => setPassword(e.target.value)} error={errores.password} />

        <button type="submit" className="btn btn-morado w-100 mt-3">Iniciar sesión</button>
      </form>
    </main>
  )
}

export default Login