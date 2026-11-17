package cl.levelup.pagos.exception;

/**
 * Error de validacion asociado a un campo concreto del cuerpo de la peticion.
 */
public class PagoInvalidoException extends RuntimeException {

    private final String campo;

    public PagoInvalidoException(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
