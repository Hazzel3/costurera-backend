import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Medidas.css'

export default function Medidas() {
  const { clienteId } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [tipos, setTipos] = useState([])      // las medidas configuradas en Ajustes
  const [valores, setValores] = useState({})  // los valores de este cliente
  const [notas, setNotas] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const [{ data: clientes }, { data: t }, { data: m }] = await Promise.all([
        api.get('/clientes'),
        api.get('/tipos-medida'),
        api.get(`/medidas/${clienteId}`),
      ])
      setCliente(clientes.find(x => x._id === clienteId))
      setTipos(t)
      if (m) {
        setValores(m.valores || {})
        setNotas(m.notas || '')
      }
    }
    cargar()
  }, [clienteId])

  function cambiar(clave, valor) {
    setValores({ ...valores, [clave]: valor })
  }

  async function guardar(e) {
    e.preventDefault()
    // dejar solo numeros validos
    const limpios = {}
    for (const k in valores) {
      if (valores[k] !== '' && valores[k] !== null && valores[k] !== undefined) {
        limpios[k] = Number(valores[k])
      }
    }
    await api.post(`/medidas/${clienteId}`, { valores: limpios, notas })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="medidas-pagina">
      <button onClick={() => navigate('/')} className="medidas-volver">← Volver</button>

      <h1 className="medidas-titulo">Medidas de {cliente?.nombre}</h1>
      <p className="medidas-subtitulo">Todas las medidas en centímetros</p>

      <form onSubmit={guardar}>
        <div className="medidas-grid">
          {tipos.map(t => (
            <div key={t.clave}>
              <label className="medidas-label">{t.nombre} (cm)</label>
              <input
                type="number"
                step="0.1"
                value={valores[t.clave] ?? ''}
                onChange={e => cambiar(t.clave, e.target.value)}
                className="medidas-input"
              />
            </div>
          ))}
        </div>

        {tipos.length === 0 && (
          <p className="medidas-subtitulo">
            No hay medidas configuradas. Ve a Ajustes → Medidas para agregarlas.
          </p>
        )}

        <div className="medidas-notas-grupo">
          <label className="medidas-label">Notas</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            className="medidas-textarea"
            rows={3}
          />
        </div>

        <button type="submit" className="medidas-boton">
          {guardado ? '✓ Guardado' : 'Guardar medidas'}
        </button>
      </form>
    </div>
  )
}
