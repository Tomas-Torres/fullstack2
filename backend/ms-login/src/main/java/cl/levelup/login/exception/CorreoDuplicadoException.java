package cl.levelup.login.exception;

/**
 * El correo ya pertenece a otra cuenta.
 */
public class CorreoDuplicadoException extends RuntimeException {

    public CorreoDuplicadoException() {
        super("Este correo ya está registrado.");
    }
}
