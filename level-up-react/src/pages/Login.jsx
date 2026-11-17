import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Campo from '../components/Campo'

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const { login, cargando } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nuevos = {}
    if (!REGEX_CORREO.test(correo.trim())) nuevos.correo = 'Ingresa un correo válido.'
    if (password.trim() === '') nuevos.password = 'Ingresa tu contraseña.'
    setErrores(nuevos)
    setErrorGeneral('')
    if (Object.keys(nuevos).length > 0) return

    const resultado = await login(correo, password)
    if (!resultado.ok) {
      if (resultado.campo) {
        setErrores({ [resultado.campo]: resultado.mensaje })
      } else {
        setErrorGeneral(resultado.mensaje)
      }
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

        {errorGeneral && <div className="alert alert-danger py-2">{errorGeneral}</div>}

        <Campo id="loginCorreo" label="Correo" type="email" placeholder="Ej: nombre@correo.com"
          value={correo} onChange={(e) => setCorreo(e.target.value)} error={errores.correo} />

        <Campo id="loginPassword" label="Contraseña" type="password" placeholder="Tu contraseña"
          value={password} onChange={(e) => setPassword(e.target.value)} error={errores.password} />

        <button type="submit" className="btn btn-morado w-100 mt-3" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}

export default Login
