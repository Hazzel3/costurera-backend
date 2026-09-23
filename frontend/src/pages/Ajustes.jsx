import { useNavigate } from 'react-router-dom'
import '../styles/Ajustes.css'

export default function Ajustes() {
  const navigate = useNavigate()

  return (
    <div className="ajustes-pagina">
      <h1 className="ajustes-titulo">Ajustes</h1>

      <div className="ajustes-botones">
        <button onClick={() => navigate('/ajustes/prendas')} className="ajustes-boton">
          Prendas
        </button>
        <button onClick={() => navigate('/ajustes/materiales')} className="ajustes-boton">
          Materiales
        </button>
        <button onClick={() => navigate('/ajustes/medidas')} className="ajustes-boton">
          Medidas
        </button>
        <button onClick={() => navigate('/ajustes/usuarios')} className="ajustes-boton">
          Usuarios
        </button>
      </div>
    </div>
  )
}
