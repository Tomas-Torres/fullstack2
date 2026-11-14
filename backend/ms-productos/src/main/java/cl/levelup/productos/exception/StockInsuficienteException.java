package cl.levelup.productos.exception;

/**
 * Se lanza cuando un ajuste de stock no puede completarse. Toda la operacion
 * se revierte y la API responde 409 con el detalle del producto que fallo.
 */
public class StockInsuficienteException extends RuntimeException {

    private final Long productoId;
    private final Integer disponible;
    private final Integer solicitado;

    public StockInsuficienteException(Long productoId, String motivo, Integer disponible, Integer solicitado) {
        super("No se puede ajustar el stock del producto " + productoId + ": " + motivo
                + " (disponible " + disponible + ", solicitado " + solicitado + ")");
        this.productoId = productoId;
        this.disponible = disponible;
        this.solicitado = solicitado;
    }

    public Long getProductoId() {
        return productoId;
    }

    public Integer getDisponible() {
        return disponible;
    }

    public Integer getSolicitado() {
        return solicitado;
    }
}
