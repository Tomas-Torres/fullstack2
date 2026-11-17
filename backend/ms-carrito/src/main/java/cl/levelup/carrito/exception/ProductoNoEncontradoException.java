package cl.levelup.carrito.exception;

/**
 * El producto consultado no existe o no esta activo en ms-productos.
 */
public class ProductoNoEncontradoException extends RuntimeException {

    private final Long productoId;

    public ProductoNoEncontradoException(Long productoId) {
        super("Producto no encontrado con id " + productoId);
        this.productoId = productoId;
    }

    public Long getProductoId() {
        return productoId;
    }
}
