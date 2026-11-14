package cl.levelup.login.dto;

/**
 * Respuesta del login. El frontend guarda el token y lo envia como
 * Authorization: Bearer en las siguientes peticiones.
 */
public record LoginResponse(
        Long id,
        String nombre,
        String correo,
        String rol,
        String token) {
}
