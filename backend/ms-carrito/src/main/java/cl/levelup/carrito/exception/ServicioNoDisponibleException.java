package cl.levelup.carrito.exception;

/**
 * Otro microservicio no respondio a tiempo o devolvio un error inesperado.
 */
public class ServicioNoDisponibleException extends RuntimeException {

    private final String servicio;

    public ServicioNoDisponibleException(String servicio, Throwable causa) {
        super("No se pudo contactar a " + servicio + ". Intenta nuevamente en unos segundos.", causa);
        this.servicio = servicio;
    }

    public String getServicio() {
        return servicio;
    }
}
