import { useEffect, useState } from 'react'
import api from '../api'
import { abrirWhatsApp } from '../utils/whatsapp'
import '../styles/Pedidos.css'

const ESTADOS = [
  { valor: 'pendiente',  texto: 'Pendiente' },
  { valor: 'en_proceso', texto: 'En proceso' },
  { valor: 'terminado',  texto: 'Terminado' },
  { valor: 'entregado',  texto: 'Entregado' },
]

const FORM_VACIO = { cliente: '', descripcion: '', total: '', fechaEntrega: '', notas: '' }

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [editando, setEditando] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    api.get('/clientes').then(({ data }) => setClientes(data))
  }, [])

  useEffect(() => { cargar() }, [filtro])

  async function cargar() {
    const { data } = await api.get('/pedidos', { params: filtro ? { estado: filtro } : {} })
    setPedidos(data)
  }

  function nuevo() {
    setForm(FORM_VACIO)
    setEditando(null)
    setMostrarForm(true)
  }

  function iniciarEdicion(p) {
    setForm({
      cliente: p.cliente,
      descripcion: p.descripcion || '',
      total: p.total ?? '',
      fechaEntrega: p.fechaEntrega ? p.fechaEntrega.slice(0, 10) : '',
      notas: p.notas || '',
    })
    setEditando(p._id)
    setMostrarForm(true)
  }

  async function guardar(e) {
    e.preventDefault()
    const datos = { ...form, total: Number(form.total) || 0, fechaEntrega: form.fechaEntrega || null }
    if (editando) {
      await api.put(`/pedidos/${editando}`, datos)
    } else {
      await api.post('/pedidos', datos)
    }
    setMostrarForm(false)
    setEditando(null)
    cargar()
  }

  async function cambiarEstado(p, estado) {
    await api.put(`/pedidos/${p._id}`, { estado })
    if (estado === 'terminado' && confirm('¿Avisar al cliente por WhatsApp?')) {
      const cliente = clientes.find(c => c._id === p.cliente)
      abrirWhatsApp(cliente?.telefono, p.clienteNombre)
    }
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este pedido?')) return
    await api.delete(`/pedidos/${id}`)
    cargar()
  }

  function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
  }

  return (
    <div className="pedidos-pagina">

      <div className="pedidos-encabezado">
        <h1 className="pedidos-titulo">Pedidos</h1>
        <button onClick={nuevo} className="pedidos-boton-nuevo">+ Nuevo pedido</button>
      </div>

      <div className="pedidos-filtros">
        <button
          onClick={() => setFiltro('')}
          className={filtro === '' ? 'pedidos-filtro pedidos-filtro-activo' : 'pedidos-filtro'}
        >
          Todos
        </button>
        {ESTADOS.map(e => (
          <button
            key={e.valor}
            onClick={() => setFiltro(e.valor)}
            className={filtro === e.valor ? 'pedidos-filtro pedidos-filtro-activo' : 'pedidos-filtro'}
          >
            {e.texto}
          </button>
        ))}
      </div>

      {mostrarForm && (
        <form onSubmit={guardar} className="pedidos-form">
          <p className="pedidos-form-titulo">{editando ? 'Editar pedido' : 'Nuevo pedido'}</p>
          <select
            value={form.cliente}
            onChange={e => setForm({ ...form, cliente: e.target.value })}
            className="pedidos-input"
            required
          >
            <option value="">Elegir cliente *</option>
            {clientes.map(c => (
              <option key={c._id} value={c._id}>{c.nombre}</option>
            ))}
          </select>
          <input
            placeholder="Descripción (ej: blusa y falda para boda)"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            className="pedidos-input"
          />
          <label className="pedidos-etiqueta">
            Total (Q)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.total}
              onChange={e => setForm({ ...form, total: e.target.value })}
              className="pedidos-input"
            />
          </label>
          <label className="pedidos-etiqueta">
            Fecha de entrega
            <input
              type="date"
              value={form.fechaEntrega}
              onChange={e => setForm({ ...form, fechaEntrega: e.target.value })}
              className="pedidos-input"
            />
          </label>
          <textarea
            placeholder="Notas"
            value={form.notas}
            onChange={e => setForm({ ...form, notas: e.target.value })}
            className="pedidos-input"
            rows={2}
          />
          <div className="pedidos-form-botones">
            <button type="submit" className="pedidos-boton-guardar">Guardar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="pedidos-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      <div className="pedidos-lista">
        {pedidos.length === 0 && (
          <p className="pedidos-vacio">No hay pedidos</p>
        )}
        {pedidos.map(p => (
          <div key={p._id} className={`pedido-tarjeta pedido-${p.estado}`}>
            <div className="pedido-info">
              <p className="pedido-cliente">{p.clienteNombre}</p>
              {p.descripcion && <p className="pedido-descripcion">{p.descripcion}</p>}
              <p className="pedido-detalle">
                {p.fechaEntrega ? `Entrega: ${fecha(p.fechaEntrega)}` : 'Sin fecha de entrega'} · Q{Number(p.total).toFixed(2)}
              </p>
              {p.notas && <p className="pedido-notas">{p.notas}</p>}
            </div>
            <div className="pedido-acciones">
              <select
                value={p.estado}
                onChange={e => cambiarEstado(p, e.target.value)}
                className="pedido-estado"
              >
                {ESTADOS.map(e => (
                  <option key={e.valor} value={e.valor}>{e.texto}</option>
                ))}
              </select>
              <button onClick={() => iniciarEdicion(p)} className="pedido-boton-editar">Editar</button>
              <button onClick={() => eliminar(p._id)} className="pedido-boton-eliminar">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
