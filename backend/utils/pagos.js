const Transaccion = require('../models/Transaccion')

// agrega "pagado" (suma de pagos del pedido) y "saldo" (lo que falta) a cada pedido
async function conPagos(pedidos) {
  const pagos = await Transaccion.find({ tipo: 'ingreso', pedido: { $in: pedidos.map(p => p._id) } })
  return pedidos.map(p => {
    const pagado = pagos
      .filter(t => String(t.pedido) === String(p._id))
      .reduce((suma, t) => suma + t.monto, 0)
    const saldo = Math.round((p.total - pagado) * 100) / 100   // redondeado a centavos
    return { ...p.toObject(), pagado, saldo }
  })
}

module.exports = { conPagos }
