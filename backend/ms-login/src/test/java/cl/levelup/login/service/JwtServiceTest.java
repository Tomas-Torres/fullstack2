package cl.levelup.login.service;

import cl.levelup.comun.JwtProperties;
import cl.levelup.login.model.Rol;
import cl.levelup.login.model.Usuario;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-with-at-least-thirty-two-bytes-2026";

    private JwtDecoder jwtDecoder;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtDecoder = NimbusJwtDecoder.withSecretKey(clave()).build();
        jwtService = new JwtService(encoder(), propiedades(120));
    }

    @Test
    void generaUnTokenConLosClaimsDelUsuario() {
        Usuario usuario = usuario();

        Jwt jwt = jwtDecoder.decode(jwtService.generar(usuario));

        assertThat(jwt.getSubject()).isEqualTo("cliente@levelup.cl");
        assertThat(jwt.getClaimAsString("correo")).isEqualTo("cliente@levelup.cl");
        assertThat(jwt.getClaimAsString("rol")).isEqualTo("CLIENTE");
        assertThat(((Number) jwt.getClaim("id")).longValue()).isEqualTo(42L);
        assertThat(jwt.getClaimAsString("iss")).isEqualTo("ms-login");
        assertThat(jwt.getExpiresAt()).isAfter(Instant.now().plusSeconds(60 * 60));
    }

    @Test
    void unTokenFirmadoConOtroSecretoNoSePuedeDecodificar() {
        String otroSecreto = "otro-secreto-de-pruebas-con-mas-de-32-bytes-2026";
        SecretKey otraClave = new SecretKeySpec(otroSecreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtService otroServicio = new JwtService(new NimbusJwtEncoder(new ImmutableSecret<>(otraClave)),
                propiedades(120));

        String token = otroServicio.generar(usuario());

        assertThatThrownBy(() -> jwtDecoder.decode(token))
                .isInstanceOf(JwtException.class);
    }

    private Usuario usuario() {
        Usuario usuario = new Usuario();
        usuario.setId(42L);
        usuario.setNombre("Ana Torres");
        usuario.setCorreo("cliente@levelup.cl");
        usuario.setPassword("hash");
        usuario.setRegion("metropolitana");
        usuario.setComuna("Santiago");
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);
        return usuario;
    }

    private JwtProperties propiedades(long minutos) {
        JwtProperties properties = new JwtProperties();
        properties.setSecret(SECRET);
        properties.setExpirationMinutes(minutos);
        return properties;
    }

    private SecretKey clave() {
        return new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    private JwtEncoder encoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(clave()));
    }
}
