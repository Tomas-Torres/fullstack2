package cl.levelup.pagos.exception;

/**
 * Se lanza cuando la orden ya tiene un pago aprobado.
 */
public class PagoDuplicadoException extends RuntimeException {

    private final Long ordenId;

    public PagoDuplicadoException(Long ordenId) {
        super("La orden " + ordenId + " ya tiene un pago aprobado");
        this.ordenId = ordenId;
    }

    public Long getOrdenId() {
        return ordenId;
    }
}
