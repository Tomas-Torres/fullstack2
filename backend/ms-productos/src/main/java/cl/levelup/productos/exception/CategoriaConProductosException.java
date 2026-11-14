package cl.levelup.productos.exception;

/**
 * Una categoria con productos asociados no puede eliminarse.
 */
public class CategoriaConProductosException extends RuntimeException {

    public CategoriaConProductosException(Long categoriaId) {
        super("La categoria " + categoriaId + " tiene productos asociados y no puede eliminarse");
    }
}
