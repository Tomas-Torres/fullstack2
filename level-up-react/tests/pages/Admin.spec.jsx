import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Admin from '../../src/pages/Admin'
import { instalarBackend } from '../fakeBackend'

async function llenarFormulario({ nombre = 'Teclado Pro', precio = '15000' } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre'), nombre)
  await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Accesorios')
  await userEvent.type(screen.getByLabelText('Atributo'), 'Mecánico')
  await userEvent.type(screen.getByLabelText('Precio (CLP)'), precio)
  await userEvent.type(screen.getByLabelText('Stock'), '4')
  await userEvent.type(screen.getByLabelText('Imagen'), '/img/teclado.png')
}

async function llenarUsuario({ nombre = 'Nuevo Usuario', correo = 'nuevo@levelup.cl' } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre completo'), nombre)
  await userEvent.type(screen.getByLabelText('Correo'), correo)
  await userEvent.type(screen.getByLabelText('Contraseña'), 'Clave123!')
}

describe('Panel Admin', () => {
  let backend

  beforeEach(() => {
    localStorage.setItem('token', 'token-1')
    localStorage.setItem(
      'usuarioActivo',
      JSON.stringify({ id: 1, nombre: 'Administrador', correo: 'admin@levelup.cl', rol: 'admin' })
    )
    backend = instalarBackend()
  })

  it('lista los 8 productos en la tabla', () => {
    renderConProveedores(<Admin />)
    expect(screen.getByRole('heading', { name: 'Productos (8)' })).toBeInTheDocument()
    // 1 fila de encabezado + 8 productos
    expect(screen.getAllByRole('row')).toHaveLength(9)
  })

  it('muestra errores junto a los campos si se envía vacío', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))
    expect(screen.getByText('Debes seleccionar una categoría.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un precio entero mayor a 0.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un stock entero (0 o más).')).toBeInTheDocument()
    expect(screen.getByText('Usa una ruta como /img/catan.png o un link que empiece con http.')).toBeInTheDocument()
  })

  it('CREATE: agrega un producto nuevo y lo guarda en la API', async () => {
    renderConProveedores(<Admin />)
    await llenarFormulario()
    await userEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))

    expect(await screen.findByRole('heading', { name: 'Productos (9)' })).toBeInTheDocument()
    expect(screen.getByText('Teclado Pro')).toBeInTheDocument()
    expect(screen.getByText(/se agregó al catálogo/)).toBeInTheDocument()
    expect(backend.estado.productos.some((p) => p.nombre === 'Teclado Pro')).toBe(true)
  })

  it('UPDATE: carga un producto en el formulario y guarda los cambios', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])

    expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Catan')

    const precio = screen.getByLabelText('Precio (CLP)')
    await userEvent.clear(precio)
    await userEvent.type(precio, '25000')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('$25.000')).toBeInTheDocument()
    expect(screen.getByText(/se actualizó correctamente/)).toBeInTheDocument()
    expect(backend.estado.productos.find((p) => p.id === 1).precio).toBe(25000)
  })

  it('permite cancelar la edición', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }))
    expect(screen.getByRole('heading', { name: 'Agregar producto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

  it('DELETE: elimina un producto si se confirma', async () => {
    spyOn(window, 'confirm').and.returnValue(true)
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    expect(await screen.findByRole('heading', { name: 'Productos (7)' })).toBeInTheDocument()
    expect(screen.getByText(/se eliminó del catálogo/)).toBeInTheDocument()
    expect(backend.estado.productos.some((p) => p.id === 1)).toBe(false)
  })

  it('DELETE: no elimina nada si se cancela la confirmación', async () => {
    spyOn(window, 'confirm').and.returnValue(false)
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    expect(screen.getByRole('heading', { name: 'Productos (8)' })).toBeInTheDocument()
    expect(backend.estado.productos.some((p) => p.id === 1)).toBe(true)
  })

  it('muestra los usuarios reales al abrir la pestaña', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }))

    expect(await screen.findByRole('heading', { name: 'Usuarios (2)' })).toBeInTheDocument()
    expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument()
    expect(screen.getByText('cliente.pagos@levelup.cl')).toBeInTheDocument()
  })

  it('CREAR USUARIO: envía el formulario y refresca la lista', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }))
    await screen.findByRole('heading', { name: 'Usuarios (2)' })

    await llenarUsuario()
    await userEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByRole('heading', { name: 'Usuarios (3)' })).toBeInTheDocument()
    expect(screen.getByText('nuevo@levelup.cl')).toBeInTheDocument()
    expect(backend.estado.usuarios.some((u) => u.correo === 'nuevo@levelup.cl')).toBe(true)
  })

  it('EDITAR USUARIO: carga los datos y guarda los cambios', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }))
    await screen.findByRole('heading', { name: 'Usuarios (2)' })

    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Administrador')

    const nombre = screen.getByLabelText('Nombre completo')
    await userEvent.clear(nombre)
    await userEvent.type(nombre, 'Admin Principal')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText(/se actualizó correctamente/)).toBeInTheDocument()
    expect(screen.getByText('Admin Principal')).toBeInTheDocument()
  })

  it('DAR DE BAJA: marca al usuario como inactivo', async () => {
    spyOn(window, 'confirm').and.returnValue(true)
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }))
    await screen.findByRole('heading', { name: 'Usuarios (2)' })

    await userEvent.click(screen.getAllByRole('button', { name: 'Dar de baja' })[1])

    expect(await screen.findByText(/quedó inactivo/)).toBeInTheDocument()
    await waitFor(() =>
      expect(backend.estado.usuarios.find((u) => u.id === 3).activo).toBe(false)
    )
  })

  it('valida el formulario de usuario antes de llamar a la API', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }))
    await screen.findByRole('heading', { name: 'Usuarios (2)' })

    await userEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument()
  })
})
