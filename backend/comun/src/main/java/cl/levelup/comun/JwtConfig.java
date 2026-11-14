package cl.levelup.comun;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Valida la firma HMAC-SHA256 de los JWT emitidos por ms-login.
 */
@Configuration
public class JwtConfig {

    @Bean
    public JwtDecoder jwtDecoder(JwtProperties properties) {
        SecretKey key = new SecretKeySpec(
                properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }
}
