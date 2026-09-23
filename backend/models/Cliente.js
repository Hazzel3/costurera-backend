const mongoose = require('mongoose')

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String },
  notas: { type: String },
  archivado: { type: Boolean, default: false },   // clientes archivados no salen en la lista principal
}, { timestamps: true })

module.exports = mongoose.model('Cliente', clienteSchema)
