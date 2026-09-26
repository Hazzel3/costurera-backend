import { useEffect, useState } from 'react'
import api from '../api'
import { quetzales } from '../utils/dinero'
import '../styles/MiCuenta.css'

const TEXTO_ESTADO = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  terminado:  'Terminado, ¡lista para recoger!',
  entregado:  'Entregado',
}

export default function MiCuenta() {
  const [pestana, setPestana] = useState('pedidos')
  const [perfil, setPerfil] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [medidas, setMedidas] = useState({ lista: [], notas: '' })
  const [abierto, setAbierto] = useState(null)

  useEffect(() => {
    api.get('/mi/perfil').then(({ data }) => setPerfil(data))
    api.get('/mi/pedidos').then(({ data }) => setPedidos(data))
    api.get('/mi/presupuestos').then(({ data }) => setPresupuestos(data))
    api.get('/mi/medidas').then(({ data }) => setMedidas(data))
  }, [])

  function fecha(iso, esFechaDeEntrega) {
    return new Date(iso).toLocaleDateString('es-GT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: esFechaDeEntrega ? 'UTC' : undefined,
    })
  }

  return (
    <div className="micuenta-pagina">

      <h1 className="micuenta-titulo">Hola, {perfil?.nombre}</h1>

      <div className="micuenta-pestanas">
        <button
          onClick={() => setPestana('pedidos')}
          className={pestana === 'pedidos' ? 'micuenta-pestana micuenta-pestana-activa' : 'micuenta-pestana'}
        >
          Mis pedidos
        </button>
        <button
          onClick={() => setPestana('presupuestos')}
          className={pestana === 'presupuestos' ? 'micuenta-pestana micuenta-pestana-activa' : 'micuenta-pestana'}
        >
          Mis presupuestos
        </button>
        <button
          onClick={() => setPestana('medidas')}
          className={pestana === 'medidas' ? 'micuenta-pestana micuenta-pestana-activa' : 'micuenta-pestana'}
        >
          Mis medidas
        </button>
      </div>

      {pestana === 'pedidos' && (
        <div className="micuenta-lista">
          {pedidos.length === 0 && <p className="micuenta-vacio">Todavía no tienes pedidos</p>}
          {pedidos.map(p => (
            <div key={p._id} className="micuenta-tarjeta">
              <p className="micuenta-tarjeta-titulo">{p.descripcion || 'Pedido'}</p>
              <span className={`micuenta-estado micuenta-estado-${p.estado}`}>{TEXTO_ESTADO[p.estado]}</span>
              <p className="micuenta-detalle">
                {p.fechaEntrega ? `Entrega: ${fecha(p.fechaEntrega, true)}` : 'Fecha de entrega por confirmar'}
              </p>
              <p className="micuenta-detalle">
                Total {quetzales(p.total)} · Pagado {quetzales(p.pagado)} · Saldo {quetzales(p.saldo)}
              </p>
            </div>
          ))}
        </div>
      )}

      {pestana === 'presupuestos' && (
        <div className="micuenta-lista">
          {presupuestos.length === 0 && <p className="micuenta-vacio">Todavía no tienes presupuestos</p>}
          {presupuestos.map(p => (
            <div
              key={p._id}
              className="micuenta-tarjeta micuenta-tarjeta-clic"
              onClick={() => setAbierto(abierto === p._id ? null : p._id)}
            >
              <p className="micuenta-tarjeta-titulo">
                {p.items.map(i => i.prendaNombre).join(', ') || 'Presupuesto'}
              </p>
              <p className="micuenta-detalle">
                {fecha(p.createdAt)} · Total {quetzales(p.total)}
                <span className="micuenta-ver">{abierto === p._id ? ' ▲ ocultar' : ' ▼ ver materiales'}</span>
              </p>

              {abierto === p._id && p.items.map((item, i) => (
                <div key={i} className="micuenta-prenda">
                  <p className="micuenta-prenda-nombre">
                    {item.prendaNombre} · {Number(item.yardas).toFixed(2)} yardas de tela
                  </p>
                  {item.materiales.map((m, j) => (
                    <p key={j} className="micuenta-material">
                      <span>{m.descripcion} × {Number((m.cantidad || 0) + (m.extra || 0)).toFixed(2)}</span>
                      <span>{quetzales(((m.cantidad || 0) + (m.extra || 0)) * (m.precioUnitario || 0))}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {pestana === 'medidas' && (
        <div className="micuenta-lista">
          {medidas.lista.length === 0 && <p className="micuenta-vacio">Todavía no hay medidas registradas</p>}
          {medidas.lista.length > 0 && (
            <div className="micuenta-tarjeta">
              {medidas.lista.map(m => (
                <p key={m.nombre} className="micuenta-medida">
                  <span>{m.nombre}</span>
                  <span className="micuenta-medida-valor">{m.valor} cm</span>
                </p>
              ))}
              {medidas.notas && <p className="micuenta-detalle">{medidas.notas}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
