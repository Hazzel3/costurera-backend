const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const usuario = await User.findOne({ email })
  if (!usuario || !(await usuario.verificarPassword(password))) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' })
  }
  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol, cliente: usuario.cliente },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token, nombre: usuario.nombre, rol: usuario.rol, cliente: usuario.cliente })
})

module.exports = router
