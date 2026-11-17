import { act, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../src/context/AuthContext'
import { ProductosProvider } from '../src/context/ProductosContext'
import { CarritoProvider } from '../src/context/CarritoContext'

// Renderiza un componente con los mismos proveedores que usa main.jsx.
// MemoryRouter reemplaza a BrowserRouter en las pruebas (no usa la barra del navegador).
export function renderConProveedores(ui, { ruta = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <ProductosProvider>
          <CarritoProvider>{ui}</CarritoProvider>
        </ProductosProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

/**
 * Espera a que terminen los efectos que llaman a la API.
 *
 * Con renderHook no hay cambios en el DOM que despierten a waitFor, así que se
 * deja correr el ciclo de promesas dentro de act. Dos vueltas cubren las
 * llamadas encadenadas (por ejemplo subir el carrito y luego leerlo).
 */
export async function esperarEfectos() {
  await act(async () => {})
  await act(async () => {})
}
