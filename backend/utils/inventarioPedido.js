const Material = require('../models/Material')
const MovimientoInventario = require('../models/MovimientoInventario')
const Presupuesto = require('../models/Presupuesto')

// estados en los que la prenda ya se hizo (el material ya se uso)
const ESTADOS_CON_MATERIAL = ['terminado', 'entregado']

// materiales que usa el pedido segun su presupuesto (cantidad + extra, sumados por material)
async function materialesDelPedido(pedido) {
  const presupuesto = await Presupuesto.findById(pedido.presupuesto)
  if (!presupuesto) return []

  const todos = await Material.find()
  const suma = {}
  for (const item of presupuesto.items) {
    for (const m of item.materiales) {
      // los presupuestos viejos no tienen el id, se busca el material por su nombre
      const mat = todos.find(t => String(t._id) === String(m.material)) ||
                  todos.find(t => t.descripcion === m.descripcion)
      if (!mat) continue
      const cantidad = (Number(m.cantidad) || 0) + (Number(m.extra) || 0)
      if (cantidad <= 0) continue
      const id = String(mat._id)
      if (!suma[id]) suma[id] = { material: mat, cantidad: 0 }
      suma[id].cantidad += cantidad
    }
  }
  return Object.values(suma).map(s => ({ ...s, cantidad: Math.round(s.cantidad * 100) / 100 }))
}

// descuenta del inventario. Si no alcanza algun material, no descuenta nada y lanza un error
async function descontarMateriales(pedido) {
  const lista = await materialesDelPedido(pedido)

  const faltan = lista.filter(l => l.material.stock < l.cantidad)
  if (faltan.length > 0) {
    const detalle = faltan
      .map(f => `${f.material.descripcion}: se necesitan ${f.cantidad}, hay ${f.material.stock}`)
      .join('\n')
    const error = new Error('No hay suficiente stock para terminar el pedido:\n' + detalle)
    error.status = 400
    throw error
  }

  const descontados = []
  for (const l of lista) {
    const ok = await Material.findOneAndUpdate(
      { _id: l.material._id, stock: { $gte: l.cantidad } },
      { $inc: { stock: -l.cantidad } }
    )
    if (!ok) {
      // alguien lo gasto justo ahora: devolver lo que ya se desconto
      for (const d of descontados) await Material.findByIdAndUpdate(d.material, { $inc: { stock: d.cantidad } })
      const error = new Error(`No hay suficiente stock de ${l.material.descripcion}`)
      error.status = 400
      throw error
    }
    descontados.push({ material: l.material._id, cantidad: l.cantidad })
  }

  for (const d of descontados) {
    await MovimientoInventario.create({
      material: d.material, tipo: 'salida', cantidad: d.cantidad, pedido: pedido._id,
      nota: 'Descontado al terminar el pedido',
    })
  }
  pedido.materialesDescontados = descontados
  return lista
}

// devuelve al inventario lo que se habia descontado
async function devolverMateriales(pedido, motivo) {
  for (const d of pedido.materialesDescontados) {
    await Material.findByIdAndUpdate(d.material, { $inc: { stock: d.cantidad } })
    await MovimientoInventario.create({
      material: d.material, tipo: 'entrada', cantidad: d.cantidad, costoTotal: 0, pedido: pedido._id,
      nota: `Devuelto: ${motivo}`,
    })
  }
  pedido.materialesDescontados = []
}

module.exports = { ESTADOS_CON_MATERIAL, descontarMateriales, devolverMateriales }
