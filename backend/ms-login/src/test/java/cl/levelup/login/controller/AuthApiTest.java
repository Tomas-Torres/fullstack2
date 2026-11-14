package cl.levelup.login.controller;

import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas del registro publico y del login contra el contexto completo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String registroJson(String nombre, String correo, String password) {
        return """
                {"nombre":"%s","correo":"%s","password":"%s","telefono":"+56912345678",
                 "region":"metropolitana","comuna":"Santiago"}
                """.formatted(nombre, correo, password);
    }

    private void crearUsuarioInactivo() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Cuenta Inactiva");
        usuario.setCorreo("inactivo@levelup.cl");
        usuario.setPassword(passwordEncoder.encode("Clave123!"));
        usuario.setRegion("metropolitana");
        usuario.setComuna("Santiago");
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Test
    void elRegistroPublicoCreaUnClienteYNoExponeLaPassword() throws Exception {
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Ana Torres", "ana@levelup.cl", "Clave123!")))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Ana Torres"))
                .andExpect(jsonPath("$.correo").value("ana@levelup.cl"))
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(jsonPath("$.activo").value(true))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void elRegistroNormalizaElCorreoAMinusculas() throws Exception {
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Ana Torres", "ANA@LevelUp.CL", "Clave123!")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correo").value("ana@levelup.cl"));
    }

    @Test
    void unCorreoDuplicadoDevuelve409() throws Exception {
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Otra Persona", "ADMIN@LEVELUP.CL", "Clave123!")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Este correo ya está registrado."));
    }

    @Test
    void elRegistroConDatosInvalidosDevuelve400ConDetalles() throws Exception {
        String cuerpo = """
                {"nombre":"Ana123","correo":"no-es-correo","password":"corta",
                 "telefono":"123","region":"","comuna":""}
                """;

        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.nombre").exists())
                .andExpect(jsonPath("$.detalles.correo").exists())
                .andExpect(jsonPath("$.detalles.password").exists())
                .andExpect(jsonPath("$.detalles.telefono").exists())
                .andExpect(jsonPath("$.detalles.region").exists())
                .andExpect(jsonPath("$.detalles.comuna").exists());
    }

    @Test
    void elAdminInicialPuedeIniciarSesionYRecibeSuToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"admin@levelup.cl","password":"Admin123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Administrador"))
                .andExpect(jsonPath("$.correo").value("admin@levelup.cl"))
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void elLoginAceptaElCorreoEnMayusculas() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"ADMIN@LEVELUP.CL","password":"Admin123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ADMIN"));
    }

    @Test
    void unCorreoInexistenteDevuelve404ConLaFormaCampoMensaje() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"nadie@levelup.cl","password":"Clave123!"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.campo").value("correo"))
                .andExpect(jsonPath("$.mensaje").value("No existe una cuenta con este correo."));
    }

    @Test
    void unaPasswordIncorrectaDevuelve401ConLaFormaCampoMensaje() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"admin@levelup.cl","password":"Mala123!"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.campo").value("password"))
                .andExpect(jsonPath("$.mensaje").value("Contraseña incorrecta."));
    }

    @Test
    void unaCuentaDesactivadaDevuelve403() throws Exception {
        crearUsuarioInactivo();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"inactivo@levelup.cl","password":"Clave123!"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.campo").value("correo"))
                .andExpect(jsonPath("$.mensaje").value("Tu cuenta está desactivada."));
    }

    @Test
    void elLoginSinCamposDevuelve400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.correo").exists())
                .andExpect(jsonPath("$.detalles.password").exists());
    }

    @Test
    void laDocumentacionOpenApiEstaDisponibleSinToken() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Level-Up Gamer - ms-login"));
    }
}
