package cl.levelup.carrito.exception;

/**
 * El codigo de cupon no corresponde a ningun cupon vigente.
 */
public class CuponInvalidoException extends RuntimeException {

    public CuponInvalidoException() {
        super("Cupón inválido.");
    }
}
