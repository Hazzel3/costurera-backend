const router = require('express').Router()
const Pedido = require('../models/Pedido')
const Presupuesto = require('../models/Presupuesto')
const Cliente = require('../models/Cliente')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// todos los pedidos (mas nuevos primero), se puede filtrar con ?estado=pendiente
router.get('/', async (req, res) => {
  const filtro = {}
  if (req.query.estado) filtro.estado = req.query.estado
  const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 })
  res.json(pedidos)
})

// un pedido por su id
router.get('/:id', async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
  if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' })
  res.json(pedido)
})

// crear
router.post('/', async (req, res) => {
  const cliente = await Cliente.findById(req.body.cliente)
  if (!cliente) return res.status(400).json({ mensaje: 'Cliente no encontrado' })
  const pedido = await Pedido.create({ ...req.body, clienteNombre: cliente.nombre })
  res.status(201).json(pedido)
})

// crear un pedido a partir de un presupuesto guardado
router.post('/desde-presupuesto/:presupuestoId', async (req, res) => {
  const presupuesto = await Presupuesto.findById(req.params.presupuestoId)
  if (!presupuesto) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' })

  const prendas = presupuesto.items.map(item => item.prendaNombre).join(', ')
  const pedido = await Pedido.create({
    cliente:       presupuesto.cliente,
    clienteNombre: presupuesto.clienteNombre,
    presupuesto:   presupuesto._id,
    descripcion:   prendas,
    total:         presupuesto.total || 0,
  })
  res.status(201).json(pedido)
})

// editar (tambien sirve para cambiar el estado)
router.put('/:id', async (req, res) => {
  const datos = { ...req.body }
  if (datos.cliente) {
    const cliente = await Cliente.findById(datos.cliente)
    if (!cliente) return res.status(400).json({ mensaje: 'Cliente no encontrado' })
    datos.clienteNombre = cliente.nombre
  }
  const pedido = await Pedido.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true })
  res.json(pedido)
})

// borrar
router.delete('/:id', async (req, res) => {
  await Pedido.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Pedido eliminado' })
})

module.exports = router
