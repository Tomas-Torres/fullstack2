package cl.levelup.carrito.config;

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
                        .title("Level-Up Gamer - ms-carrito")
                        .version("1.0.0")
                        .description("Carrito de compras por usuario y cupones LEVELUP10 / GAMER20. "
                                + "Requiere un JWT; un CLIENTE solo accede a su propio carrito."))
                .components(new Components()
                        .addSecuritySchemes(esquema, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(esquema));
    }
}
