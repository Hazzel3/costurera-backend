// ============================================
// SCRIPT DE UNA SOLA VEZ
// Crea las 7 medidas que ya tenias y pasa las
// medidas guardadas de los clientes al nuevo formato.
// Correr con:  node configurar-medidas.js
// ============================================

require('dotenv').config()
const mongoose = require('mongoose')
const TipoMedida = require('./models/TipoMedida')

const BASE = [
  ['pecho', 'Pecho'],
  ['cintura', 'Cintura'],
  ['cadera', 'Cadera'],
  ['largoPierna', 'Largo de pierna'],
  ['largoBrazo', 'Largo de brazo'],
  ['muslo', 'Muslo'],
  ['altura', 'Altura'],
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)

  // 1) crear los tipos de medida base (si no existen ya)
  let orden = 0
  for (const [clave, nombre] of BASE) {
    const existe = await TipoMedida.findOne({ clave })
    if (!existe) await TipoMedida.create({ clave, nombre, orden })
    orden++
  }

  // 2) pasar las medidas viejas al nuevo campo "valores"
  const col = mongoose.connection.collection('medidas')
  const docs = await col.find({}).toArray()
  const claves = BASE.map(b => b[0])

  for (const d of docs) {
    if (d.valores) continue  // ya migrado, saltar
    const valores = {}
    for (const k of claves) {
      if (d[k] !== undefined && d[k] !== null && d[k] !== '') {
        valores[k] = Number(d[k])
      }
    }
    const unset = {}
    for (const k of claves) unset[k] = ''
    await col.updateOne({ _id: d._id }, { $set: { valores }, $unset: unset })
  }

  console.log('Listo: medidas base creadas y datos migrados.')
  process.exit()
}

run()
