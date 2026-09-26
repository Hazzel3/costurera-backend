// rutas del portal del cliente: cada cliente solo ve SUS datos.
// nunca se recibe un id de cliente desde la URL o el body; se usa el de su cuenta.
const router = require('express').Router()
const User = require('../models/User')
const Cliente = require('../models/Cliente')
const Medidas = require('../models/Medidas')
const TipoMedida = require('../models/TipoMedida')
const Presupuesto = require('../models/Presupuesto')
const Pedido = require('../models/Pedido')
const { auth, soloCliente } = require('../middleware/auth')
const { conPagos } = require('../utils/pagos')

router.use(auth, soloCliente)

// revisa que la cuenta siga existiendo (por si le quitaron el acceso) y toma su cliente
router.use(async (req, res, next) => {
  const usuario = await User.findById(req.usuario.id)
  if (!usuario || !usuario.cliente) {
    return res.status(401).json({ mensaje: 'Tu cuenta ya no tiene acceso' })
  }
  req.clienteId = usuario.cliente
  next()
})

// nombre y telefono
router.get('/perfil', async (req, res) => {
  const cliente = await Cliente.findById(req.clienteId).select('nombre telefono')
  res.json(cliente)
})

// medidas con su nombre visible: [{ nombre: 'Pecho', valor: 90 }, ...]
router.get('/medidas', async (req, res) => {
  const medidas = await Medidas.findOne({ cliente: req.clienteId })
  const tipos = await TipoMedida.find().sort({ orden: 1, nombre: 1 })
  if (!medidas) return res.json({ lista: [], notas: '' })

  const lista = tipos
    .filter(t => medidas.valores.has(t.clave))
    .map(t => ({ nombre: t.nombre, valor: medidas.valores.get(t.clave) }))
  res.json({ lista, notas: medidas.notas || '' })
})

// presupuestos (mas nuevos primero)
router.get('/presupuestos', async (req, res) => {
  const presupuestos = await Presupuesto.find({ cliente: req.clienteId }).sort({ createdAt: -1 })
  res.json(presupuestos)
})

// pedidos con pagado y saldo (sin las notas internas de la costurera)
router.get('/pedidos', async (req, res) => {
  const pedidos = await Pedido.find({ cliente: req.clienteId }).select('-notas').sort({ createdAt: -1 })
  res.json(await conPagos(pedidos))
})

module.exports = router
