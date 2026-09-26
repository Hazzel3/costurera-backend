const router = require('express').Router()
const User = require('../models/User')
const Cliente = require('../models/Cliente')
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

// la cuenta vinculada a un cliente (o null si no tiene)
router.get('/cliente/:clienteId', async (req, res) => {
  const usuario = await User.findOne({ cliente: req.params.clienteId }).select('-password')
  res.json(usuario)
})

// crear un usuario nuevo (si no se manda rol, es una cuenta de cliente)
router.post('/', async (req, res) => {
  const { email, password, cliente } = req.body
  const rol = req.body.rol || 'cliente'
  let nombre = req.body.nombre

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Falta el correo o la contraseña' })
  }

  const existe = await User.findOne({ email })
  if (existe) {
    return res.status(400).json({ mensaje: 'Ese correo ya está registrado' })
  }

  const datos = { email, password, rol }

  // una cuenta de cliente siempre debe estar vinculada a un cliente, y solo una por cliente
  if (rol === 'cliente') {
    const c = await Cliente.findById(cliente)
    if (!c) return res.status(400).json({ mensaje: 'Hay que elegir un cliente' })
    const yaTiene = await User.findOne({ cliente })
    if (yaTiene) return res.status(400).json({ mensaje: 'Ese cliente ya tiene una cuenta' })
    datos.cliente = cliente
    if (!nombre) nombre = c.nombre
  }
  datos.nombre = nombre

  const usuario = await User.create(datos)
  res.status(201).json({
    _id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  })
})

// restablecer la contraseña de un usuario
router.put('/:id/password', async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 6) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' })
  }
  const usuario = await User.findById(req.params.id)
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
  usuario.password = password
  await usuario.save()   // al guardar, el modelo la encripta solo
  res.json({ mensaje: 'Contraseña actualizada' })
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
