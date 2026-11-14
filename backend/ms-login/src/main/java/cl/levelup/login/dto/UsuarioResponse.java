package cl.levelup.login.dto;

import cl.levelup.login.model.Usuario;

import java.time.LocalDateTime;

/**
 * Datos publicos de un usuario. La contrasena nunca forma parte de la respuesta.
 */
public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        String telefono,
        String region,
        String comuna,
        String rol,
        LocalDateTime fechaRegistro,
        Boolean activo) {

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getRegion(),
                usuario.getComuna(),
                usuario.getRol() == null ? null : usuario.getRol().name(),
                usuario.getFechaRegistro(),
                usuario.getActivo());
    }
}
