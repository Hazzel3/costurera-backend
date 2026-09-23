import { useAuth } from '../context/AuthContext'
import '../styles/InicioCliente.css'

export default function InicioCliente() {
  const { usuario } = useAuth()

  return (
    <div className="inicio-pagina">
      <h1 className="inicio-titulo">Hola, {usuario?.nombre}</h1>
      <p className="inicio-texto">
        Bienvenida a tu cuenta. Aquí pronto podrás ver el avance de tu pedido.
      </p>
    </div>
  )
}
