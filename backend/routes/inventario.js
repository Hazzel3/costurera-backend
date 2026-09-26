const router = require('express').Router()
const Material = require('../models/Material')
const MovimientoInventario = require('../models/MovimientoInventario')
const Transaccion = require('../models/Transaccion')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// materiales con su stock, y "bajo: true" si ya queda poco (solo si tiene stock minimo configurado)
router.get('/', async (req, res) => {
  const materiales = await Material.find().sort({ descripcion: 1 })
  res.json(materiales.map(m => ({ ...m.toObject(), bajo: m.stockMinimo > 0 && m.stock <= m.stockMinimo })))
})

// historial de un material: /movimientos?material=<id>
router.get('/movimientos', async (req, res) => {
  const movimientos = await MovimientoInventario.find({ material: req.query.material })
    .populate('pedido', 'clienteNombre descripcion')
    .sort({ fecha: -1 })
  res.json(movimientos)
})

// entrada: llego material (compra)
router.post('/entrada', async (req, res) => {
  const { material, nota, registrarGasto = true } = req.body
  const cantidad = Number(req.body.cantidad)
  const costoTotal = Number(req.body.costoTotal) || 0
  if (!(cantidad > 0)) return res.status(400).json({ mensaje: 'La cantidad debe ser mayor que 0' })

  const mat = await Material.findByIdAndUpdate(material, { $inc: { stock: cantidad } }, { new: true })
  if (!mat) return res.status(404).json({ mensaje: 'Material no encontrado' })

  const movimiento = await MovimientoInventario.create({ material, tipo: 'entrada', cantidad, costoTotal, nota })

  if (registrarGasto && costoTotal > 0) {
    await Transaccion.create({
      tipo:        'gasto',
      categoria:   'compra de material',
      monto:       costoTotal,
      descripcion: `Compra de ${cantidad} ${mat.medida || ''} de ${mat.descripcion}`,
      movimientoInventario: movimiento._id,
    })
  }
  res.status(201).json(movimiento)
})

// salida: se uso material
router.post('/salida', async (req, res) => {
  const { material, nota, pedido } = req.body
  const cantidad = Number(req.body.cantidad)
  if (!(cantidad > 0)) return res.status(400).json({ mensaje: 'La cantidad debe ser mayor que 0' })

  // solo resta si hay suficiente stock
  const mat = await Material.findOneAndUpdate(
    { _id: material, stock: { $gte: cantidad } },
    { $inc: { stock: -cantidad } },
    { new: true }
  )
  if (!mat) return res.status(400).json({ mensaje: 'No hay suficiente stock' })

  const movimiento = await MovimientoInventario.create({ material, tipo: 'salida', cantidad, nota, pedido: pedido || undefined })
  res.status(201).json(movimiento)
})

// ajuste: corregir el stock al conteo real
router.post('/ajuste', async (req, res) => {
  const { material, nota } = req.body
  const stockNuevo = Number(req.body.stockNuevo)
  if (!(stockNuevo >= 0)) return res.status(400).json({ mensaje: 'El stock no puede ser negativo' })

  const mat = await Material.findById(material)
  if (!mat) return res.status(404).json({ mensaje: 'Material no encontrado' })

  const diferencia = stockNuevo - mat.stock
  mat.stock = stockNuevo
  await mat.save()

  const movimiento = await MovimientoInventario.create({ material, tipo: 'ajuste', cantidad: diferencia, nota })
  res.status(201).json(movimiento)
})

module.exports = router
