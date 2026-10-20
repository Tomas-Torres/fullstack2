import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import RutaAdmin from './components/RutaAdmin'
import Home from './pages/Home'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Ofertas from './pages/Ofertas'
import ProductoDetalle from './pages/ProductoDetalle'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import CompraExitosa from './pages/CompraExitosa'
import CompraFallida from './pages/CompraFallida'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Admin from './pages/Admin'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
        <Route path="/compra-fallida" element={<CompraFallida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
