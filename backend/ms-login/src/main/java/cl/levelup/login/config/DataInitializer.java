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
 * Crea las cuentas iniciales solo si no existen.
 *
 * Se siembran dos cuentas para que la demo en vivo funcione igual en local y en
 * EC2 sin depender de importar un respaldo: el administrador y un cliente de
 * prueba. Cada correo se verifica de forma independiente para que, si el admin
 * ya existe, igual se cree el cliente.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String CORREO_ADMIN = "admin@levelup.cl";
    private static final String PASSWORD_ADMIN = "Admin123!";
    private static final String CORREO_CLIENTE = "cliente.pagos@levelup.cl";
    private static final String PASSWORD_CLIENTE = "Cliente123!";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        crearSiNoExiste(CORREO_ADMIN, "Administrador", PASSWORD_ADMIN,
                Rol.ADMIN, "metropolitana", "Santiago");
        crearSiNoExiste(CORREO_CLIENTE, "Cliente Pagos", PASSWORD_CLIENTE,
                Rol.CLIENTE, "metropolitana", "Santiago");
    }

    private void crearSiNoExiste(String correo, String nombre, String password,
                                 Rol rol, String region, String comuna) {
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setCorreo(correo);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRegion(region);
        usuario.setComuna(comuna);
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        log.info("Usuario {} inicial creado: {}", rol, correo);
    }
}
