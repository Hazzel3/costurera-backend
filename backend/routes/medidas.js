const router = require('express').Router()
const Medidas = require('../models/Medidas')
const { auth, soloAdmin } = require('../middleware/auth')

router.use(auth, soloAdmin)

// obtener las medidas de un cliente
router.get('/:clienteId', async (req, res) => {
  const medidas = await Medidas.findOne({ cliente: req.params.clienteId })
  res.json(medidas)
})

// crear o actualizar las medidas de un cliente
router.post('/:clienteId', async (req, res) => {
  const medidas = await Medidas.findOneAndUpdate(
    { cliente: req.params.clienteId },
    {
      valores: req.body.valores || {},
      notas: req.body.notas || '',
      cliente: req.params.clienteId,
    },
    { upsert: true, new: true }
  )
  res.json(medidas)
})

module.exports = router
