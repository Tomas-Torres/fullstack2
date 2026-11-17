package cl.levelup.carrito.dto;

import cl.levelup.carrito.model.Carrito;
import cl.levelup.carrito.model.Cupon;
import cl.levelup.carrito.model.ItemCarrito;

import java.util.List;

/**
 * Carrito completo con los totales ya calculados.
 */
public record CarritoResponse(
        Long usuarioId,
        List<ItemCarritoResponse> items,
        Integer totalUnidades,
        Integer subtotal,
        Integer descuento,
        Integer total,
        String cuponCodigo) {

    public static CarritoResponse from(Carrito carrito, Cupon cupon) {
        List<ItemCarrito> items = carrito.getItems();
        int totalUnidades = items.stream()
                .mapToInt(item -> item.getCantidad() == null ? 0 : item.getCantidad())
                .sum();
        int subtotal = items.stream()
                .mapToInt(ItemCarrito::subtotal)
                .sum();
        int descuento = cupon == null ? 0 : cupon.descuento(subtotal);

        return new CarritoResponse(
                carrito.getUsuarioId(),
                items.stream().map(ItemCarritoResponse::from).toList(),
                totalUnidades,
                subtotal,
                descuento,
                subtotal - descuento,
                carrito.getCuponCodigo());
    }

    /**
     * Carrito vacio para usuarios que todavia no agregaron nada.
     */
    public static CarritoResponse vacio(Long usuarioId) {
        return new CarritoResponse(usuarioId, List.of(), 0, 0, 0, 0, null);
    }
}
