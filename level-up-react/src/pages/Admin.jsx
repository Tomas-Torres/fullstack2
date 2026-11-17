import { useEffect, useState } from 'react'
import { useProductos } from '../context/ProductosContext'
import { useAuth } from '../context/AuthContext'
import Campo from '../components/Campo'

const vacio = { nombre: '', categoria: '', atributo: '', precio: '', stock: '', imagen: '' }

const usuarioVacio = {
  nombre: '', correo: '', password: '', telefono: '',
  region: '', comuna: '', rol: 'CLIENTE', activo: true,
}

function validar(d) {
  const e = {}
  if (d.nombre.trim() === '' || d.nombre.trim().length > 60) e.nombre = 'Obligatorio, máximo 60 caracteres.'
  if (d.categoria === '') e.categoria = 'Debes seleccionar una categoría.'
  if (d.atributo.trim() === '') e.atributo = 'Obligatorio. Ej: Inalámbrico.'

  const precio = Number(d.precio)
  if (d.precio === '' || !Number.isInteger(precio) || precio <= 0) e.precio = 'Ingresa un precio entero mayor a 0.'

  const stock = Number(d.stock)
  if (d.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'Ingresa un stock entero (0 o más).'

  if (!/^(\/|https?:\/\/)/.test(d.imagen.trim())) e.imagen = 'Usa una ruta como /img/catan.png o un link que empiece con http.'
  return e
}

function validarUsuario(d, editando) {
  const e = {}
  if (d.nombre.trim() === '') e.nombre = 'El nombre es obligatorio.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'Ingresa un correo válido.'
  if (!editando && d.password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.'
  return e
}

function Admin() {
  const { productos, categorias, cargando, agregarProducto, editarProducto, eliminarProducto } = useProductos()
  const {
    usuarioActivo, cargarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
  } = useAuth()

  const [seccion, setSeccion] = useState('productos')
  const [datos, setDatos] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [usuarios, setUsuarios] = useState([])
  const [datosUsuario, setDatosUsuario] = useState(usuarioVacio)
  const [erroresUsuario, setErroresUsuario] = useState({})
  const [editandoUsuario, setEditandoUsuario] = useState(null)
  const [mensajeUsuario, setMensajeUsuario] = useState('')
  const [errorUsuario, setErrorUsuario] = useState('')
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)

  const formato = (n) => '$' + n.toLocaleString('es-CL')

  useEffect(() => {
    if (seccion !== 'usuarios') return
    let vigente = true
    setCargandoUsuarios(true)
    cargarUsuarios()
      .then((lista) => {
        if (vigente) setUsuarios(lista)
      })
      .catch((fallo) => {
        if (vigente) setErrorUsuario(fallo.message)
      })
      .finally(() => {
        if (vigente) setCargandoUsuarios(false)
      })
    return () => {
      vigente = false
    }
  }, [seccion, cargarUsuarios])

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const limpiarFormulario = () => {
    setDatos(vacio)
    setErrores({})
    setEditandoId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    setError('')
    if (Object.keys(nuevosErrores).length > 0) return

    const producto = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria,
      atributo: datos.atributo.trim(),
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      imagen: datos.imagen.trim(),
    }

    setGuardando(true)
    const resultado = editandoId
      ? await editarProducto(editandoId, producto)
      : await agregarProducto(producto)
    setGuardando(false)

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }
    setMensaje(
      editandoId
        ? `"${producto.nombre}" se actualizó correctamente.`
        : `"${producto.nombre}" se agregó al catálogo.`
    )
    limpiarFormulario()
  }

  const iniciarEdicion = (p) => {
    setEditandoId(p.id)
    setDatos({
      nombre: p.nombre,
      categoria: p.categoria,
      atributo: p.atributo,
      precio: String(p.precio),
      stock: String(p.stock),
      imagen: p.imagen,
    })
    setErrores({})
    setMensaje('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (p) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${p.nombre}"?`)) return
    setError('')
    const resultado = await eliminarProducto(p.id)
    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }
    if (editandoId === p.id) limpiarFormulario()
    setMensaje(`"${p.nombre}" se eliminó del catálogo.`)
  }

  const handleChangeUsuario = (e) => {
    const { name, value, type, checked } = e.target
    setDatosUsuario((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const limpiarUsuario = () => {
    setDatosUsuario(usuarioVacio)
    setErroresUsuario({})
    setEditandoUsuario(null)
  }

  const handleSubmitUsuario = async (e) => {
    e.preventDefault()
    const nuevosErrores = validarUsuario(datosUsuario, Boolean(editandoUsuario))
    setErroresUsuario(nuevosErrores)
    setErrorUsuario('')
    if (Object.keys(nuevosErrores).length > 0) return

    const cuerpo = {
      nombre: datosUsuario.nombre.trim(),
      correo: datosUsuario.correo.trim().toLowerCase(),
      telefono: datosUsuario.telefono.trim(),
      region: datosUsuario.region.trim(),
      comuna: datosUsuario.comuna.trim(),
      rol: datosUsuario.rol,
      activo: datosUsuario.activo,
    }
    if (datosUsuario.password) cuerpo.password = datosUsuario.password

    setGuardando(true)
    try {
      if (editandoUsuario) {
        await actualizarUsuario(editandoUsuario, cuerpo)
        setMensajeUsuario(`"${cuerpo.nombre}" se actualizó correctamente.`)
      } else {
        await crearUsuario(cuerpo)
        setMensajeUsuario(`"${cuerpo.nombre}" se creó como ${cuerpo.rol.toLowerCase()}.`)
      }
      setUsuarios(await cargarUsuarios())
      limpiarUsuario()
    } catch (fallo) {
      setErrorUsuario(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  const iniciarEdicionUsuario = (u) => {
    setEditandoUsuario(u.id)
    setDatosUsuario({
      nombre: u.nombre,
      correo: u.correo,
      password: '',
      telefono: u.telefono || '',
      region: u.region || '',
      comuna: u.comuna || '',
      rol: String(u.rol || 'CLIENTE').toUpperCase(),
      activo: u.activo !== false,
    })
    setErroresUsuario({})
    setMensajeUsuario('')
    setErrorUsuario('')
  }

  const handleEliminarUsuario = async (u) => {
    if (!window.confirm(`¿Seguro que quieres dar de baja a "${u.nombre}"?`)) return
    setErrorUsuario('')
    try {
      await eliminarUsuario(u.id)
      setMensajeUsuario(`"${u.nombre}" quedó inactivo.`)
      if (editandoUsuario === u.id) limpiarUsuario()
    } catch (fallo) {
      setErrorUsuario(fallo.message)
    }
  }

  return (
    <main className="px-4 py-5">
      <h1 className="mb-4">Panel de administración</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${seccion === 'productos' ? 'active' : ''}`}
            onClick={() => setSeccion('productos')}
          >
            Productos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${seccion === 'usuarios' ? 'active' : ''}`}
            onClick={() => setSeccion('usuarios')}
          >
            Usuarios
          </button>
        </li>
      </ul>

      {seccion === 'productos' && (
        <>
          {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {cargando && <p className="text-secundario small">Sincronizando catálogo...</p>}

          <div className="row g-4">
            <section className="col-12 col-lg-4">
              <form className="panel-admin" onSubmit={handleSubmit} noValidate>
                <h2 className="mb-3">{editandoId ? 'Editar producto' : 'Agregar producto'}</h2>

                <Campo id="nombre" label="Nombre" type="text" placeholder="Ej: Teclado mecánico"
                  value={datos.nombre} onChange={handleChange} error={errores.nombre}
                  sugerencia="Obligatorio, máximo 60 caracteres." />

                <div className="campo-formulario">
                  <label htmlFor="categoria">Categoría</label>
                  <select id="categoria" name="categoria" value={datos.categoria} onChange={handleChange}
                    className={errores.categoria ? 'input-error' : ''}>
                    <option value="">-- Selecciona una categoría --</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  <span className="error">{errores.categoria}</span>
                </div>

                <Campo id="atributo" label="Atributo" type="text" placeholder="Ej: Inalámbrico"
                  value={datos.atributo} onChange={handleChange} error={errores.atributo}
                  sugerencia="Una característica corta que se muestra en la tarjeta." />

                <Campo id="precio" label="Precio (CLP)" type="number" placeholder="Ej: 29990"
                  value={datos.precio} onChange={handleChange} error={errores.precio}
                  sugerencia="Número entero, sin puntos ni símbolos." />

                <Campo id="stock" label="Stock" type="number" placeholder="Ej: 10"
                  value={datos.stock} onChange={handleChange} error={errores.stock}
                  sugerencia="Con stock 0 el producto aparece como 'Sin stock'." />

                <Campo id="imagen" label="Imagen" type="text" placeholder="Ej: /img/catan.png"
                  value={datos.imagen} onChange={handleChange} error={errores.imagen}
                  sugerencia="Ruta dentro de public/img o un link http." />

                <button type="submit" className="btn btn-morado w-100 mt-2" disabled={guardando}>
                  {editandoId ? 'Guardar cambios' : 'Agregar producto'}
                </button>
                {editandoId && (
                  <button type="button" className="btn btn-outline-light w-100 mt-2" onClick={limpiarFormulario}>
                    Cancelar edición
                  </button>
                )}
              </form>
            </section>

            <section className="col-12 col-lg-8">
              <h2 className="mb-3">Productos ({productos.length})</h2>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle tabla-admin">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td><img src={p.imagen} alt={p.nombre} /></td>
                        <td>{p.nombre}</td>
                        <td>{p.categoria}</td>
                        <td>{formato(p.precio)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <button className="btn btn-outline-light btn-sm me-2" onClick={() => iniciarEdicion(p)}>
                            Editar
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminar(p)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {productos.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">No hay productos en el catálogo.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      )}

      {seccion === 'usuarios' && (
        <>
          {mensajeUsuario && <div className="alert alert-success py-2">{mensajeUsuario}</div>}
          {errorUsuario && <div className="alert alert-danger py-2">{errorUsuario}</div>}
          <p className="text-secundario small">
            Sesión actual: {usuarioActivo?.correo}. Las cuentas se eliminan con baja lógica (quedan inactivas).
          </p>

          <div className="row g-4">
            <section className="col-12 col-lg-4">
              <form className="panel-admin" onSubmit={handleSubmitUsuario} noValidate>
                <h2 className="mb-3">{editandoUsuario ? 'Editar usuario' : 'Crear usuario'}</h2>

                <Campo id="usuarioNombre" name="nombre" label="Nombre completo" type="text"
                  value={datosUsuario.nombre} onChange={handleChangeUsuario} error={erroresUsuario.nombre} />

                <Campo id="usuarioCorreo" name="correo" label="Correo" type="email"
                  value={datosUsuario.correo} onChange={handleChangeUsuario} error={erroresUsuario.correo} />

                <Campo id="usuarioPassword" name="password" label="Contraseña" type="password"
                  placeholder={editandoUsuario ? 'Dejar vacío para conservarla' : 'Mínimo 8 caracteres'}
                  value={datosUsuario.password} onChange={handleChangeUsuario} error={erroresUsuario.password} />

                <Campo id="usuarioTelefono" name="telefono" label="Teléfono" type="tel"
                  value={datosUsuario.telefono} onChange={handleChangeUsuario} error={erroresUsuario.telefono} />

                <Campo id="usuarioRegion" name="region" label="Región" type="text"
                  value={datosUsuario.region} onChange={handleChangeUsuario} error={erroresUsuario.region} />

                <Campo id="usuarioComuna" name="comuna" label="Comuna" type="text"
                  value={datosUsuario.comuna} onChange={handleChangeUsuario} error={erroresUsuario.comuna} />

                <div className="campo-formulario">
                  <label htmlFor="rol">Rol</label>
                  <select id="rol" name="rol" value={datosUsuario.rol} onChange={handleChangeUsuario}>
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <label className="d-flex align-items-center gap-2 mt-3">
                  <input type="checkbox" name="activo" checked={datosUsuario.activo}
                    onChange={handleChangeUsuario} />
                  Cuenta activa
                </label>

                <button type="submit" className="btn btn-morado w-100 mt-2" disabled={guardando}>
                  {editandoUsuario ? 'Guardar cambios' : 'Crear usuario'}
                </button>
                {editandoUsuario && (
                  <button type="button" className="btn btn-outline-light w-100 mt-2" onClick={limpiarUsuario}>
                    Cancelar edición
                  </button>
                )}
              </form>
            </section>

            <section className="col-12 col-lg-8">
              <h2 className="mb-3">Usuarios ({usuarios.length})</h2>
              {cargandoUsuarios ? (
                <p>Cargando usuarios...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle tabla-admin">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id}>
                          <td>{u.nombre}</td>
                          <td>{u.correo}</td>
                          <td>{String(u.rol).toUpperCase()}</td>
                          <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                          <td>
                            <button className="btn btn-outline-light btn-sm me-2"
                              onClick={() => iniciarEdicionUsuario(u)}>
                              Editar
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminarUsuario(u)}>
                              Dar de baja
                            </button>
                          </td>
                        </tr>
                      ))}
                      {usuarios.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center">No hay usuarios para mostrar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  )
}

export default Admin
