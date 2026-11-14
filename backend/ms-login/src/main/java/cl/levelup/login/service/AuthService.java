package cl.levelup.login.service;

import cl.levelup.login.dto.LoginRequest;
import cl.levelup.login.dto.LoginResponse;
import cl.levelup.login.exception.LoginException;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Valida credenciales y emite el token de acceso.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String correo = request.correo().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(LoginException::correoNoExiste);

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw LoginException.cuentaDesactivada();
        }
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw LoginException.passwordIncorrecta();
        }

        return new LoginResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().name(),
                jwtService.generar(usuario));
    }
}
