import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { regiones } from '../data/regiones'
import Campo from '../components/Campo'

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,50}$/
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!.*])[A-Za-z\d@#$%!.*]{8,}$/
const REGEX_TELEFONO = /^(\+56\s?9\s?\d{4}\s?\d{4}|9\d{8})$/

const vacio = {
  nombre: '', correo: '', confirmarCorreo: '', password: '',
  confirmarPassword: '', telefono: '', region: '', comuna: '',
}

function validar(d) {
  const e = {}
  if (!REGEX_NOMBRE.test(d.nombre.trim())) e.nombre = 'Solo letras y espacios, máximo 50 caracteres.'
  if (!REGEX_CORREO.test(d.correo.trim())) e.correo = 'Ingresa un correo con formato válido.'
  if (d.confirmarCorreo.trim() !== d.correo.trim()) e.confirmarCorreo = 'Los correos no coinciden.'
  if (!REGEX_PASSWORD.test(d.password)) e.password = 'Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.'
  if (d.confirmarPassword !== d.password) e.confirmarPassword = 'Las contraseñas no coinciden.'
  if (d.telefono.trim() !== '' && !REGEX_TELEFONO.test(d.telefono.trim())) e.telefono = 'Formato inválido. Ej: +56 9 1234 5678.'
  if (d.region === '') e.region = 'Debes seleccionar una región.'
  if (d.comuna === '') e.comuna = 'Debes seleccionar una comuna.'
  return e
}

function Registro() {
  const [datos, setDatos] = useState(vacio)
  const [errores, setErrores] = useState({})
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const comunas = regiones.find((r) => r.id === datos.region)?.comunas || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    const resultado = registrar(datos)
    if (!resultado.ok) {
      setErrores({ correo: 'Este correo ya está registrado.' })
      return
    }
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
    navigate('/login')
  }

  return (
    <main className="d-flex justify-content-center py-5 px-3">
      <form className="formulario-tienda" onSubmit={handleSubmit} noValidate>
        <h2 className="text-center mb-4">Registro de usuario</h2>

        <Campo id="nombre" label="Nombre completo" type="text" placeholder="Ej: Juan Pérez"
          value={datos.nombre} onChange={handleChange} error={errores.nombre}
          sugerencia="Solo letras y espacios, máximo 50 caracteres." />

        <Campo id="correo" label="Correo electrónico" type="email" placeholder="Ej: nombre@correo.com"
          value={datos.correo} onChange={handleChange} error={errores.correo}
          sugerencia="Debe ser un correo válido y no estar registrado antes." />

        <Campo id="confirmarCorreo" label="Confirmar correo" type="email" placeholder="Repite tu correo"
          value={datos.confirmarCorreo} onChange={handleChange} error={errores.confirmarCorreo}
          sugerencia="Debe coincidir exactamente con el correo anterior." />

        <Campo id="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
          value={datos.password} onChange={handleChange} error={errores.password}
          sugerencia="Debe incluir mayúscula, minúscula, número y símbolo (@#$%!.*)." />

        <Campo id="confirmarPassword" label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña"
          value={datos.confirmarPassword} onChange={handleChange} error={errores.confirmarPassword}
          sugerencia="Debe coincidir exactamente con la contraseña anterior." />

        <Campo id="telefono" label="Teléfono (opcional)" type="tel" placeholder="Ej: +56 9 1234 5678"
          value={datos.telefono} onChange={handleChange} error={errores.telefono}
          sugerencia="Formato chileno: +56 9 1234 5678 o 912345678." />

        <div className="row g-3">
          <div className="col-12 col-md-6 campo-formulario">
            <label htmlFor="region">Región</label>
            <select id="region" name="region" value={datos.region} onChange={handleChange}
              className={errores.region ? 'input-error' : ''}>
              <option value="">-- Selecciona tu región --</option>
              {regiones.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            <span className="error">{errores.region}</span>
          </div>

          <div className="col-12 col-md-6 campo-formulario">
            <label htmlFor="comuna">Comuna</label>
            <select id="comuna" name="comuna" value={datos.comuna} onChange={handleChange}
              className={errores.comuna ? 'input-error' : ''}>
              <option value="">-- Selecciona tu comuna --</option>
              {comunas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="error">{errores.comuna}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-morado w-100 mt-3">Registrar</button>
      </form>
    </main>
  )
}

export default Registro