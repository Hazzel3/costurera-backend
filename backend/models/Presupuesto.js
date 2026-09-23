const mongoose = require('mongoose')

/* cada material calculado dentro de una prenda del presupuesto */
const itemMaterialSchema = new mongoose.Schema({
  descripcion:    String,
  cantidad:       Number,   // cantidad calculada automaticamente
  extra:          Number,   // ajuste manual (+/-)
  precioUnitario: Number,   // precio guardado al momento de crear el presupuesto
}, { _id: false })

/* cada prenda incluida en el presupuesto */
const itemPrendaSchema = new mongoose.Schema({
  prendaNombre: String,
  yardas:       Number,     // yardas de tela calculadas
  materiales:   [itemMaterialSchema],
}, { _id: false })

const presupuestoSchema = new mongoose.Schema({
  cliente:       { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  clienteNombre: String,    // guardado para mostrarlo rapido en la lista
  items:         [itemPrendaSchema],
  total:         Number,
  notas:         String,
}, { timestamps: true })

module.exports = mongoose.model('Presupuesto', presupuestoSchema)
