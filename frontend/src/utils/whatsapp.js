// numero de WhatsApp de la costurera (para "Olvide mi contraseña"). Ej: '55551234'
export const TELEFONO_COSTURERA = ''

// mensaje que se envia cuando la prenda esta lista
export const MENSAJE_LISTO = 'Hola {nombre}, tu prenda ya está lista para recoger. ¡Muchas gracias!'

// abre WhatsApp Web directo en el chat del cliente, con el mensaje ya escrito
export function abrirWhatsApp(telefono, nombre, mensaje = MENSAJE_LISTO) {
  let numero = (telefono || '').replace(/\D/g, '')
  if (numero.length === 8) numero = '502' + numero

  if (numero.length < 8) {
    alert('Este cliente no tiene un teléfono válido')
    return
  }

  const texto = mensaje.replace('{nombre}', nombre || '')
  const url = `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`
  window.open(url, 'whatsapp-web')
}
