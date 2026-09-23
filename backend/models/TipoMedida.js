const mongoose = require('mongoose')

// cada "tipo de medida" es una medida que se le toma al cliente
// (pecho, cintura, o las nuevas que agregues)
const tipoMedidaSchema = new mongoose.Schema({
  clave:  { type: String, required: true, unique: true },  // nombre interno (no cambia)
  nombre: { type: String, required: true },                // nombre visible
  orden:  { type: Number, default: 0 },                    // para ordenarlas
}, { timestamps: true })

module.exports = mongoose.model('TipoMedida', tipoMedidaSchema)
