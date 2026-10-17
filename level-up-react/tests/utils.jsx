import { render } from '@testing-library/react'
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
