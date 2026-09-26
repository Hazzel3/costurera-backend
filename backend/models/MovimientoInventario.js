const mongoose = require('mongoose')

const movimientoSchema = new mongoose.Schema({
  material:  { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  tipo:      { type: String, enum: ['entrada', 'salida', 'ajuste'], required: true },
  cantidad:  { type: Number, required: true },   // en los ajustes puede ser negativa (la diferencia)
  costoTotal: Number,                            // solo en entradas
  nota:      String,
  pedido:    { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },   // opcional, en salidas
  fecha:     { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('MovimientoInventario', movimientoSchema)
