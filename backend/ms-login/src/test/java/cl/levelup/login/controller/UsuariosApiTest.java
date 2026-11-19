package cl.levelup.login.controller;

import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import cl.levelup.login.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la administracion de usuarios, el acceso al perfil propio y
 * las reglas de autorizacion por rol.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UsuariosApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Usuario crearUsuario(String correo, Rol rol, boolean activo) {
        Usuario usuario = new Usuario();
        usuario.setNombre("Usuario " + rol.name());
        usuario.setCorreo(correo);
        usuario.setPassword(passwordEncoder.encode("Clave123!"));
        usuario.setRegion("metropolitana");
        usuario.setComuna("Santiago");
        usuario.setRol(rol);
        usuario.setActivo(activo);
        return usuarioRepository.saveAndFlush(usuario);
    }

    private Usuario admin() {
        return usuarioRepository.findByCorreoIgnoreCase("admin@levelup.cl").orElseThrow();
    }

    private String token(Usuario usuario) {
        return "Bearer " + jwtService.generar(usuario);
    }

    @Test
    void listarUsuariosSinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void listarUsuariosComoClienteDevuelve403() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(get("/api/usuarios").header("Authorization", token(cliente)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void unAdminPuedeListarYFiltrarUsuarios() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(get("/api/usuarios").header("Authorization", token(admin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].rol", hasItem("ADMIN")));

        // Ahora ademas del cliente creado aqui se siembra cliente.pagos@levelup.cl
        mockMvc.perform(get("/api/usuarios").param("rol", "CLIENTE")
                        .header("Authorization", token(admin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].correo", hasItem(cliente.getCorreo())))
                .andExpect(jsonPath("$[*].correo", hasItem("cliente.pagos@levelup.cl")));
    }

    @Test
    void unUsuarioPuedeObtenerSuPropioPerfil() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(get("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("cliente@levelup.cl"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void unClienteNoPuedeObtenerElPerfilDeOtro() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);
        Usuario otro = crearUsuario("otro@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(get("/api/usuarios/" + otro.getId())
                        .header("Authorization", token(cliente)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unAdminPuedeObtenerCualquierPerfil() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(get("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(admin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("cliente@levelup.cl"));
    }

    @Test
    void obtenerUnUsuarioInexistenteDevuelve404() throws Exception {
        mockMvc.perform(get("/api/usuarios/9999").header("Authorization", token(admin())))
                .andExpect(status().isNotFound());
    }

    @Test
    void laVerificacionDeExistenciaEsPublicaYDevuelve200O404() throws Exception {
        Usuario activo = crearUsuario("activo@levelup.cl", Rol.CLIENTE, true);
        Usuario inactivo = crearUsuario("inactivo@levelup.cl", Rol.CLIENTE, false);

        mockMvc.perform(get("/api/usuarios/" + activo.getId() + "/existe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.existe").value(true))
                .andExpect(jsonPath("$.correo").value("activo@levelup.cl"));

        mockMvc.perform(get("/api/usuarios/" + inactivo.getId() + "/existe"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/usuarios/9999/existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    void unAdminPuedeCrearUsuarios() throws Exception {
        String cuerpo = """
                {"nombre":"Nuevo Admin","correo":"nuevo-admin@levelup.cl","password":"Clave123!",
                 "telefono":"+56987654321","region":"valparaiso","comuna":"Viña del Mar",
                 "rol":"ADMIN","activo":true}
                """;

        mockMvc.perform(post("/api/usuarios")
                        .header("Authorization", token(admin()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.correo").value("nuevo-admin@levelup.cl"))
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.password").doesNotExist());

        Usuario creado = usuarioRepository.findByCorreoIgnoreCase("nuevo-admin@levelup.cl").orElseThrow();
        assertThat(passwordEncoder.matches("Clave123!", creado.getPassword())).isTrue();
    }

    @Test
    void unClienteNoPuedeCrearUsuarios() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(post("/api/usuarios")
                        .header("Authorization", token(cliente))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Otro","correo":"otro@levelup.cl","password":"Clave123!",
                                 "region":"metropolitana","comuna":"Santiago"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void crearUsuarioConDatosInvalidosDevuelve400() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .header("Authorization", token(admin()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"123","correo":"malo","password":"corta",
                                 "region":"","comuna":"","rol":"SUPER"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.nombre").exists())
                .andExpect(jsonPath("$.detalles.correo").exists())
                .andExpect(jsonPath("$.detalles.password").exists())
                .andExpect(jsonPath("$.detalles.rol").exists());
    }

    @Test
    void unUsuarioPuedeActualizarSusDatosPersonales() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(put("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Ana Actualizada","region":"valparaiso","comuna":"Viña del Mar"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Ana Actualizada"))
                .andExpect(jsonPath("$.region").value("valparaiso"))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    @Test
    void unClienteNoPuedeCambiarSuRol() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(put("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rol":"ADMIN"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void unAdminPuedeCambiarRolYEstado() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(put("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(admin()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rol":"ADMIN","activo":false}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.activo").value(false));
    }

    @Test
    void actualizarConUnCorreoDuplicadoDevuelve409() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(put("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"admin@levelup.cl"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Este correo ya está registrado."));
    }

    @Test
    void actualizarConUnaPasswordInvalidaDevuelve400() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(put("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"corta"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unAdminPuedeDarDeBajaUnaCuentaConBajaLogica() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(delete("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(admin())))
                .andExpect(status().isNoContent());

        assertThat(usuarioRepository.findById(cliente.getId()).orElseThrow().getActivo()).isFalse();
    }

    @Test
    void unClienteNoPuedeDarDeBajaCuentas() throws Exception {
        Usuario cliente = crearUsuario("cliente@levelup.cl", Rol.CLIENTE, true);

        mockMvc.perform(delete("/api/usuarios/" + cliente.getId())
                        .header("Authorization", token(cliente)))
                .andExpect(status().isForbidden());
    }

    @Test
    void darDeBajaUnUsuarioInexistenteDevuelve404() throws Exception {
        mockMvc.perform(delete("/api/usuarios/9999").header("Authorization", token(admin())))
                .andExpect(status().isNotFound());
    }
}
