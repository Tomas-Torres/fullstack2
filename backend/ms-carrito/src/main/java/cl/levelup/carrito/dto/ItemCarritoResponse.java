package cl.levelup.carrito.dto;

import cl.levelup.carrito.model.ItemCarrito;

/**
 * Linea del carrito tal como la consume el frontend.
 */
public record ItemCarritoResponse(
        Long productoId,
        String nombre,
        String imagen,
        Integer precioUnitario,
        Integer cantidad,
        Integer subtotal) {

    public static ItemCarritoResponse from(ItemCarrito item) {
        return new ItemCarritoResponse(
                item.getProductoId(),
                item.getNombre(),
                item.getImagen(),
                item.getPrecioUnitario(),
                item.getCantidad(),
                item.subtotal());
    }
}
