package cl.levelup.login.config;

import cl.levelup.comun.JwtProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Firma los JWT con el mismo secreto HMAC-SHA256 que usa el modulo comun
 * para validarlos.
 */
@Configuration
public class JwtEncoderConfig {

    @Bean
    public JwtEncoder jwtEncoder(JwtProperties properties) {
        SecretKey key = new SecretKeySpec(
                properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }
}
