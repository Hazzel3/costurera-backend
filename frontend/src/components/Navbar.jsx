import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const esAdmin = usuario?.rol === 'admin'

  function cerrarSesion() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-enlaces">
        {esAdmin ? (
          <>
            <Link to="/" className="navbar-enlace">Clientes</Link>
            <Link to="/pedidos" className="navbar-enlace">Pedidos</Link>
            <Link to="/archivados" className="navbar-enlace">Archivados</Link>
            <Link to="/ajustes" className="navbar-enlace">Ajustes</Link>
            <Link to="/presupuestos" className="navbar-enlace">Presupuestos</Link>
            <Link to="/inventario" className="navbar-enlace">Inventario</Link>
            <Link to="/contabilidad" className="navbar-enlace">Contabilidad</Link>
          </>
        ) : (
          <Link to="/inicio" className="navbar-enlace">Mi cuenta</Link>
        )}
      </div>

      <div className="navbar-usuario">
        <span className="navbar-nombre">{usuario?.nombre}</span>
        <button onClick={cerrarSesion} className="navbar-salir">
          Salir
        </button>
      </div>
    </nav>
  )
}
