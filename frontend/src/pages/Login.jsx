import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { abrirWhatsApp, TELEFONO_COSTURERA } from '../utils/whatsapp'
import '../styles/Login.css'
import '../styles/OlvidePassword.css'


export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [mostrarOlvide, setMostrarOlvide] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data)
      // el cliente va a su pagina; el admin va al inicio normal
      navigate(data.rol === 'cliente' ? '/mi-cuenta' : '/')
    } catch {
      setError('Correo o contraseña incorrectos')
    }
  }

  function pedirAyuda() {
    if (!TELEFONO_COSTURERA) {
      alert('Todavía no está configurado el número de la costurera (TELEFONO_COSTURERA en utils/whatsapp.js)')
      return
    }
    const correo = form.email ? ` Mi correo es ${form.email}.` : ''
    abrirWhatsApp(TELEFONO_COSTURERA, '', `Hola, olvidé mi contraseña de la app.${correo}🧵 ¿Me ayudas a restablecerla?🙏`)
  }

  return (
    <div
      className="login-fondo"
      style={{
        backgroundImage: 'url(/foto.png)',  // ← imagen del FONDO de toda la pantalla
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* la caja es un "lienzo": cada cosa adentro se mueve con top y left */}
      <div className="login-caja">

        <h1 className="login-titulo"></h1>

        <p className="login-subtitulo"></p>

        <form onSubmit={handleSubmit}>

          {/* grupo del correo */}
          <div className="login-grupo-correo">
            <label className="login-label"></label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="login-input"
              placeholder="Ingrese su correo"
              required
            />
          </div>

          {/* grupo de la contraseña */}
          <div className="login-grupo-password">
            <label className="login-label"></label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="login-input"
              placeholder="Ingrese su contraseña "
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-boton">
            ENTRAR CON ESTILO
          </button>
        </form>

        <button type="button" onClick={() => setMostrarOlvide(true)} className="olvide-enlace">
          ¿Olvidaste tu contraseña?
        </button>

        {mostrarOlvide && (
          <div className="olvide-panel">
            <p className="olvide-titulo">¿Olvidaste tu contraseña?</p>
            <p className="olvide-texto">
              La costurera puede darte una nueva. Escribe tu correo arriba (si quieres) y
              pídele ayuda por WhatsApp.
            </p>
            <button type="button" onClick={pedirAyuda} className="olvide-boton">
              Pedir ayuda por WhatsApp
            </button>
            <button type="button" onClick={() => setMostrarOlvide(false)} className="olvide-cerrar">
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
