const router = require('express').Router()
const Pedido = require('../models/Pedido')
const Presupuesto = require('../models/Presupuesto')
const Cliente = require('../models/Cliente')
const Transaccion = require('../models/Transaccion')
const { auth, soloAdmin } = require('../middleware/auth')
const { conPagos } = require('../utils/pagos')
const { ESTADOS_CON_MATERIAL, descontarMateriales, devolverMateriales } = require('../utils/inventarioPedido')

router.use(auth, soloAdmin)

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
  const pedido = await Pedido.findById(req.params.id)
  if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' })

  const datos = { ...req.body }
  delete datos.materialesDescontados   // esto solo lo maneja el sistema
  if (datos.cliente) {
    const cliente = await Cliente.findById(datos.cliente)
    if (!cliente) return res.status(400).json({ mensaje: 'Cliente no encontrado' })
    datos.clienteNombre = cliente.nombre
  }

  // inventario: al terminar se descuentan los materiales; si se regresa a pendiente/en proceso, se devuelven
  let aviso = ''
  if (datos.estado && datos.estado !== pedido.estado) {
    const yaDescontado = pedido.materialesDescontados.length > 0
    const usaMaterial = ESTADOS_CON_MATERIAL.includes(datos.estado)

    if (usaMaterial && !yaDescontado) {
      if (!pedido.presupuesto) {
        aviso = 'Este pedido no viene de un presupuesto: descuenta los materiales a mano en Inventario.'
      } else {
        try {
          const lista = await descontarMateriales(pedido)
          aviso = lista.length > 0
            ? 'Se descontó del inventario:\n' + lista.map(l => `${l.cantidad} ${l.material.medida || ''} de ${l.material.descripcion}`).join('\n')
            : 'El presupuesto no tiene materiales del inventario para descontar.'
        } catch (err) {
          return res.status(err.status || 500).json({ mensaje: err.message })
        }
      }
    }
    if (!usaMaterial && yaDescontado) {
      await devolverMateriales(pedido, `el pedido regresó a "${datos.estado}"`)
      aviso = 'Los materiales se devolvieron al inventario.'
    }
  }

  pedido.set(datos)
  await pedido.save()
  res.json({ ...pedido.toObject(), aviso })
})

// borrar
router.delete('/:id', async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
  if (pedido && pedido.materialesDescontados.length > 0) {
    await devolverMateriales(pedido, 'se eliminó el pedido')
  }
  await Pedido.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Pedido eliminado' })
})

module.exports = router
