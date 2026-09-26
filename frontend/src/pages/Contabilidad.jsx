import { useEffect, useState } from 'react'
import api from '../api'
import { quetzales } from '../utils/dinero'
import '../styles/Contabilidad.css'

function mesActual() {
  return new Date().toLocaleDateString('en-CA').slice(0, 7)
}

function hoy() {
  return new Date().toLocaleDateString('en-CA')
}

// primer y ultimo dia del mes: "2026-09" -> ["2026-09-01", "2026-09-30"]
function rangoDelMes(mes) {
  const [anio, m] = mes.split('-').map(Number)
  const ultimoDia = new Date(anio, m, 0).getDate()
  return [`${mes}-01`, `${mes}-${String(ultimoDia).padStart(2, '0')}`]
}

export default function Contabilidad() {
  const [mes, setMes] = useState(mesActual())
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 })
  const [transacciones, setTransacciones] = useState([])
  const [categorias, setCategorias] = useState({ ingreso: [], gasto: [] })
  const [form, setForm] = useState(null)
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    api.get('/transacciones/categorias').then(({ data }) => setCategorias(data))
  }, [])

  useEffect(() => { cargar() }, [mes])

  async function cargar() {
    if (!mes) return
    const [desde, hasta] = rangoDelMes(mes)
    const [res1, res2] = await Promise.all([
      api.get('/transacciones/resumen', { params: { mes } }),
      api.get('/transacciones', { params: { desde, hasta } }),
    ])
    setResumen(res1.data)
    setTransacciones(res2.data)
  }

  function nueva(tipo) {
    setForm({ tipo, monto: '', categoria: categorias[tipo][0] || '', descripcion: '', fecha: hoy() })
    setEditando(null)
  }

  function iniciarEdicion(t) {
    setForm({
      tipo: t.tipo,
      monto: t.monto,
      categoria: t.categoria || '',
      descripcion: t.descripcion || '',
      fecha: t.fecha.slice(0, 10),
    })
    setEditando(t._id)
  }

  async function guardar(e) {
    e.preventDefault()
    const datos = { ...form, monto: Number(form.monto) }
    if (editando) {
      await api.put(`/transacciones/${editando}`, datos)
    } else {
      await api.post('/transacciones', datos)
    }
    setForm(null)
    setEditando(null)
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este movimiento?')) return
    await api.delete(`/transacciones/${id}`)
    cargar()
  }

  function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
  }

  return (
    <div className="conta-pagina">

      <div className="conta-encabezado">
        <h1 className="conta-titulo">Contabilidad</h1>
        <input
          type="month"
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="conta-mes"
        />
      </div>

      <div className="conta-resumen">
        <div className="conta-tarjeta conta-tarjeta-ingresos">
          <p className="conta-tarjeta-titulo">Ingresos</p>
          <p className="conta-tarjeta-monto">{quetzales(resumen.ingresos)}</p>
        </div>
        <div className="conta-tarjeta conta-tarjeta-gastos">
          <p className="conta-tarjeta-titulo">Gastos</p>
          <p className="conta-tarjeta-monto">{quetzales(resumen.gastos)}</p>
        </div>
        <div className="conta-tarjeta conta-tarjeta-balance">
          <p className="conta-tarjeta-titulo">Balance</p>
          <p className="conta-tarjeta-monto">{quetzales(resumen.balance)}</p>
        </div>
      </div>

      <div className="conta-botones">
        <button onClick={() => nueva('ingreso')} className="conta-boton-ingreso">+ Ingreso</button>
        <button onClick={() => nueva('gasto')} className="conta-boton-gasto">+ Gasto</button>
      </div>

      {form && (
        <form onSubmit={guardar} className="conta-form">
          <p className="conta-form-titulo">
            {editando ? 'Editar' : 'Nuevo'} {form.tipo === 'ingreso' ? 'ingreso' : 'gasto'}
          </p>
          <label className="conta-etiqueta">
            Monto (Q)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })}
              className="conta-input"
              required
            />
          </label>
          <label className="conta-etiqueta">
            Categoría
            <select
              value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })}
              className="conta-input"
            >
              {categorias[form.tipo].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <input
            placeholder="Descripción"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            className="conta-input"
          />
          <label className="conta-etiqueta">
            Fecha
            <input
              type="date"
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              className="conta-input"
              required
            />
          </label>
          <div className="conta-form-botones">
            <button type="submit" className="conta-boton-guardar">Guardar</button>
            <button type="button" onClick={() => setForm(null)} className="conta-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      <div className="conta-lista">
        {transacciones.length === 0 && (
          <p className="conta-vacio">No hay movimientos este mes</p>
        )}
        {transacciones.map(t => (
          <div key={t._id} className="conta-fila">
            <div className="conta-fila-info">
              <p className="conta-fila-descripcion">{t.descripcion || t.categoria}</p>
              <p className="conta-fila-detalle">
                {fecha(t.fecha)} · {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} · {t.categoria}
              </p>
            </div>
            <p className={t.tipo === 'ingreso' ? 'conta-fila-monto conta-monto-ingreso' : 'conta-fila-monto conta-monto-gasto'}>
              {t.tipo === 'ingreso' ? '+' : '−'}{quetzales(t.monto)}
            </p>
            <div className="conta-fila-acciones">
              <button onClick={() => iniciarEdicion(t)} className="conta-boton-editar">Editar</button>
              <button onClick={() => eliminar(t._id)} className="conta-boton-eliminar">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
