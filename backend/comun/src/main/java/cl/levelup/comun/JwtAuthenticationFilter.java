package cl.levelup.comun;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el header Authorization: Bearer ... y deja el usuario autenticado
 * con su rol como autoridad (ROLE_ADMIN / ROLE_CLIENTE).
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtDecoder jwtDecoder;

    public JwtAuthenticationFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                Jwt jwt = jwtDecoder.decode(header.substring(7));
                String rol = jwt.getClaimAsString("rol");
                String correo = jwt.getClaimAsString("correo");
                if (correo == null || correo.isBlank()) {
                    correo = jwt.getSubject();
                }
                Long id = jwt.getClaim("id") instanceof Number numero ? numero.longValue() : null;

                List<SimpleGrantedAuthority> authorities = rol == null
                        ? List.of()
                        : List.of(new SimpleGrantedAuthority("ROLE_" + rol));

                UsuarioAutenticado principal = new UsuarioAutenticado(id, correo, rol);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
