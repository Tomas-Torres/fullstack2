package cl.levelup.login.service;

import cl.levelup.comun.UsuarioAutenticado;
import cl.levelup.login.dto.RegistroRequest;
import cl.levelup.login.dto.UsuarioCreateRequest;
import cl.levelup.login.dto.UsuarioExisteResponse;
import cl.levelup.login.dto.UsuarioResponse;
import cl.levelup.login.dto.UsuarioUpdateRequest;
import cl.levelup.login.dto.Validacion;
import cl.levelup.login.exception.AccesoDenegadoException;
import cl.levelup.login.exception.CorreoDuplicadoException;
import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

/**
 * Reglas de administracion de usuarios: registro publico, CRUD de ADMIN,
 * acceso al propio perfil y baja logica.
 */
@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar(String rol) {
        List<Usuario> usuarios;
        if (rol == null || rol.isBlank()) {
            usuarios = usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        } else {
            usuarios = usuarioRepository.findByRolOrderByIdAsc(parseRol(rol));
        }
        return usuarios.stream().map(UsuarioResponse::from).toList();
    }

    public UsuarioResponse obtener(Long id, UsuarioAutenticado solicitante) {
        Usuario usuario = buscar(id);
        verificarAcceso(usuario, solicitante);
        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest request) {
        return crear(request.nombre(), request.correo(), request.password(), request.telefono(),
                request.region(), request.comuna(), Rol.CLIENTE, true);
    }

    @Transactional
    public UsuarioResponse crear(UsuarioCreateRequest request) {
        Rol rol = request.rol() == null || request.rol().isBlank()
                ? Rol.CLIENTE
                : parseRol(request.rol());
        boolean activo = request.activo() == null || request.activo();
        return crear(request.nombre(), request.correo(), request.password(), request.telefono(),
                request.region(), request.comuna(), rol, activo);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest request, UsuarioAutenticado solicitante) {
        Usuario usuario = buscar(id);
        verificarAcceso(usuario, solicitante);

        boolean admin = solicitante != null && solicitante.esAdmin();
        if (!admin && (request.rol() != null || request.activo() != null)) {
            throw new AccesoDenegadoException();
        }

        if (request.nombre() != null && !request.nombre().isBlank()) {
            usuario.setNombre(request.nombre().trim());
        }
        if (request.correo() != null && !request.correo().isBlank()) {
            String correo = normalizarCorreo(request.correo());
            if (!correo.equalsIgnoreCase(usuario.getCorreo())
                    && usuarioRepository.existsByCorreoIgnoreCase(correo)) {
                throw new CorreoDuplicadoException();
            }
            usuario.setCorreo(correo);
        }
        if (request.password() != null && !request.password().isBlank()) {
            Validacion.validarPassword(request.password());
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.telefono() != null) {
            usuario.setTelefono(normalizarTelefono(request.telefono()));
        }
        if (request.region() != null && !request.region().isBlank()) {
            usuario.setRegion(request.region().trim());
        }
        if (request.comuna() != null && !request.comuna().isBlank()) {
            usuario.setComuna(request.comuna().trim());
        }
        if (admin && request.rol() != null && !request.rol().isBlank()) {
            usuario.setRol(parseRol(request.rol()));
        }
        if (admin && request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /**
     * Baja logica: la cuenta deja de poder iniciar sesion pero se conserva
     * su historial de compras.
     */
    @Transactional
    public void eliminar(Long id) {
        Usuario usuario = buscar(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    public UsuarioExisteResponse existe(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .filter(encontrado -> Boolean.TRUE.equals(encontrado.getActivo()))
                .orElseThrow(() -> new NoSuchElementException("No existe un usuario activo con id: " + id));
        return new UsuarioExisteResponse(true, usuario.getId(), usuario.getNombre(), usuario.getCorreo());
    }

    private UsuarioResponse crear(String nombre, String correo, String password, String telefono,
                                  String region, String comuna, Rol rol, boolean activo) {
        String correoNormalizado = normalizarCorreo(correo);
        if (usuarioRepository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new CorreoDuplicadoException();
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre.trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setTelefono(normalizarTelefono(telefono));
        usuario.setRegion(region.trim());
        usuario.setComuna(comuna.trim());
        usuario.setRol(rol);
        usuario.setActivo(activo);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con id: " + id));
    }

    private void verificarAcceso(Usuario usuario, UsuarioAutenticado solicitante) {
        if (solicitante == null
                || (!solicitante.esAdmin() && !solicitante.esMismo(usuario.getId()))) {
            throw new AccesoDenegadoException();
        }
    }

    private Rol parseRol(String rol) {
        try {
            return Rol.valueOf(rol.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(Validacion.ROL_MENSAJE);
        }
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return null;
        }
        return telefono.trim();
    }
}
