package cl.levelup.productos.dto;

import cl.levelup.productos.model.Producto;

/**
 * Datos de salida de un producto con los valores calculados del catalogo.
 */
public record ProductoResponse(
        Long id,
        String nombre,
        Long categoriaId,
        String categoriaNombre,
        String atributo,
        Integer precio,
        Integer descuento,
        Integer precioFinal,
        Integer stock,
        String imagen,
        Boolean activo,
        Boolean enOferta,
        Boolean sinStock) {

    public static ProductoResponse from(Producto producto) {
        int descuento = producto.getDescuento() == null ? 0 : producto.getDescuento();
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getAtributo(),
                producto.getPrecio(),
                descuento,
                producto.calcularPrecioFinal(),
                producto.getStock(),
                producto.getImagen(),
                producto.getActivo(),
                producto.estaEnOferta(),
                producto.estaSinStock());
    }
}
