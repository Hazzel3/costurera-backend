const router = require('express').Router()
const Pedido = require('../models/Pedido')
const Presupuesto = require('../models/Presupuesto')
const Cliente = require('../models/Cliente')
const Transaccion = require('../models/Transaccion')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// agrega "pagado" (suma de pagos del pedido) y "saldo" (lo que falta) a cada pedido
async function conPagos(pedidos) {
  const pagos = await Transaccion.find({ tipo: 'ingreso', pedido: { $in: pedidos.map(p => p._id) } })
  return pedidos.map(p => {
    const pagado = pagos
      .filter(t => String(t.pedido) === String(p._id))
      .reduce((suma, t) => suma + t.monto, 0)
    const saldo = Math.round((p.total - pagado) * 100) / 100   // redondeado a centavos
    return { ...p.toObject(), pagado, saldo }
  })
}

// todos los pedidos (mas nuevos primero), se puede filtrar con ?estado=pendiente
router.get('/', async (req, res) => {
  const filtro = {}
  if (req.query.estado) filtro.estado = req.query.estado
  const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 })
  res.json(await conPagos(pedidos))
})

// un pedido por su id
router.get('/:id', async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
  if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' })
  const [conSaldo] = await conPagos([pedido])
  res.json(conSaldo)
})

// crear
router.post('/', async (req, res) => {
  const cliente = await Cliente.findById(req.body.cliente)
  if (!cliente) return res.status(400).json({ mensaje: 'Cliente no encontrado' })
  const pedido = await Pedido.create({ ...req.body, clienteNombre: cliente.nombre })
  res.status(201).json(pedido)
})

// registrar un pago del cliente (se guarda como ingreso en contabilidad)
router.post('/:id/pagos', async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
  if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' })

  const monto = Number(req.body.monto)
  if (!(monto > 0)) return res.status(400).json({ mensaje: 'El monto debe ser mayor que 0' })

  const pago = await Transaccion.create({
    tipo:        'ingreso',
    categoria:   'pago de cliente',
    monto,
    descripcion: `Pago de ${pedido.clienteNombre}: ${pedido.descripcion || 'pedido'}${req.body.nota ? ' - ' + req.body.nota : ''}`,
    cliente:     pedido.cliente,
    pedido:      pedido._id,
  })
  res.status(201).json(pago)
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
