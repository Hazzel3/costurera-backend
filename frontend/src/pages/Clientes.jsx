import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { abrirWhatsApp } from '../utils/whatsapp'
import '../styles/Clientes.css'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', notas: '' })
  const [editando, setEditando] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await api.get('/clientes')
    setClientes(data)
  }

  async function guardar(e) {
    e.preventDefault()
    if (editando) {
      await api.put(`/clientes/${editando}`, form)
    } else {
      await api.post('/clientes', form)
    }
    setForm({ nombre: '', telefono: '', notas: '' })
    setEditando(null)
    setMostrarForm(false)
    cargar()
  }

  function iniciarEdicion(cliente) {
    setForm({ nombre: cliente.nombre, telefono: cliente.telefono || '', notas: cliente.notas || '' })
    setEditando(cliente._id)
    setMostrarForm(true)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    await api.delete(`/clientes/${id}`)
    cargar()
  }

  async function archivar(id) {
    await api.put(`/clientes/${id}/archivar`)
    cargar()
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="clientes-pagina">

      <div className="clientes-encabezado">
        <h1 className="clientes-titulo">Clientes</h1>
        <button
          onClick={() => { setForm({ nombre: '', telefono: '', notas: '' }); setEditando(null); setMostrarForm(true) }}
          className="clientes-boton-nuevo"
        >
          + Nuevo cliente
        </button>
      </div>

      <input
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="clientes-buscador"
      />

      {mostrarForm && (
        <form onSubmit={guardar} className="clientes-form">
          <p className="clientes-form-titulo">
            {editando ? 'Editar cliente' : 'Nuevo cliente'}
          </p>
          <input
            placeholder="Nombre *"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="clientes-input"
            required
          />
          <input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
            className="clientes-input"
          />
          <textarea
            placeholder="Notas"
            value={form.notas}
            onChange={e => setForm({ ...form, notas: e.target.value })}
            className="clientes-textarea"
            rows={2}
          />
          <div className="clientes-form-botones">
            <button type="submit" className="clientes-boton-guardar">Guardar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="clientes-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      <div className="clientes-lista">
        {filtrados.length === 0 && (
          <p className="clientes-vacio">No hay clientes aún</p>
        )}
        {filtrados.map(c => (
          <div key={c._id} className="cliente-tarjeta">
            <div>
              <p className="cliente-nombre">{c.nombre}</p>
              {c.telefono && <p className="cliente-telefono">{c.telefono}</p>}
            </div>
            <div className="cliente-acciones">
              <button onClick={() => abrirWhatsApp(c.telefono, c.nombre)} className="cliente-boton-listo">
                Listo
              </button>
              {/* nuevo boton: ir a la calculadora de presupuesto de este cliente */}
              <button onClick={() => navigate(`/clientes/${c._id}/presupuesto`)} className="cliente-boton-presupuesto">
                Presupuesto
              </button>
              <button onClick={() => navigate(`/clientes/${c._id}/medidas`)} className="cliente-boton-medidas">
                Medidas
              </button>
              <button onClick={() => iniciarEdicion(c)} className="cliente-boton-editar">
                Editar
              </button>
              <button onClick={() => archivar(c._id)} className="cliente-boton-archivar">
                Archivar
              </button>
              <button onClick={() => eliminar(c._id)} className="cliente-boton-eliminar">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
