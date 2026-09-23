const router = require('express').Router()
const TipoMedida = require('../models/TipoMedida')
const { auth, soloAdmin } = require('../middleware/auth')
     
router.use(auth, soloAdmin)

// convierte "Contorno de cuello" -> "contorno_de_cuello"
function generarClave(nombre) {
  return (nombre || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quita acentos
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'medida'
}

// todas las medidas
router.get('/', async (req, res) => {
  const tipos = await TipoMedida.find().sort({ orden: 1, nombre: 1 })
  res.json(tipos)
})

// crear una medida nueva
router.post('/', async (req, res) => {
  const base = generarClave(req.body.nombre)
  let clave = base
  let n = 2
  // si ya existe esa clave, le agrega un numero para que sea unica
  while (await TipoMedida.findOne({ clave })) {
    clave = base + '_' + n
    n++
  }
  const tipo = await TipoMedida.create({ clave, nombre: req.body.nombre, orden: req.body.orden || 0 })
  res.status(201).json(tipo)
})

// borrar una medida
router.delete('/:id', async (req, res) => {
  await TipoMedida.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Tipo de medida eliminado' })
})

module.exports = router
