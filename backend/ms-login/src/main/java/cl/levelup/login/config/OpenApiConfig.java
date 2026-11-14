package cl.levelup.login.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI levelUpOpenAPI() {
        final String esquema = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Level-Up Gamer - ms-login")
                        .version("1.0.0")
                        .description("Registro, inicio de sesion, emision de JWT y administracion de usuarios. "
                                + "El registro y el login son publicos; el resto requiere un JWT."))
                .components(new Components()
                        .addSecuritySchemes(esquema, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(esquema));
    }
}
