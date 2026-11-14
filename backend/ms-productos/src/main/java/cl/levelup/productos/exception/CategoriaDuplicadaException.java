package cl.levelup.productos.exception;

/**
 * Ya existe una categoria con el mismo nombre.
 */
public class CategoriaDuplicadaException extends RuntimeException {

    public CategoriaDuplicadaException(String nombre) {
        super("Ya existe una categoria con el nombre: " + nombre);
    }
}
