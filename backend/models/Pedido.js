const mongoose = require('mongoose')

const pedidoSchema = new mongoose.Schema({
  cliente:       { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  clienteNombre: String,    // guardado para mostrarlo rapido en la lista
  presupuesto:   { type: mongoose.Schema.Types.ObjectId, ref: 'Presupuesto' },
  descripcion:   String,
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'terminado', 'entregado'],
    default: 'pendiente',
  },
  total:         { type: Number, default: 0 },   // precio acordado con el cliente
  fechaEntrega:  Date,
  notas:         String,
}, { timestamps: true })

module.exports = mongoose.model('Pedido', pedidoSchema)
