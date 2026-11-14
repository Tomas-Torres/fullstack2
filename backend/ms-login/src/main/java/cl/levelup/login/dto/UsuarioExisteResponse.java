package cl.levelup.login.dto;

/**
 * Respuesta de la verificacion publica de existencia. Solo se devuelve
 * cuando el usuario existe y esta activo.
 */
public record UsuarioExisteResponse(
        Boolean existe,
        Long id,
        String nombre,
        String correo) {
}
