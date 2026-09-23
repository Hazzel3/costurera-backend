const mongoose = require('mongoose')

// ahora las medidas se guardan en "valores": un mapa flexible
// donde la llave es la clave de la medida y el valor es el numero.
// asi se pueden agregar o quitar medidas sin cambiar el codigo.
const medidasSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  valores: { type: Map, of: Number, default: {} },
  notas:   String,
}, { timestamps: true })

module.exports = mongoose.model('Medidas', medidasSchema)
