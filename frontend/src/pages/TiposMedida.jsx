import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/TiposMedida.css'

export default function TiposMedida() {
  const [tipos, setTipos] = useState([])
  const [nombre, setNombre] = useState('')
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await api.get('/tipos-medida')
    setTipos(data)
  }

  async function agregar(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    await api.post('/tipos-medida', { nombre: nombre.trim(), orden: tipos.length })
    setNombre('')
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta medida? Dejará de aparecer en los clientes.')) return
    await api.delete(`/tipos-medida/${id}`)
    cargar()
  }

  return (
    <div className="tm-pagina">
      <button onClick={() => navigate('/ajustes')} className="tm-volver">← Volver a ajustes</button>

      <h1 className="tm-titulo">Medidas</h1>
      <p className="tm-ayuda">Estas son las medidas que se le toman a cada cliente. Puedes agregar o quitar.</p>

      <form onSubmit={agregar} className="tm-form">
        <input
          placeholder="Nueva medida (ej: Contorno de cuello)"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="tm-input"
        />
        <button type="submit" className="tm-boton-agregar">+ Agregar</button>
      </form>

      <div className="tm-lista">
        {tipos.length === 0 && <p className="tm-vacio">No hay medidas aún</p>}
        {tipos.map(t => (
          <div key={t._id} className="tm-fila">
            <span className="tm-nombre">{t.nombre}</span>
            <button onClick={() => eliminar(t._id)} className="tm-eliminar">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
