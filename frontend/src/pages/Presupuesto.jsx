import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Presupuesto.css'

// 1 yarda = 91.44 centimetros
const CM_POR_YARDA = 91.44

// calcula una prenda a partir de las medidas del cliente
function calcularItem(prenda, medidas) {
  const receta = prenda.recetaTela || {}
  const claves = receta.medidas || []

  // sumar las medidas que la receta indica (por ahora la operacion es "sumar")
  const suma = claves.reduce((acc, k) => acc + (Number(medidas?.[k]) || 0), 0)

  const factorCorr = Number(receta.factorCorreccion) || 1
  const yardas = (suma / CM_POR_YARDA) * factorCorr

  const materiales = (prenda.materiales || []).map(m => {
    const info = m.material || {}
    const cantidad = m.modo === 'porYarda'
      ? (Number(m.factor) || 0) * yardas
      : (Number(m.factor) || 0)
    return {
      descripcion: info.descripcion || 'Material',
      cantidad: Math.round(cantidad * 100) / 100,
      extra: 0,
      precioUnitario: Number(info.precioUnitario) || 0,
    }
  })

  return {
    prendaNombre: prenda.nombre,
    yardas: Math.round(yardas * 100) / 100,
    materiales,
  }
}

function totalItem(item) {
  return item.materiales.reduce(
    (a, m) => a + (Number(m.cantidad) + Number(m.extra || 0)) * Number(m.precioUnitario),
    0
  )
}

export default function Presupuesto() {
  const { clienteId, presupuestoId } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState(null)
  const [medidas, setMedidas] = useState({})   // los valores de medidas del cliente
  const [prendas, setPrendas] = useState([])
  const [items, setItems] = useState([])
  const [prendaElegida, setPrendaElegida] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: listaPrendas } = await api.get('/prendas')
      setPrendas(listaPrendas)

      if (presupuestoId) {
        const { data: p } = await api.get(`/presupuestos/${presupuestoId}`)
        setItems(p.items || [])
        setCliente({ _id: p.cliente, nombre: p.clienteNombre })
      } else {
        const [{ data: listaClientes }, { data: m }] = await Promise.all([
          api.get('/clientes'),
          api.get(`/medidas/${clienteId}`),
        ])
        setCliente(listaClientes.find(c => c._id === clienteId) || null)
        setMedidas(m?.valores || {})   // <-- ahora las medidas vienen en "valores"
      }
    }
    cargar()
  }, [clienteId, presupuestoId])

  function agregarPrenda() {
    if (!prendaElegida) return
    const prenda = prendas.find(p => p._id === prendaElegida)
    if (!prenda) return
    setItems([...items, calcularItem(prenda, medidas || {})])
    setPrendaElegida('')
  }

  function quitarPrenda(indice) {
    setItems(items.filter((_, i) => i !== indice))
  }

  function cambiarExtra(iPrenda, iMaterial, valor) {
    const copia = items.map((item, i) => {
      if (i !== iPrenda) return item
      const mats = item.materiales.map((m, j) =>
        j === iMaterial ? { ...m, extra: valor } : m
      )
      return { ...item, materiales: mats }
    })
    setItems(copia)
  }

  const total = items.reduce((a, item) => a + totalItem(item), 0)

  async function guardar() {
    setGuardando(true)
    const datos = {
      cliente: cliente?._id || clienteId,
      clienteNombre: cliente?.nombre || '',
      items: items.map(item => ({
        ...item,
        materiales: item.materiales.map(m => ({ ...m, extra: Number(m.extra) || 0 })),
      })),
      total,
    }
    if (presupuestoId) {
      await api.put(`/presupuestos/${presupuestoId}`, datos)
    } else {
      await api.post('/presupuestos', datos)
    }
    navigate('/presupuestos')
  }

  return (
    <div className="pres-pagina">

      <button onClick={() => navigate(-1)} className="pres-volver">← Volver</button>

      <h1 className="pres-titulo">Presupuesto de {cliente?.nombre}</h1>

      <div className="pres-agregar">
        <select
          value={prendaElegida}
          onChange={e => setPrendaElegida(e.target.value)}
          className="pres-select"
        >
          <option value="">-- elige una prenda --</option>
          {prendas.map(p => (
            <option key={p._id} value={p._id}>{p.nombre}</option>
          ))}
        </select>
        <button onClick={agregarPrenda} className="pres-boton-agregar">+ Agregar prenda</button>
      </div>

      {items.length === 0 && (
        <p className="pres-vacio">Agrega una prenda para empezar el cálculo</p>
      )}

      {items.map((item, i) => (
        <div key={i} className="pres-prenda">
          <div className="pres-prenda-cabecera">
            <div>
              <span className="pres-prenda-nombre">{item.prendaNombre}</span>
              <span className="pres-prenda-yardas">{item.yardas} yardas de tela</span>
            </div>
            <button onClick={() => quitarPrenda(i)} className="pres-quitar">Quitar</button>
          </div>

          <div className="pres-mat-cabecera">
            <span className="pres-col-mat">Material</span>
            <span className="pres-col-cant">Cantidad</span>
            <span className="pres-col-extra">Extra</span>
            <span className="pres-col-sub">Subtotal</span>
          </div>

          {item.materiales.map((m, j) => {
            const subtotal = (Number(m.cantidad) + Number(m.extra || 0)) * Number(m.precioUnitario)
            return (
              <div key={j} className="pres-mat-fila">
                <span className="pres-col-mat">{m.descripcion}</span>
                <span className="pres-col-cant">{m.cantidad}</span>
                <span className="pres-col-extra">
                  <input
                    type="number"
                    step="0.01"
                    value={m.extra}
                    onChange={e => cambiarExtra(i, j, e.target.value)}
                    className="pres-input-extra"
                  />
                </span>
                <span className="pres-col-sub">Q{subtotal.toFixed(2)}</span>
              </div>
            )
          })}

          <div className="pres-prenda-total">
            Subtotal prenda: Q{totalItem(item).toFixed(2)}
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="pres-final">
          <div className="pres-total">Total: Q{total.toFixed(2)}</div>
          <button onClick={guardar} disabled={guardando} className="pres-boton-guardar">
            {guardando ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </div>
      )}
    </div>
  )
}
