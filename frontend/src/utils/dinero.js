// convierte un numero en texto de quetzales: 1234.5 -> "Q1,234.50"
export function quetzales(numero) {
  return 'Q' + Number(numero || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
