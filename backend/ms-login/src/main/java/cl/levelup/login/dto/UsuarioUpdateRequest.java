package cl.levelup.login.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Actualizacion parcial. Los campos nulos conservan el valor actual.
 * El rol y el estado solo los puede modificar un ADMIN; esa regla se valida
 * en el servicio porque depende del usuario autenticado.
 */
public record UsuarioUpdateRequest(

        @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
        @Pattern(regexp = Validacion.NOMBRE_REGEX, message = Validacion.NOMBRE_MENSAJE)
        String nombre,

        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
        String correo,

        String password,

        @Pattern(regexp = Validacion.TELEFONO_REGEX, message = Validacion.TELEFONO_MENSAJE)
        String telefono,

        @Size(max = 50, message = "La región no puede superar los 50 caracteres")
        String region,

        @Size(max = 50, message = "La comuna no puede superar los 50 caracteres")
        String comuna,

        @Pattern(regexp = Validacion.ROL_REGEX, message = Validacion.ROL_MENSAJE)
        String rol,

        Boolean activo) {
}
