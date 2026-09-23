import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Prendas.css'

const PRENDA_VACIA = {
  nombre: '',
  recetaTela: { medidas: [], operacion: 'sumar', factorCorreccion: 1 },
  materiales: [],
}

export default function Prendas() {
  const [prendas, setPrendas] = useState([])
  const [materiales, setMateriales] = useState([])
  const [tiposMedida, setTiposMedida] = useState([])   // medidas configuradas en Ajustes
  const [form, setForm] = useState(PRENDA_VACIA)
  const [editando, setEditando] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const [{ data: p }, { data: m }, { data: t }] = await Promise.all([
      api.get('/prendas'),
      api.get('/materiales'),
      api.get('/tipos-medida'),
    ])
    setPrendas(p)
    setMateriales(m)
    setTiposMedida(t)
  }

  function nuevaPrenda() {
    setForm(PRENDA_VACIA)
    setEditando(null)
    setMostrarForm(true)
  }

  function editarPrenda(prenda) {
    setForm({
      nombre: prenda.nombre,
      recetaTela: {
        medidas: prenda.recetaTela?.medidas || [],
        operacion: prenda.recetaTela?.operacion || 'sumar',
        factorCorreccion: prenda.recetaTela?.factorCorreccion ?? 1,
      },
      materiales: (prenda.materiales || []).map(x => ({
        material: x.material?._id || x.material,
        modo: x.modo,
        factor: x.factor,
      })),
    })
    setEditando(prenda._id)
    setMostrarForm(true)
  }

  function toggleMedida(clave) {
    const yaEsta = form.recetaTela.medidas.includes(clave)
    const nuevas = yaEsta
      ? form.recetaTela.medidas.filter(m => m !== clave)
      : [...form.recetaTela.medidas, clave]
    setForm({ ...form, recetaTela: { ...form.recetaTela, medidas: nuevas } })
  }

  function agregarMaterial() {
    setForm({
      ...form,
      materiales: [...form.materiales, { material: '', modo: 'porYarda', factor: 1 }],
    })
  }

  function cambiarMaterial(indice, campo, valor) {
    const copia = [...form.materiales]
    copia[indice] = { ...copia[indice], [campo]: valor }
    setForm({ ...form, materiales: copia })
  }

  function quitarMaterial(indice) {
    setForm({ ...form, materiales: form.materiales.filter((_, i) => i !== indice) })
  }

  async function guardar(e) {
    e.preventDefault()
    const datos = {
      ...form,
      recetaTela: { ...form.recetaTela, factorCorreccion: Number(form.recetaTela.factorCorreccion) || 1 },
      materiales: form.materiales
        .filter(m => m.material)
        .map(m => ({ ...m, factor: Number(m.factor) || 0 })),
    }
    if (editando) {
      await api.put(`/prendas/${editando}`, datos)
    } else {
      await api.post('/prendas', datos)
    }
    setMostrarForm(false)
    setEditando(null)
    setForm(PRENDA_VACIA)
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta prenda?')) return
    await api.delete(`/prendas/${id}`)
    cargar()
  }

  return (
    <div className="prendas-pagina">

      <button onClick={() => navigate('/ajustes')} className="prendas-volver">
        ← Volver a ajustes
      </button>

      <div className="prendas-encabezado">
        <h1 className="prendas-titulo">Prendas</h1>
        <button onClick={nuevaPrenda} className="prendas-boton-nuevo">+ Nueva prenda</button>
      </div>

      {mostrarForm && (
        <form onSubmit={guardar} className="prendas-form">
          <p className="prendas-form-titulo">{editando ? 'Editar prenda' : 'Nueva prenda'}</p>

          <label className="prendas-label">Nombre de la prenda</label>
          <input
            placeholder="ej: Blusa"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="prendas-input"
            required
          />

          <div className="prendas-seccion">
            <p className="prendas-seccion-titulo">Receta de tela</p>
            <p className="prendas-ayuda">Marca las medidas que se usan para calcular la tela:</p>

            <div className="prendas-medidas">
              {tiposMedida.map(t => (
                <label key={t.clave} className="prendas-check">
                  <input
                    type="checkbox"
                    checked={form.recetaTela.medidas.includes(t.clave)}
                    onChange={() => toggleMedida(t.clave)}
                  />
                  {t.nombre}
                </label>
              ))}
            </div>

            <label className="prendas-label">Factor de corrección (ej: 1, 1.2)</label>
            <input
              type="number"
              step="0.01"
              value={form.recetaTela.factorCorreccion}
              onChange={e => setForm({ ...form, recetaTela: { ...form.recetaTela, factorCorreccion: e.target.value } })}
              className="prendas-input-corto"
            />
          </div>

          <div className="prendas-seccion">
            <p className="prendas-seccion-titulo">Materiales de la prenda</p>

            {form.materiales.map((fila, i) => (
              <div key={i} className="prendas-material-fila">
                <select
                  value={fila.material}
                  onChange={e => cambiarMaterial(i, 'material', e.target.value)}
                  className="prendas-select"
                >
                  <option value="">-- material --</option>
                  {materiales.map(m => (
                    <option key={m._id} value={m._id}>{m.descripcion}</option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  value={fila.factor}
                  onChange={e => cambiarMaterial(i, 'factor', e.target.value)}
                  className="prendas-factor"
                />

                <select
                  value={fila.modo}
                  onChange={e => cambiarMaterial(i, 'modo', e.target.value)}
                  className="prendas-modo"
                >
                  <option value="porYarda">× yarda</option>
                  <option value="porPrenda">× prenda</option>
                </select>

                <button type="button" onClick={() => quitarMaterial(i)} className="prendas-quitar">✕</button>
              </div>
            ))}

            <button type="button" onClick={agregarMaterial} className="prendas-boton-agregar-mat">
              + Agregar material
            </button>
          </div>

          <div className="prendas-form-botones">
            <button type="submit" className="prendas-boton-guardar">Guardar prenda</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="prendas-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      <div className="prendas-lista">
        {prendas.length === 0 && <p className="prendas-vacio">No hay prendas aún</p>}
        {prendas.map(p => (
          <div key={p._id} className="prenda-tarjeta">
            <div>
              <p className="prenda-nombre">{p.nombre}</p>
              <p className="prenda-detalle">
                {p.materiales?.length || 0} materiales · tela de {p.recetaTela?.medidas?.length || 0} medidas
              </p>
            </div>
            <div className="prenda-acciones">
              <button onClick={() => editarPrenda(p)} className="prenda-boton-editar">Editar</button>
              <button onClick={() => eliminar(p._id)} className="prenda-boton-eliminar">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
