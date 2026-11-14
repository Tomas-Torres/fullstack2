package cl.levelup.login.service;

import cl.levelup.comun.UsuarioAutenticado;
import cl.levelup.login.dto.RegistroRequest;
import cl.levelup.login.dto.UsuarioCreateRequest;
import cl.levelup.login.dto.UsuarioResponse;
import cl.levelup.login.dto.UsuarioUpdateRequest;
import cl.levelup.login.exception.AccesoDenegadoException;
import cl.levelup.login.exception.CorreoDuplicadoException;
import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    private static final UsuarioAutenticado ADMIN =
            new UsuarioAutenticado(1L, "admin@levelup.cl", "ADMIN");
    private static final UsuarioAutenticado CLIENTE =
            new UsuarioAutenticado(2L, "cliente@levelup.cl", "CLIENTE");

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario(Long id, Rol rol, boolean activo) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNombre("Ana Torres");
        usuario.setCorreo(id == 1L ? "admin@levelup.cl" : "cliente@levelup.cl");
        usuario.setPassword("hash-bcrypt");
        usuario.setTelefono("+56912345678");
        usuario.setRegion("metropolitana");
        usuario.setComuna("Santiago");
        usuario.setRol(rol);
        usuario.setFechaRegistro(LocalDateTime.of(2026, 1, 1, 12, 0));
        usuario.setActivo(activo);
        return usuario;
    }

    private void guardarDevuelveElMismoUsuario() {
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void listarSinFiltroDevuelveTodosLosUsuarios() {
        when(usuarioRepository.findAll(any(Sort.class)))
                .thenReturn(List.of(usuario(1L, Rol.ADMIN, true), usuario(2L, Rol.CLIENTE, true)));

        List<UsuarioResponse> usuarios = usuarioService.listar(null);

        assertThat(usuarios).hasSize(2);
        assertThat(usuarios.getFirst().rol()).isEqualTo("ADMIN");
    }

    @Test
    void listarConFiltroDeRolIgnoraMayusculas() {
        when(usuarioRepository.findByRolOrderByIdAsc(Rol.ADMIN))
                .thenReturn(List.of(usuario(1L, Rol.ADMIN, true)));

        List<UsuarioResponse> usuarios = usuarioService.listar("admin");

        assertThat(usuarios).hasSize(1);
        assertThat(usuarios.getFirst().correo()).isEqualTo("admin@levelup.cl");
    }

    @Test
    void listarConRolInvalidoDevuelve400() {
        assertThatThrownBy(() -> usuarioService.listar("SUPERADMIN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El rol debe ser CLIENTE o ADMIN");
    }

    @Test
    void obtenerElPropioPerfilEstaPermitido() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        UsuarioResponse respuesta = usuarioService.obtener(2L, CLIENTE);

        assertThat(respuesta.correo()).isEqualTo("cliente@levelup.cl");
        assertThat(respuesta.telefono()).isEqualTo("+56912345678");
    }

    @Test
    void unAdminPuedeObtenerCualquierPerfil() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        assertThat(usuarioService.obtener(2L, ADMIN).id()).isEqualTo(2L);
    }

    @Test
    void unClienteNoPuedeObtenerElPerfilDeOtro() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));

        assertThatThrownBy(() -> usuarioService.obtener(1L, CLIENTE))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void sinPrincipalNoSePuedeObtenerUnPerfil() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        assertThatThrownBy(() -> usuarioService.obtener(2L, null))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void obtenerUnUsuarioInexistenteDevuelve404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtener(99L, ADMIN))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Usuario no encontrado con id: 99");
    }

    @Test
    void elRegistroPublicoCreaUnClienteConLosDatosNormalizados() {
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo@levelup.cl")).thenReturn(false);
        when(passwordEncoder.encode("Clave123!")).thenReturn("nuevo-hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocacion -> {
            Usuario guardado = invocacion.getArgument(0);
            guardado.setId(10L);
            guardado.setFechaRegistro(LocalDateTime.of(2026, 2, 1, 9, 0));
            return guardado;
        });

        UsuarioResponse respuesta = usuarioService.registrar(new RegistroRequest(
                "  Ana Torres  ", "  NUEVO@LevelUp.CL ", "Clave123!",
                " +56912345678 ", " metropolitana ", " Santiago "));

        assertThat(respuesta.id()).isEqualTo(10L);
        assertThat(respuesta.nombre()).isEqualTo("Ana Torres");
        assertThat(respuesta.correo()).isEqualTo("nuevo@levelup.cl");
        assertThat(respuesta.telefono()).isEqualTo("+56912345678");
        assertThat(respuesta.region()).isEqualTo("metropolitana");
        assertThat(respuesta.comuna()).isEqualTo("Santiago");
        assertThat(respuesta.rol()).isEqualTo("CLIENTE");
        assertThat(respuesta.activo()).isTrue();
    }

    @Test
    void elRegistroConTelefonoVacioLoGuardaComoNulo() {
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo@levelup.cl")).thenReturn(false);
        when(passwordEncoder.encode("Clave123!")).thenReturn("nuevo-hash");
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.registrar(new RegistroRequest(
                "Ana Torres", "nuevo@levelup.cl", "Clave123!", "   ",
                "metropolitana", "Santiago"));

        assertThat(respuesta.telefono()).isNull();
    }

    @Test
    void noSePuedeRegistrarUnCorreoYaExistente() {
        when(usuarioRepository.existsByCorreoIgnoreCase("admin@levelup.cl")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.registrar(new RegistroRequest(
                "Otra Persona", "ADMIN@levelup.cl", "Clave123!", null,
                "metropolitana", "Santiago")))
                .isInstanceOf(CorreoDuplicadoException.class)
                .hasMessage("Este correo ya está registrado.");

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void unAdminPuedeCrearUsuariosConRolYEstadoInicial() {
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo-admin@levelup.cl")).thenReturn(false);
        when(passwordEncoder.encode("Clave123!")).thenReturn("nuevo-hash");
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.crear(new UsuarioCreateRequest(
                "Nuevo Admin", "nuevo-admin@levelup.cl", "Clave123!", null,
                "valparaiso", "Viña del Mar", "ADMIN", false));

        assertThat(respuesta.rol()).isEqualTo("ADMIN");
        assertThat(respuesta.activo()).isFalse();
    }

    @Test
    void crearSinRolNiEstadoUsaLosValoresPorDefecto() {
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo@levelup.cl")).thenReturn(false);
        when(passwordEncoder.encode("Clave123!")).thenReturn("nuevo-hash");
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.crear(new UsuarioCreateRequest(
                "Nuevo Cliente", "nuevo@levelup.cl", "Clave123!", null,
                "metropolitana", "Santiago", null, null));

        assertThat(respuesta.rol()).isEqualTo("CLIENTE");
        assertThat(respuesta.activo()).isTrue();
    }

    @Test
    void elPropioUsuarioPuedeActualizarSusDatosPersonales() {
        Usuario existente = usuario(2L, Rol.CLIENTE, true);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(existente));
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                "Ana María Torres", "cliente@levelup.cl", null, null,
                "valparaiso", "Viña del Mar", null, null), CLIENTE);

        assertThat(respuesta.nombre()).isEqualTo("Ana María Torres");
        assertThat(respuesta.region()).isEqualTo("valparaiso");
        assertThat(respuesta.comuna()).isEqualTo("Viña del Mar");
        assertThat(respuesta.correo()).isEqualTo("cliente@levelup.cl");
        assertThat(respuesta.rol()).isEqualTo("CLIENTE");
    }

    @Test
    void elPropioUsuarioPuedeCambiarSuCorreoYPassword() {
        Usuario existente = usuario(2L, Rol.CLIENTE, true);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo@levelup.cl")).thenReturn(false);
        when(passwordEncoder.encode("Nueva123!")).thenReturn("nuevo-hash");
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, " Nuevo@LevelUp.CL ", "Nueva123!", "  ",
                null, null, null, null), CLIENTE);

        assertThat(respuesta.correo()).isEqualTo("nuevo@levelup.cl");
        assertThat(respuesta.telefono()).isNull();
        assertThat(existente.getPassword()).isEqualTo("nuevo-hash");
    }

    @Test
    void unClienteNoPuedeCambiarSuRol() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        assertThatThrownBy(() -> usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, null, null, null, null, null, "ADMIN", null), CLIENTE))
                .isInstanceOf(AccesoDenegadoException.class);

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void unClienteNoPuedeCambiarSuEstado() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        assertThatThrownBy(() -> usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, null, null, null, null, null, null, false), CLIENTE))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void unAdminPuedeCambiarRolYEstado() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));
        guardarDevuelveElMismoUsuario();

        UsuarioResponse respuesta = usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, null, null, null, null, null, "admin", false), ADMIN);

        assertThat(respuesta.rol()).isEqualTo("ADMIN");
        assertThat(respuesta.activo()).isFalse();
    }

    @Test
    void actualizarConCorreoDuplicadoDevuelve409() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));
        when(usuarioRepository.existsByCorreoIgnoreCase("admin@levelup.cl")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, "admin@levelup.cl", null, null, null, null, null, null), CLIENTE))
                .isInstanceOf(CorreoDuplicadoException.class);
    }

    @Test
    void actualizarConPasswordInvalidaDevuelve400() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        assertThatThrownBy(() -> usuarioService.actualizar(2L, new UsuarioUpdateRequest(
                null, null, "corta", null, null, null, null, null), CLIENTE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("al menos 8 caracteres");
    }

    @Test
    void eliminarAplicaBajaLogicaSinBorrarElRegistro() {
        Usuario existente = usuario(2L, Rol.CLIENTE, true);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(existente));
        guardarDevuelveElMismoUsuario();

        usuarioService.eliminar(2L);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getActivo()).isFalse();
    }

    @Test
    void eliminarUnUsuarioInexistenteDevuelve404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.eliminar(99L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void existeDevuelveLosDatosCuandoLaCuentaEstaActiva() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));

        var respuesta = usuarioService.existe(2L);

        assertThat(respuesta.existe()).isTrue();
        assertThat(respuesta.id()).isEqualTo(2L);
        assertThat(respuesta.correo()).isEqualTo("cliente@levelup.cl");
    }

    @Test
    void existeDevuelve404CuandoLaCuentaEstaInactiva() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, false)));

        assertThatThrownBy(() -> usuarioService.existe(2L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("No existe un usuario activo con id: 2");
    }

    @Test
    void existeDevuelve404CuandoLaCuentaNoExiste() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.existe(99L))
                .isInstanceOf(NoSuchElementException.class);
    }
}
