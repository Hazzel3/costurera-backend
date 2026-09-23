import { useEffect, useState } from 'react'
import api from '../api'
import '../styles/Clientes.css'

export default function ClientesArchivados() {
  const [clientes, setClientes] = useState([])

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await api.get('/clientes/archivados')
    setClientes(data)
  }

  async function desarchivar(id) {
    await api.put(`/clientes/${id}/desarchivar`)
    cargar()
  }

  return (
    <div className="clientes-pagina">
      <div className="clientes-encabezado">
        <h1 className="clientes-titulo">Clientes archivados</h1>
      </div>

      <div className="clientes-lista">
        {clientes.length === 0 && (
          <p className="clientes-vacio">No hay clientes archivados</p>
        )}
        {clientes.map(c => (
          <div key={c._id} className="cliente-tarjeta">
            <div>
              <p className="cliente-nombre">{c.nombre}</p>
              {c.telefono && <p className="cliente-telefono">{c.telefono}</p>}
            </div>
            <div className="cliente-acciones">
              <button onClick={() => desarchivar(c._id)} className="cliente-boton-medidas">
                Desarchivar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
