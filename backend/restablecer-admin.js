// ============================================
// Para cuando la administradora olvida su contraseña.
// Correr en la carpeta backend con:
//   node restablecer-admin.js                 (la deja en admin123)
//   node restablecer-admin.js NuevaClave123   (la deja en NuevaClave123)
// ============================================

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const nueva = process.argv[2] || 'admin123'
  const admin = await User.findOne({ email: 'admin@costurera.com' })
  if (!admin) {
    console.log('No existe admin@costurera.com. Corre primero: node seed.js')
    return process.exit()
  }
  admin.password = nueva
  await admin.save()   // el modelo la encripta solo
  console.log(`Listo: admin@costurera.com ahora entra con "${nueva}"`)
  process.exit()
}

run()
