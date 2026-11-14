package cl.levelup.login.config;

import cl.levelup.comun.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Registro y login publicos; administracion solo para ADMIN. El perfil
 * propio queda disponible para cualquier usuario autenticado.
 */
@Configuration
public class SecurityConfig {

    private final JwtDecoder jwtDecoder;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtDecoder jwtDecoder, CorsConfigurationSource corsConfigurationSource) {
        this.jwtDecoder = jwtDecoder;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
                                "/actuator/health", "/actuator/info", "/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/registro", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/*/existe").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios", "/api/usuarios/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").authenticated()
                        .anyRequest().authenticated())
                .exceptionHandling(excepciones -> excepciones
                        .authenticationEntryPoint((request, response, ex) ->
                                escribirError(response, 401, "Unauthorized",
                                        "Debes iniciar sesion para acceder a este recurso"))
                        .accessDeniedHandler((request, response, ex) ->
                                escribirError(response, 403, "Forbidden",
                                        "No tienes permisos para realizar esta accion")))
                .addFilterBefore(new JwtAuthenticationFilter(jwtDecoder), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private void escribirError(HttpServletResponse response, int status, String error, String mensaje)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String cuerpo = "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":" + status
                + ",\"error\":\"" + error + "\",\"message\":\"" + mensaje + "\",\"detalles\":null}";
        response.getWriter().write(cuerpo);
    }
}
