const router = require('express').Router()
const Material = require('../models/Material')
const { auth, soloAdmin } = require('../middleware/auth')
     
router.use(auth, soloAdmin)
// obtener todos los materiales
router.get('/', async (req, res) => {
  const materiales = await Material.find().sort({ descripcion: 1 })
  res.json(materiales)
})

// crear un material nuevo
router.post('/', async (req, res) => {
  const material = await Material.create(req.body)
  res.status(201).json(material)
})

// editar un material
router.put('/:id', async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(material)
})

// borrar un material
router.delete('/:id', async (req, res) => {
  await Material.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Material eliminado' })
})

module.exports = router
