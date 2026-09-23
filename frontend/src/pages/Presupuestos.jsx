import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Presupuestos.css'

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([])
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await api.get('/presupuestos')
    setPresupuestos(data)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este presupuesto?')) return
    await api.delete(`/presupuestos/${id}`)
    cargar()
  }

  function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="presl-pagina">
      <h1 className="presl-titulo">Presupuestos</h1>

      <div className="presl-lista">
        {presupuestos.length === 0 && (
          <p className="presl-vacio">No hay presupuestos guardados</p>
        )}
        {presupuestos.map(p => (
          <div key={p._id} className="presl-tarjeta">
            <div>
              <p className="presl-nombre">{p.clienteNombre}</p>
              <p className="presl-detalle">
                {fecha(p.createdAt)} · {p.items?.length || 0} prenda(s) · Q{Number(p.total).toFixed(2)}
              </p>
            </div>
            <div className="presl-acciones">
              <button onClick={() => navigate(`/presupuestos/${p._id}/editar`)} className="presl-boton-editar">
                Ver / Editar
              </button>
              <button onClick={() => eliminar(p._id)} className="presl-boton-eliminar">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
