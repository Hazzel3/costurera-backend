import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children, rol }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  // si la pagina pide un rol y el usuario no lo tiene, se le manda a su propio inicio
  if (rol && usuario.rol !== rol) {
    return <Navigate to={usuario.rol === 'admin' ? '/' : '/mi-cuenta'} />
  }
  return children
}
