import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')
    const cliente = localStorage.getItem('cliente')
    return token ? { token, nombre, rol, cliente } : null
  })

  function login(datos) {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('nombre', datos.nombre)
    localStorage.setItem('rol', datos.rol)
    localStorage.setItem('cliente', datos.cliente || '')
    setUsuario(datos)
  }

  function logout() {
    localStorage.clear()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
