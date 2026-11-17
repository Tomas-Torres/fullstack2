package cl.levelup.carrito.client;

/**
 * Datos del producto que el carrito necesita copiar al agregar un item.
 */
public record ProductoInfo(
        Long id,
        String nombre,
        String imagen,
        Integer precioFinal,
        Integer stock,
        Boolean sinStock) {
}
