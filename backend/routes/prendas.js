const router = require('express').Router()
const Prenda = require('../models/Prenda')
const { auth, soloAdmin } = require('../middleware/auth')
   
router.use(auth, soloAdmin)

// obtener todas las prendas (con los datos de sus materiales)
router.get('/', async (req, res) => {
  const prendas = await Prenda.find().populate('materiales.material').sort({ nombre: 1 })
  res.json(prendas)
})

// crear una prenda nueva
router.post('/', async (req, res) => {
  const prenda = await Prenda.create(req.body)
  res.status(201).json(prenda)
})

// editar una prenda
router.put('/:id', async (req, res) => {
  const prenda = await Prenda.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(prenda)
})

// borrar una prenda
router.delete('/:id', async (req, res) => {
  await Prenda.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Prenda eliminada' })
})

module.exports = router
