import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Usuarios.css'

const VACIO = { nombre: '', email: '', password: '', rol: 'cliente', cliente: '' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const [resU, resC] = await Promise.all([
      api.get('/usuarios'),
      api.get('/clientes'),
    ])
    setUsuarios(resU.data)
    setClientes(resC.data)
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    try {
      const datos = { ...form }
      if (datos.rol !== 'cliente') datos.cliente = ''  // un admin no lleva cliente
      await api.post('/usuarios', datos)
      setForm(VACIO)
      setMostrarForm(false)
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el usuario')
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'No se pudo eliminar')
    }
  }

  return (
    <div className="usuarios-pagina">

      {/* boton volver a ajustes */}
      <button onClick={() => navigate('/ajustes')} className="usuarios-volver">
        ← Volver a ajustes
      </button>

      <div className="usuarios-encabezado">
        <h1 className="usuarios-titulo">Usuarios</h1>
        <button
          onClick={() => { setForm(VACIO); setError(''); setMostrarForm(true) }}
          className="usuarios-boton-nuevo"
        >
          + Agregar usuario
        </button>
      </div>

      {/* fila de titulos de la tabla */}
      <div className="usuarios-cabecera">
        <span className="usuarios-col-nombre">Nombre</span>
        <span className="usuarios-col-email">Correo</span>
        <span className="usuarios-col-rol">Rol</span>
        <span className="usuarios-col-acciones"></span>
      </div>

      {/* formulario para crear */}
      {mostrarForm && (
        <form onSubmit={guardar} className="usuarios-form">
          <p className="usuarios-form-titulo">Nuevo usuario</p>

          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="usuarios-input"
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="usuarios-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="usuarios-input"
            required
          />

          {/* elegir el rol */}
          <select
            value={form.rol}
            onChange={e => setForm({ ...form, rol: e.target.value })}
            className="usuarios-input"
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>

          {/* solo si es cliente: a que cliente de la lista corresponde */}
          {form.rol === 'cliente' && (
            <select
              value={form.cliente}
              onChange={e => setForm({ ...form, cliente: e.target.value })}
              className="usuarios-input"
              required
            >
              <option value="">— Elegir cliente —</option>
              {clientes.map(c => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          )}

          {error && <p className="usuarios-error">{error}</p>}

          <div className="usuarios-form-botones">
            <button type="submit" className="usuarios-boton-guardar">Guardar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="usuarios-boton-cancelar">Cancelar</button>
          </div>
        </form>
      )}

      {/* lista de usuarios */}
      <div className="usuarios-lista">
        {usuarios.length === 0 && (
          <p className="usuarios-vacio">No hay usuarios aún</p>
        )}
        {usuarios.map(u => (
          <div key={u._id} className="usuario-fila">
            <span className="usuarios-col-nombre">{u.nombre}</span>
            <span className="usuarios-col-email">{u.email}</span>
            <span className="usuarios-col-rol">
              {u.rol === 'admin' ? 'Administrador' : 'Cliente'}
              {u.cliente ? ` · ${u.cliente.nombre}` : ''}
            </span>
            <span className="usuarios-col-acciones">
              {/* Oculta el botón 'Eliminar' únicamente para el correo admin principal */}
              {u.email !== 'admin@costurera.com' && (
                <button onClick={() => eliminar(u._id)} className="usuario-boton-eliminar">
                  Eliminar
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}