package cl.levelup.carrito.exception;

/**
 * La cantidad pedida supera el stock disponible del producto.
 */
public class StockInsuficienteException extends RuntimeException {

    private final Long productoId;
    private final int disponible;
    private final int solicitado;

    public StockInsuficienteException(Long productoId, int disponible, int solicitado) {
        super("Stock insuficiente para el producto " + productoId
                + ": disponible " + disponible + ", solicitado " + solicitado);
        this.productoId = productoId;
        this.disponible = disponible;
        this.solicitado = solicitado;
    }

    public Long getProductoId() {
        return productoId;
    }

    public int getDisponible() {
        return disponible;
    }

    public int getSolicitado() {
        return solicitado;
    }
}
