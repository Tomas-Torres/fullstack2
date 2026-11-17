// Traducciones entre los DTO de los microservicios y el formato que usan las
// pantallas. Mantenerlas en un solo archivo evita repetir campos por pagina.
import { productosIniciales } from '../data/ProductosIniciales'

const descripcionesPorNombre = new Map(
  productosIniciales.map((producto) => [producto.nombre, producto.descripcion])
)

/**
 * Producto de ms-productos -> producto de la tienda.
 */
export function productoDesdeApi(producto) {
  const descuento = producto.descuento ?? 0
  return {
    id: producto.id,
    nombre: producto.nombre,
    categoriaId: producto.categoriaId,
    categoria: producto.categoriaNombre,
    atributo: producto.atributo ?? '',
    precio: producto.precio,
    oferta: descuento,
    precioFinal: producto.precioFinal,
    imagen: producto.imagen ?? '',
    stock: producto.stock ?? 0,
    activo: producto.activo !== false,
    descripcion:
      descripcionesPorNombre.get(producto.nombre) ||
      `${producto.atributo || 'Producto gamer'} de la categoría ${producto.categoriaNombre}.`,
  }
}

/**
 * Item del carrito de ms-carrito -> item de la tienda.
 * El id es el productoId, que es lo que necesitan las llamadas siguientes.
 */
export function itemDesdeApi(item) {
  return {
    id: item.productoId,
    nombre: item.nombre,
    precio: item.precioUnitario,
    precioUnitario: item.precioUnitario,
    imagen: item.imagen,
    cantidad: item.cantidad,
    subtotal: item.subtotal,
  }
}

const PORCENTAJES_CUPON = { LEVELUP10: 0.1, GAMER20: 0.2 }

/**
 * Respuesta completa de ms-carrito -> estado del CarritoContext.
 */
export function carritoDesdeApi(respuesta) {
  if (!respuesta) {
    return {
      items: [],
      cupon: null,
      totalUnidades: 0,
      subtotal: 0,
      descuento: 0,
      total: 0,
    }
  }

  const codigo = respuesta.cuponCodigo || null
  return {
    items: (respuesta.items || []).map(itemDesdeApi),
    cupon: codigo ? { codigo, porcentaje: PORCENTAJES_CUPON[codigo] ?? 0 } : null,
    totalUnidades: respuesta.totalUnidades ?? 0,
    subtotal: respuesta.subtotal ?? 0,
    descuento: respuesta.descuento ?? 0,
    total: respuesta.total ?? 0,
  }
}

/**
 * Datos del formulario de admin -> ProductoRequest de ms-productos.
 */
export function productoParaApi(datos) {
  return {
    nombre: datos.nombre,
    categoriaId: datos.categoriaId,
    atributo: datos.atributo,
    precio: datos.precio,
    descuento: datos.oferta ?? 0,
    stock: datos.stock,
    imagen: datos.imagen,
    activo: datos.activo !== false,
  }
}
