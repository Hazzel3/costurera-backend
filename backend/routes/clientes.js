const router = require('express').Router()
const Cliente = require('../models/Cliente')
const User = require('../models/User')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// lista principal: solo clientes NO archivados
router.get('/', async (req, res) => {
  const clientes = await Cliente.find({ archivado: { $ne: true } }).sort({ nombre: 1 })
  res.json(clientes)
})

// lista de archivados
router.get('/archivados', async (req, res) => {
  const clientes = await Cliente.find({ archivado: true }).sort({ nombre: 1 })
  res.json(clientes)
})

router.post('/', async (req, res) => {
  const cliente = await Cliente.create(req.body)
  res.status(201).json(cliente)
})

router.put('/:id', async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(cliente)
})

// archivar un cliente
router.put('/:id/archivar', async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, { archivado: true }, { new: true })
  res.json(cliente)
})

// desarchivar un cliente
router.put('/:id/desarchivar', async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, { archivado: false }, { new: true })
  res.json(cliente)
})

router.delete('/:id', async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id)
  await User.deleteMany({ cliente: req.params.id, rol: 'cliente' })   // tambien se borra su cuenta
  res.json({ mensaje: 'Cliente eliminado' })
})

module.exports = router
