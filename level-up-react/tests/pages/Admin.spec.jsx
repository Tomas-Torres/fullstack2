import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderConProveedores } from '../utils'
import Admin from '../../src/pages/Admin'

async function llenarFormulario({ nombre = 'Teclado Pro', precio = '15000' } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre'), nombre)
  await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Accesorios')
  await userEvent.type(screen.getByLabelText('Atributo'), 'Mecánico')
  await userEvent.type(screen.getByLabelText('Precio (CLP)'), precio)
  await userEvent.type(screen.getByLabelText('Stock'), '4')
  await userEvent.type(screen.getByLabelText('Imagen'), '/img/teclado.png')
}

describe('Panel Admin (CRUD de productos)', () => {
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

  it('CREATE: agrega un producto nuevo y lo guarda', async () => {
    renderConProveedores(<Admin />)
    await llenarFormulario()
    await userEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))

    expect(screen.getByRole('heading', { name: 'Productos (9)' })).toBeInTheDocument()
    expect(screen.getByText('Teclado Pro')).toBeInTheDocument()
    expect(screen.getByText(/se agregó al catálogo/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('productos'))).toHaveLength(9)
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

    expect(screen.getByText('$25.000')).toBeInTheDocument()
    expect(screen.getByText(/se actualizó correctamente/)).toBeInTheDocument()
  })

  it('permite cancelar la edición', async () => {
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }))
    expect(screen.getByRole('heading', { name: 'Agregar producto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

  it('DELETE: elimina un producto si se confirma', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    expect(screen.getByRole('heading', { name: 'Productos (7)' })).toBeInTheDocument()
    expect(screen.getByText(/se eliminó del catálogo/)).toBeInTheDocument()
  })

  it('DELETE: no elimina nada si se cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderConProveedores(<Admin />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    expect(screen.getByRole('heading', { name: 'Productos (8)' })).toBeInTheDocument()
  })
})
