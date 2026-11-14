package cl.levelup.comun;

/**
 * Principal que deja disponible el JWT ya validado.
 * Permite distinguir al dueno del recurso del resto de los usuarios.
 */
public record UsuarioAutenticado(Long id, String correo, String rol) {

    public boolean esAdmin() {
        return "ADMIN".equalsIgnoreCase(rol);
    }

    public boolean esMismo(Long otroId) {
        return id != null && id.equals(otroId);
    }
}
