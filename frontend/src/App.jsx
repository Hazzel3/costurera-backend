import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Clientes from './pages/Clientes'
import ClientesArchivados from './pages/ClientesArchivados'
import Medidas from './pages/Medidas'
import Ajustes from './pages/Ajustes'
import Materiales from './pages/Materiales'
import Prendas from './pages/Prendas'
import Presupuesto from './pages/Presupuesto'
import Presupuestos from './pages/Presupuestos'
import Pedidos from './pages/Pedidos'
import Contabilidad from './pages/Contabilidad'
import TiposMedida from './pages/TiposMedida'
import Usuarios from './pages/Usuarios'
import InicioCliente from './pages/InicioCliente'


function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ---- PAGINA DEL CLIENTE (vacia por ahora) ---- */}
          <Route path="/inicio" element={
            <RutaProtegida rol="cliente">
              <Layout><InicioCliente /></Layout>
            </RutaProtegida>
          } />

          {/* ---- PAGINAS DEL ADMIN (rol="admin") ---- */}
          <Route path="/" element={
            <RutaProtegida rol="admin">
              <Layout><Clientes /></Layout>
            </RutaProtegida>
          } />
          <Route path="/archivados" element={
            <RutaProtegida rol="admin">
              <Layout><ClientesArchivados /></Layout>
            </RutaProtegida>
          } />
          <Route path="/clientes/:clienteId/medidas" element={
            <RutaProtegida rol="admin">
              <Layout><Medidas /></Layout>
            </RutaProtegida>
          } />

          <Route path="/ajustes" element={
            <RutaProtegida rol="admin">
              <Layout><Ajustes /></Layout>
            </RutaProtegida>
          } />
          <Route path="/ajustes/materiales" element={
            <RutaProtegida rol="admin">
              <Layout><Materiales /></Layout>
            </RutaProtegida>
          } />
          <Route path="/ajustes/prendas" element={
            <RutaProtegida rol="admin">
              <Layout><Prendas /></Layout>
            </RutaProtegida>
          } />
          <Route path="/ajustes/medidas" element={
            <RutaProtegida rol="admin">
              <Layout><TiposMedida /></Layout>
            </RutaProtegida>
          } />
          <Route path="/ajustes/usuarios" element={
            <RutaProtegida rol="admin">
              <Layout><Usuarios /></Layout>
            </RutaProtegida>
          } />

          <Route path="/clientes/:clienteId/presupuesto" element={
            <RutaProtegida rol="admin">
              <Layout><Presupuesto /></Layout>
            </RutaProtegida>
          } />
          <Route path="/presupuestos" element={
            <RutaProtegida rol="admin">
              <Layout><Presupuestos /></Layout>
            </RutaProtegida>
          } />
          <Route path="/presupuestos/:presupuestoId/editar" element={
            <RutaProtegida rol="admin">
              <Layout><Presupuesto /></Layout>
            </RutaProtegida>
          } />
          <Route path="/pedidos" element={
            <RutaProtegida rol="admin">
              <Layout><Pedidos /></Layout>
            </RutaProtegida>
          } />
          <Route path="/contabilidad" element={
            <RutaProtegida rol="admin">
              <Layout><Contabilidad /></Layout>
            </RutaProtegida>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
