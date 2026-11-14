package cl.levelup.login.service;

import cl.levelup.login.dto.LoginRequest;
import cl.levelup.login.dto.LoginResponse;
import cl.levelup.login.exception.LoginException;
import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario(boolean activo) {
        Usuario usuario = new Usuario();
        usuario.setId(7L);
        usuario.setNombre("Ana Torres");
        usuario.setCorreo("cliente@levelup.cl");
        usuario.setPassword("hash-bcrypt");
        usuario.setRegion("metropolitana");
        usuario.setComuna("Santiago");
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(activo);
        return usuario;
    }

    @Test
    void loginExitosoDevuelveElTokenYLosDatosDelUsuario() {
        Usuario usuario = usuario(true);
        when(usuarioRepository.findByCorreoIgnoreCase("cliente@levelup.cl"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Clave123!", "hash-bcrypt")).thenReturn(true);
        when(jwtService.generar(usuario)).thenReturn("token-jwt");

        LoginResponse respuesta = authService.login(
                new LoginRequest("  CLIENTE@LevelUp.CL ", "Clave123!"));

        assertThat(respuesta.id()).isEqualTo(7L);
        assertThat(respuesta.nombre()).isEqualTo("Ana Torres");
        assertThat(respuesta.correo()).isEqualTo("cliente@levelup.cl");
        assertThat(respuesta.rol()).isEqualTo("CLIENTE");
        assertThat(respuesta.token()).isEqualTo("token-jwt");
        verify(jwtService).generar(usuario);
    }

    @Test
    void correoInexistenteDevuelve404ConElCampoCorreo() {
        when(usuarioRepository.findByCorreoIgnoreCase("nadie@levelup.cl"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nadie@levelup.cl", "Clave123!")))
                .isInstanceOfSatisfying(LoginException.class, ex -> {
                    assertThat(ex.getEstado()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(ex.getCampo()).isEqualTo("correo");
                    assertThat(ex.getMessage()).isEqualTo("No existe una cuenta con este correo.");
                });
    }

    @Test
    void passwordIncorrectaDevuelve401ConElCampoPassword() {
        Usuario usuario = usuario(true);
        when(usuarioRepository.findByCorreoIgnoreCase("cliente@levelup.cl"))
                .thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Mala123!", "hash-bcrypt")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("cliente@levelup.cl", "Mala123!")))
                .isInstanceOfSatisfying(LoginException.class, ex -> {
                    assertThat(ex.getEstado()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(ex.getCampo()).isEqualTo("password");
                    assertThat(ex.getMessage()).isEqualTo("Contraseña incorrecta.");
                });
    }

    @Test
    void cuentaDesactivadaDevuelve403() {
        Usuario usuario = usuario(false);
        when(usuarioRepository.findByCorreoIgnoreCase("cliente@levelup.cl"))
                .thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> authService.login(new LoginRequest("cliente@levelup.cl", "Clave123!")))
                .isInstanceOfSatisfying(LoginException.class, ex -> {
                    assertThat(ex.getEstado()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(ex.getCampo()).isEqualTo("correo");
                    assertThat(ex.getMessage()).isEqualTo("Tu cuenta está desactivada.");
                });
    }
}
