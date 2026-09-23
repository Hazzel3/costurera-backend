const mongoose = require('mongoose')

/* cada material que usa la prenda */
const materialDePrendaSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  modo:     { type: String, enum: ['porYarda', 'porPrenda'], default: 'porYarda' },
  factor:   { type: Number, default: 1 },   // acepta decimales (ej: 25 agujas por yarda)
}, { _id: false })

const prendaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },   // ej: "Blusa", "Pantalon"

  /* recetita de la tela */
  recetaTela: {
    // que medidas del cliente se usan (ej: ["pecho", "largoBrazo"])
    medidas:   { type: [String], default: [] },
    // como se combinan esas medidas. Por ahora solo "sumar",
    // pero se puede agregar "promediar", "multiplicar", etc. en el futuro
    operacion: { type: String, default: 'sumar' },
    // factor de correccion (ej: 1, 1.23). Ajusta el resultado final de yardas
    factorCorreccion: { type: Number, default: 1 },
  },

  /* lista de materiales que usa la prenda */
  materiales: { type: [materialDePrendaSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Prenda', prendaSchema)
