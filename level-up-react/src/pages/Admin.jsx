import { useState } from 'react'
import { useProductos } from '../context/ProductosContext'
import Campo from '../components/Campo'

const CATEGORIAS = [
  'Juegos de Mesa', 'Accesorios', 'Consolas', 'Computadores Gamers', 'Sillas Gamers',
  'Mouse', 'Mousepad', 'Poleras Personalizadas', 'Polerones Gamers Personalizados', 'Videojuegos',
]

const vacio = { nombre: '', categoria: '', atributo: '', precio: '', stock: '', imagen: '' }

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

function Admin() {
  const { productos, agregarProducto, editarProducto, eliminarProducto } = useProductos()
  const [datos, setDatos] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const formato = (n) => '$' + n.toLocaleString('es-CL')

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const limpiarFormulario = () => {
    setDatos(vacio)
    setErrores({})
    setEditandoId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    const producto = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria,
      atributo: datos.atributo.trim(),
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      imagen: datos.imagen.trim(),
    }

    if (editandoId) {
      editarProducto(editandoId, producto)
      setMensaje(`"${producto.nombre}" se actualizó correctamente.`)
    } else {
      agregarProducto(producto)
      setMensaje(`"${producto.nombre}" se agregó al catálogo.`)
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = (p) => {
    if (window.confirm(`¿Seguro que quieres eliminar "${p.nombre}"?`)) {
      eliminarProducto(p.id)
      if (editandoId === p.id) limpiarFormulario()
      setMensaje(`"${p.nombre}" se eliminó del catálogo.`)
    }
  }

  return (
    <main className="px-4 py-5">
      <h1 className="mb-4">Panel de administración</h1>

      {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}

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
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
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

            <button type="submit" className="btn btn-morado w-100 mt-2">
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
    </main>
  )
}

export default Admin