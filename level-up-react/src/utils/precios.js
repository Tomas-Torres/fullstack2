// Utilidades de precios compartidas por tarjetas, carrito y checkout.

// Formatea un monto en pesos chilenos: 29990 -> "$29.990"
export const formatoCLP = (n) => '$' + Number(n).toLocaleString('es-CL')

// Devuelve el precio final aplicando el % de oferta (0 = sin oferta).
export const precioConOferta = (producto) => {
  if (!producto.oferta || producto.oferta <= 0) return producto.precio
  return Math.round(producto.precio * (1 - producto.oferta / 100))
}

// Opciones de entrega del checkout (también se usan en las pruebas).
export const ENTREGAS = [
  { id: 'estandar', nombre: 'Despacho a domicilio (2-3 días hábiles)', costo: 2990 },
  { id: 'express', nombre: 'Despacho exprés (24 horas)', costo: 4990 },
  { id: 'retiro', nombre: 'Retiro en tienda (Centro de Santiago)', costo: 0 },
]
