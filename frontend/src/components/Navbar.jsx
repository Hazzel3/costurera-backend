import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const esAdmin = usuario?.rol === 'admin'
  const [menuAbierto, setMenuAbierto] = useState(false)

  function cerrarSesion() {
    logout()
    navigate('/login')
  }

  return (
    <nav 
      className="navbar"
      onMouseEnter={() => setMenuAbierto(true)}
      onMouseLeave={() => setMenuAbierto(false)}
    >
      <div className="navbar-enlaces">
        {esAdmin ? (
          <div className={`menu-horizontal-contenedor ${menuAbierto ? 'activo' : ''}`}>
            {/* Botón principal */}
            <button 
              className="navbar-enlace btn-menu"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              Mi Taller🧵<span className="flecha">▸</span>
            </button>

            {/* Opciones desplegables que se expanden a la derecha */}
            <div className="menu-horizontal-items">
               <Link to="/ajustes" className="navbar-enlace">Ajustes⚙️</Link>
              <Link to="/" className="navbar-enlace">Clientes🚻</Link>
              <Link to="/pedidos" className="navbar-enlace">Pedidos📋</Link>
              <Link to="/presupuestos" className="navbar-enlace">Presupuestos💰</Link>
              <Link to="/inventario" className="navbar-enlace">Inventario📦</Link>
              <Link to="/contabilidad" className="navbar-enlace">Contabilidad📊</Link>
              <Link to="/archivados" className="navbar-enlace">Archivados📁</Link>
             
            </div>
          </div>
        ) : (
          <Link to="/mi-cuenta" className="navbar-enlace">Mi cuenta</Link>
        )}
      </div>

      <div className="navbar-usuario">
        <span className="navbar-nombre">{usuario?.nombre}</span>
        <button onClick={cerrarSesion} className="navbar-salir">
          Cerrar Taller🚪
        </button>
      </div>
    </nav>
  )
}