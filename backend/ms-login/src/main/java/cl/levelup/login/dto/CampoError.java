package cl.levelup.login.dto;

/**
 * Error de un campo puntual, usado por el login y por el registro.
 */
public record CampoError(String campo, String mensaje) {
}
