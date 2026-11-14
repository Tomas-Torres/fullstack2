package cl.levelup.login.service;

import cl.levelup.comun.JwtProperties;
import cl.levelup.login.model.Usuario;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Emite los JWT HS256 que consumen todos los microservicios.
 * Incluye id, correo y rol; el subject repite el correo para los filtros
 * genericos que solo leen el subject.
 */
@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    public JwtService(JwtEncoder jwtEncoder, JwtProperties properties) {
        this.jwtEncoder = jwtEncoder;
        this.properties = properties;
    }

    public String generar(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ms-login")
                .subject(usuario.getCorreo())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(properties.getExpirationMinutes(), ChronoUnit.MINUTES))
                .claim("id", usuario.getId())
                .claim("correo", usuario.getCorreo())
                .claim("rol", usuario.getRol().name())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
