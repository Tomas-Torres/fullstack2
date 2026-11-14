package cl.levelup.comun;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Cuerpo uniforme de error para todos los microservicios.
 */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> detalles) {

    public static ApiError de(int status, String error, String message) {
        return new ApiError(LocalDateTime.now(), status, error, message, null);
    }

    public static ApiError de(int status, String error, String message, Map<String, String> detalles) {
        return new ApiError(LocalDateTime.now(), status, error, message, detalles);
    }
}
