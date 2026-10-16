import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RutaAdmin({ children }) {
  const { esAdmin } = useAuth()
  return esAdmin ? children : <Navigate to="/login" replace />
}

export default RutaAdmin