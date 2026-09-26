import { useEffect, useState } from 'react'
import api from '../api'
import { quetzales } from '../utils/dinero'
import '../styles/Inventario.css'

// muestra una cantidad con maximo 2 decimales: 6.699999 -> "6.7"
function cantidad(n) {
  return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const TEXTO_TIPO = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' }

export default function Inventario() {
  const [materiales, setMateriales] = useState([])
  const [pedidos, setPedidos] = useState([])
  // panel abierto: { accion: 'entrada' | 'salida' | 'ajuste' | 'historial', material }
  const [panel, setPanel] = useState(null)
  const [form, setForm] = useState({})
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    cargar()
    api.get('/pedidos').then(({ data }) => setPedidos(data))
  }, [])

  async function cargar() {
    const { data } = await api.get('/inventario')
    setMateriales(data)
  }

  async function abrir(accion, material) {
    if (panel && panel.accion === accion && panel.material._id === material._id) {
      setPanel(null)
      return
    }
    setPanel({ accion, material })
    if (accion === 'entrada') setForm({ cantidad: '', costoTotal: '', nota: '', registrarGasto: true })
    if (accion === 'salida') setForm({ cantidad: '', nota: '', pedido: '' })
    if (accion === 'ajuste') setForm({ stockNuevo: material.stock, nota: '' })
    if (accion === 'historial') {
      const { data } = await api.get('/inventario/movimientos', { params: { material: material._id } })
      setMovimientos(data)
    }
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      await api.post(`/inventario/${panel.accion}`, { ...form, material: panel.material._id })
      setPanel(null)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'No se pudo guardar')
    }
  }

  function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const cuantosBajos = materiales.filter(m => m.bajo).length

  return (
    <div className="inv-pagina">

      <h1 className="inv-titulo">Inventario</h1>

      {cuantosBajos > 0 && (
        <p className="inv-aviso">
          ⚠ {cuantosBajos} {cuantosBajos === 1 ? 'material está' : 'materiales están'} en stock bajo
        </p>
      )}

      <div className="inv-cabecera">
        <span className="inv-col-material">Material</span>
        <span className="inv-col-unidad">Unidad</span>
        <span className="inv-col-stock">Stock</span>
        <span className="inv-col-minimo">Mínimo</span>
        <span className="inv-col-acciones"></span>
      </div>

      <div className="inv-lista">
        {materiales.length === 0 && (
          <p className="inv-vacio">No hay materiales. Agrégalos en Ajustes → Materiales.</p>
        )}
        {materiales.map(m => (
          <div key={m._id} className="inv-bloque">
            <div className="inv-fila">
              <span className="inv-col-material">
                {m.descripcion}
                {m.bajo && <span className="inv-etiqueta-bajo">Stock bajo</span>}
              </span>
              <span className="inv-col-unidad">{m.medida}</span>
              <span className="inv-col-stock">{cantidad(m.stock)}</span>
              <span className="inv-col-minimo">{cantidad(m.stockMinimo)}</span>
              <span className="inv-col-acciones">
                <button onClick={() => abrir('entrada', m)} className="inv-boton-entrada">+ Entrada</button>
                <button onClick={() => abrir('salida', m)} className="inv-boton-salida">− Salida</button>
                <button onClick={() => abrir('ajuste', m)} className="inv-boton">Ajustar</button>
                <button onClick={() => abrir('historial', m)} className="inv-boton">Historial</button>
              </span>
            </div>

            {panel && panel.material._id === m._id && panel.accion === 'entrada' && (
              <form onSubmit={guardar} className="inv-form">
                <p className="inv-form-titulo">Entrada de {m.descripcion}</p>
                <label className="inv-etiqueta">
                  Cantidad ({m.medida || 'unidades'})
                  <input type="number" step="0.01" min="0.01" required className="inv-input"
                    value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                </label>
                <label className="inv-etiqueta">
                  Costo total (Q)
                  <input type="number" step="0.01" min="0" className="inv-input"
                    value={form.costoTotal} onChange={e => setForm({ ...form, costoTotal: e.target.value })} />
                </label>
                <input placeholder="Nota (ej: comprado en tienda X)" className="inv-input"
                  value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} />
                <label className="inv-casilla">
                  <input type="checkbox" checked={form.registrarGasto}
                    onChange={e => setForm({ ...form, registrarGasto: e.target.checked })} />
                  Registrar como gasto en Contabilidad
                </label>
                <div className="inv-form-botones">
                  <button type="submit" className="inv-boton-guardar">Guardar</button>
                  <button type="button" onClick={() => setPanel(null)} className="inv-boton-cancelar">Cancelar</button>
                </div>
              </form>
            )}

            {panel && panel.material._id === m._id && panel.accion === 'salida' && (
              <form onSubmit={guardar} className="inv-form">
                <p className="inv-form-titulo">Salida de {m.descripcion} (hay {cantidad(m.stock)})</p>
                <label className="inv-etiqueta">
                  Cantidad ({m.medida || 'unidades'})
                  <input type="number" step="0.01" min="0.01" required className="inv-input"
                    value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                </label>
                <select className="inv-input" value={form.pedido}
                  onChange={e => setForm({ ...form, pedido: e.target.value })}>
                  <option value="">Sin pedido</option>
                  {pedidos.map(p => (
                    <option key={p._id} value={p._id}>{p.clienteNombre} — {p.descripcion}</option>
                  ))}
                </select>
                <input placeholder="Nota" className="inv-input"
                  value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} />
                <div className="inv-form-botones">
                  <button type="submit" className="inv-boton-guardar">Guardar</button>
                  <button type="button" onClick={() => setPanel(null)} className="inv-boton-cancelar">Cancelar</button>
                </div>
              </form>
            )}

            {panel && panel.material._id === m._id && panel.accion === 'ajuste' && (
              <form onSubmit={guardar} className="inv-form">
                <p className="inv-form-titulo">Ajustar {m.descripcion} al conteo real</p>
                <label className="inv-etiqueta">
                  Stock real ({m.medida || 'unidades'})
                  <input type="number" step="0.01" min="0" required className="inv-input"
                    value={form.stockNuevo} onChange={e => setForm({ ...form, stockNuevo: e.target.value })} />
                </label>
                <input placeholder="Nota (ej: conteo de fin de mes)" className="inv-input"
                  value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} />
                <div className="inv-form-botones">
                  <button type="submit" className="inv-boton-guardar">Guardar</button>
                  <button type="button" onClick={() => setPanel(null)} className="inv-boton-cancelar">Cancelar</button>
                </div>
              </form>
            )}

            {panel && panel.material._id === m._id && panel.accion === 'historial' && (
              <div className="inv-historial">
                <p className="inv-form-titulo">Historial de {m.descripcion}</p>
                {movimientos.length === 0 && <p className="inv-vacio">Sin movimientos todavía</p>}
                {movimientos.map(mov => (
                  <div key={mov._id} className="inv-movimiento">
                    <span className={`inv-mov-tipo inv-mov-${mov.tipo}`}>{TEXTO_TIPO[mov.tipo]}</span>
                    <span className="inv-mov-cantidad">
                      {mov.cantidad > 0 && mov.tipo !== 'salida' ? '+' : ''}
                      {mov.tipo === 'salida' ? '−' : ''}{cantidad(mov.cantidad)}
                    </span>
                    <span className="inv-mov-detalle">
                      {fecha(mov.fecha)}
                      {mov.costoTotal > 0 && ` · ${quetzales(mov.costoTotal)}`}
                      {mov.pedido && ` · Pedido: ${mov.pedido.clienteNombre}`}
                      {mov.nota && ` · ${mov.nota}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
