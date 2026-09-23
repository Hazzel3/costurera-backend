require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function crearAdmin() {
  await mongoose.connect(process.env.MONGO_URI)
  const existe = await User.findOne({ email: 'admin@costurera.com' })
  if (existe) {
    console.log('El admin ya existe')
    return process.exit()
  }
  await User.create({
    nombre: 'Administrador',
    email: 'admin@costurera.com',
    password: 'admin123',
    rol: 'admin',
  })
  console.log('Admin creado: admin@costurera.com / admin123')
  process.exit()
}

crearAdmin()
