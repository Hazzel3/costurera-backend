const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
  descripcion:   { type: String, required: true },   // ej: "Tela 1", "Aguja", "Botones"
  medida:        { type: String },                   // ej: "yarda", "unidad"
  precioUnitario:{ type: Number, default: 0 },       // precio por cada medida
  stock:         { type: Number, default: 0 },       // cantidad disponible (se cambia desde Inventario)
  stockMinimo:   { type: Number, default: 0 },       // si el stock llega a esto, avisa "stock bajo"
}, { timestamps: true })

module.exports = mongoose.model('Material', materialSchema)
