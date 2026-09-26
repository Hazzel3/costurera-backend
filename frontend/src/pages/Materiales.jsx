import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Materiales.css'

const VACIO = { descripcion: '', medida: '', precioUnitario: '', stockMinimo: '' }

export default function Materiales() {
  const [materiales, setMateriales] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await api.get('/materiales')
    setMateriales(data)
  }

  async function guardar(e) {
    e.preventDefault()
    if (editando) {
      await api.put(`/materiales/${editando}`, form)
    } else {
      await api.post('/materiales', form)
    }
    setForm(VACIO)
    setEditando(null)
    setMostrarForm(false)
    cargar()
  }

  function iniciarEdicion(material) {
    setForm({
      descripcion: material.descripcion,
      medida: material.medida || '',
      precioUnitario: material.precioUnitario ?? '',
      stockMinimo: material.stockMinimo ?? '',
    })
    setEditando(material._id)
    setMostrarForm(true)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este material?')) return
    await api.delete(`/materiales/${id}`)
    cargar()
  }

  return (
    <div className="materiales-pagina">

      {/* boton volver a ajustes */}
      <button onClick={() => navigate('/ajustes')} className="materiales-volver">
        ← Volver a ajustes
      </button>

      <div className="materiales-encabezado">
        <h1 className="materiales-titulo">Materiales</h1>
        <button
          onClick={() => { setForm(VACIO); setEditando(null); setMostrarForm(true) }}
          className="materiales-boton-nuevo"
        >
          + Agregar material
        </button>
      </div>

      {/* fila de titulos de la tabla */}
      <div className="materiales-cabecera">
        <span className="materiales-col-desc">Descripción</span>
        <span className="materiales-col-medida">Medida</span>
        <span className="materiales-col-precio">Precio unitario</span>
        <span className="materiales-col-acciones"></span>
      </div>

      {/* formulario para crear o editar */}
      {mostrarForm && (
        <form onSubmit={guardar} className="materiales-form">
          <p className="materiales-form-titulo">
            {editando ? 'Editar material' : 'Nuevo material'}
          </p>
          <input
            placeholder="Descripción (ej: Tela 1)"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            className="materiales-input"
            required
          />
          <input
            placeholder="Medida (ej: yarda, unidad)"
            value={form.medida}
            onChange={e => setForm({ ...form, medida: e.target.value })}
            className="materiales-input"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio unitario (ej: 10.50)"
            value={form.precioUnitario}
            onChange={e => setForm({ ...form, precioUnitario: e.target.value })}
            className="materiales-input"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Stock mínimo (avisa cuando quede esto o menos)"
            value={form.stockMinimo}
            onChange={e => setForm({ ...form, stockMinimo: e.target.value })}
            className="materiales-input"
          />
          <div className="materiales-form-botones">
            <button type="submit" className="materiales-boton-guardar">Guardar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="materiales-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      {/* lista de materiales */}
      <div className="materiales-lista">
        {materiales.length === 0 && (
          <p className="materiales-vacio">No hay materiales aún</p>
        )}
        {materiales.map(m => (
          <div key={m._id} className="material-fila">
            <span className="materiales-col-desc">{m.descripcion}</span>
            <span className="materiales-col-medida">{m.medida}</span>
            <span className="materiales-col-precio">Q{Number(m.precioUnitario).toFixed(2)}</span>
            <span className="materiales-col-acciones">
              <button onClick={() => iniciarEdicion(m)} className="material-boton-editar">Editar</button>
              <button onClick={() => eliminar(m._id)} className="material-boton-eliminar">Eliminar</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
