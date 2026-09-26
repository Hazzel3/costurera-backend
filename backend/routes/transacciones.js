const router = require('express').Router()
const Transaccion = require('../models/Transaccion')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// las categorias de ingresos y gastos (estan en el modelo)
router.get('/categorias', (req, res) => {
  res.json(Transaccion.CATEGORIAS)
})

// resumen de un mes: /resumen?mes=2026-09
router.get('/resumen', async (req, res) => {
  const [anio, mes] = req.query.mes.split('-').map(Number)
  const desde = new Date(Date.UTC(anio, mes - 1, 1))
  const hasta = new Date(Date.UTC(anio, mes, 1))

  const lista = await Transaccion.find({ fecha: { $gte: desde, $lt: hasta } })
  let ingresos = 0
  let gastos = 0
  for (const t of lista) {
    if (t.tipo === 'ingreso') ingresos += t.monto
    else gastos += t.monto
  }
  const redondear = n => Math.round(n * 100) / 100   // a centavos
  res.json({ ingresos: redondear(ingresos), gastos: redondear(gastos), balance: redondear(ingresos - gastos) })
})

// lista filtrada: ?desde=2026-09-01&hasta=2026-09-30&tipo=ingreso
router.get('/', async (req, res) => {
  const filtro = {}
  if (req.query.tipo) filtro.tipo = req.query.tipo
  if (req.query.desde || req.query.hasta) {
    filtro.fecha = {}
    if (req.query.desde) filtro.fecha.$gte = new Date(req.query.desde)
    if (req.query.hasta) {
      const hasta = new Date(req.query.hasta)
      hasta.setUTCDate(hasta.getUTCDate() + 1)   // incluir todo el ultimo dia
      filtro.fecha.$lt = hasta
    }
  }
  const lista = await Transaccion.find(filtro).sort({ fecha: -1, createdAt: -1 })
  res.json(lista)
})

// crear
router.post('/', async (req, res) => {
  const transaccion = await Transaccion.create(req.body)
  res.status(201).json(transaccion)
})

// editar
router.put('/:id', async (req, res) => {
  const transaccion = await Transaccion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  res.json(transaccion)
})

// borrar
router.delete('/:id', async (req, res) => {
  await Transaccion.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Transacción eliminada' })
})

module.exports = router
