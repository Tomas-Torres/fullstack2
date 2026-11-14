package cl.levelup.login.exception;

/**
 * El usuario autenticado no tiene permisos sobre el recurso solicitado.
 */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException() {
        super("No tienes permisos para realizar esta acción");
    }
}
