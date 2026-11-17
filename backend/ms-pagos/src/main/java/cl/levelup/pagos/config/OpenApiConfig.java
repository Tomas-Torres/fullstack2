package cl.levelup.pagos.config;

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
                        .title("Level-Up Gamer - ms-pagos")
                        .version("1.0.0")
                        .description("Cobros simulados de la tienda. Requiere un JWT; "
                                + "el historial completo es solo para ADMIN."))
                .components(new Components()
                        .addSecuritySchemes(esquema, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(esquema));
    }
}
