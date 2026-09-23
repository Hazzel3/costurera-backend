const router = require('express').Router()
const Presupuesto = require('../models/Presupuesto')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// todos los presupuestos (mas nuevos primero)
router.get('/', async (req, res) => {
  const presupuestos = await Presupuesto.find().sort({ createdAt: -1 })
  res.json(presupuestos)
})

// un presupuesto por su id
router.get('/:id', async (req, res) => {
  const presupuesto = await Presupuesto.findById(req.params.id)
  res.json(presupuesto)
})

// crear
router.post('/', async (req, res) => {
  const presupuesto = await Presupuesto.create(req.body)
  res.status(201).json(presupuesto)
})

// editar
router.put('/:id', async (req, res) => {
  const presupuesto = await Presupuesto.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(presupuesto)
})

// borrar
router.delete('/:id', async (req, res) => {
  await Presupuesto.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Presupuesto eliminado' })
})

module.exports = router
