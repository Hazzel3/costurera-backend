const mongoose = require('mongoose')

// categorias de cada tipo (aqui se agregan mas)
const CATEGORIAS = {
  ingreso: ['pago de cliente', 'otro ingreso'],
  gasto:   ['compra de material', 'servicios', 'otro gasto'],
}

// el dia de hoy en Guatemala (a medianoche), para que las fechas no se corran de dia
function hoy() {
  return new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }))
}

const transaccionSchema = new mongoose.Schema({
  tipo:        { type: String, enum: ['ingreso', 'gasto'], required: true },
  monto:       { type: Number, required: true, min: 0 },
  categoria:   String,
  descripcion: String,
  fecha:       { type: Date, default: hoy },
  cliente:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  pedido:      { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },
  movimientoInventario: { type: mongoose.Schema.Types.ObjectId, ref: 'MovimientoInventario' },
}, { timestamps: true })

const Transaccion = mongoose.model('Transaccion', transaccionSchema)
Transaccion.CATEGORIAS = CATEGORIAS

module.exports = Transaccion
