package cl.levelup.carrito.exception;

/**
 * Un CLIENTE intento acceder al carrito de otro usuario.
 */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException() {
        super("No tienes permisos para acceder a este carrito");
    }
}
