const router = require('express').Router()
const User = require('../models/User')
const { auth, soloAdmin } = require('../middleware/auth')

// todo lo de aqui es solo para administradores
router.use(auth, soloAdmin)

// listar todos los usuarios (sin la contraseña) con el nombre del cliente vinculado
router.get('/', async (req, res) => {
  const usuarios = await User.find()
    .select('-password')
    .populate('cliente', 'nombre')
    .sort({ createdAt: -1 })
  res.json(usuarios)
})

// crear un usuario nuevo
router.post('/', async (req, res) => {
  const { nombre, email, password, rol, cliente } = req.body

  const existe = await User.findOne({ email })
  if (existe) {
    return res.status(400).json({ mensaje: 'Ese correo ya está registrado' })
  }

  const datos = { nombre, email, password, rol }
  // solo los usuarios cliente llevan un cliente vinculado
  if (rol === 'cliente' && cliente) datos.cliente = cliente

  const usuario = await User.create(datos)
  res.status(201).json({
    _id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  })
})

// eliminar un usuario
router.delete('/:id', async (req, res) => {
  // no dejar que alguien se borre a si mismo
  if (req.params.id === req.usuario.id) {
    return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' })
  }

  // no dejar borrar el ultimo administrador (para no quedarse sin acceso)
  const usuario = await User.findById(req.params.id)
  if (usuario && usuario.rol === 'admin') {
    const admins = await User.countDocuments({ rol: 'admin' })
    if (admins <= 1) {
      return res.status(400).json({ mensaje: 'Debe quedar al menos un administrador' })
    }
  }

  await User.findByIdAndDelete(req.params.id)
  res.json({ mensaje: 'Usuario eliminado' })
})

module.exports = router
