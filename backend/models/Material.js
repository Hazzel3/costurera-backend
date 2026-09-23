const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
  descripcion:   { type: String, required: true },   // ej: "Tela 1", "Aguja", "Botones"
  medida:        { type: String },                   // ej: "yarda", "unidad"
  precioUnitario:{ type: Number, default: 0 },       // precio por cada medida
}, { timestamps: true })

module.exports = mongoose.model('Material', materialSchema)
