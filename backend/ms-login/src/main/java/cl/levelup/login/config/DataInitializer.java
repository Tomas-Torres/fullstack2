package cl.levelup.login.config;

import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import cl.levelup.login.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea el administrador inicial solo si no existe. No se cargan clientes
 * de prueba: las cuentas de cliente se crean por la API de registro.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String CORREO_ADMIN = "admin@levelup.cl";
    private static final String PASSWORD_ADMIN = "Admin123!";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.existsByCorreoIgnoreCase(CORREO_ADMIN)) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setCorreo(CORREO_ADMIN);
        admin.setPassword(passwordEncoder.encode(PASSWORD_ADMIN));
        admin.setRegion("metropolitana");
        admin.setComuna("Santiago");
        admin.setRol(Rol.ADMIN);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        log.info("Usuario ADMIN inicial creado: {}", CORREO_ADMIN);
    }
}
