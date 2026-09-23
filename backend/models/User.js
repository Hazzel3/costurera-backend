const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 'admin' o 'cliente'
  rol: { type: String, enum: ['admin', 'cliente'], default: 'admin' },
  // si el usuario es un cliente, aqui se guarda a que cliente de la lista corresponde
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.verificarPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
