package cl.levelup.carrito.controller;

import cl.levelup.carrito.client.ProductoClient;
import cl.levelup.carrito.client.ProductoInfo;
import cl.levelup.carrito.exception.ProductoNoEncontradoException;
import cl.levelup.carrito.exception.ServicioNoDisponibleException;
import cl.levelup.carrito.repository.CarritoRepository;
import cl.levelup.comun.JwtProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CarritoApiTest {

    private static final String URL = "/api/carritos";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private JwtEncoder jwtEncoder;

    @MockitoBean
    private ProductoClient productoClient;

    @TestConfiguration
    static class SeguridadMockMvc {

        @Bean
        MockMvcBuilderCustomizer seguridadCustomizer() {
            return builder -> builder.apply(SecurityMockMvcConfigurers.springSecurity());
        }

        @Bean
        JwtEncoder jwtEncoder(JwtProperties properties) {
            SecretKey key = new SecretKeySpec(
                    properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            return new NimbusJwtEncoder(new ImmutableSecret<>(key));
        }
    }

    /**
     * Emite un JWT igual a los de ms-login, para que el filtro real lo valide.
     */
    private String token(long id, String rol) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("usuario" + id + "@levelup.cl")
                .issuedAt(ahora)
                .expiresAt(ahora.plus(1, ChronoUnit.HOURS))
                .claim("id", id)
                .claim("correo", "usuario" + id + "@levelup.cl")
                .claim("rol", rol)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return "Bearer " + jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    private ProductoInfo producto(long id, int stock, int precio) {
        return new ProductoInfo(id, "Juego " + id, "/img/" + id + ".png", precio, stock, stock <= 0);
    }

    private ResultActions agregar(long usuarioId, long productoId, int cantidad) throws Exception {
        return mockMvc.perform(post(URL + "/" + usuarioId + "/items")
                .header(HttpHeaders.AUTHORIZATION, token(usuarioId, "CLIENTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productoId\":%d,\"cantidad\":%d}".formatted(productoId, cantidad)));
    }

    private ResultActions aplicarCupon(long usuarioId, String codigo) throws Exception {
        return mockMvc.perform(post(URL + "/" + usuarioId + "/cupon")
                .header(HttpHeaders.AUTHORIZATION, token(usuarioId, "CLIENTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"codigo\":\"%s\"}".formatted(codigo)));
    }

    @Test
    void carritoInexistenteDevuelveUnoVacio() throws Exception {
        mockMvc.perform(get(URL + "/7").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(7))
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalUnidades").value(0))
                .andExpect(jsonPath("$.subtotal").value(0))
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.cuponCodigo").doesNotExist());
    }

    @Test
    void agregarItemDevuelveTotales() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 10000));

        agregar(7, 10, 2)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].productoId").value(10))
                .andExpect(jsonPath("$.items[0].nombre").value("Juego 10"))
                .andExpect(jsonPath("$.items[0].precioUnitario").value(10000))
                .andExpect(jsonPath("$.items[0].cantidad").value(2))
                .andExpect(jsonPath("$.totalUnidades").value(2))
                .andExpect(jsonPath("$.subtotal").value(20000))
                .andExpect(jsonPath("$.total").value(20000));
    }

    @Test
    void agregarElMismoProductoSumaLaCantidad() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 5000));

        agregar(7, 10, 2).andExpect(status().isOk());
        agregar(7, 10, 3)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].cantidad").value(5))
                .andExpect(jsonPath("$.totalUnidades").value(5))
                .andExpect(jsonPath("$.subtotal").value(25000));
    }

    @Test
    void stockInsuficienteResponde409() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 1, 5000));

        agregar(7, 10, 2)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detalles.productoId").value("10"))
                .andExpect(jsonPath("$.detalles.disponible").value("1"))
                .andExpect(jsonPath("$.detalles.solicitado").value("2"));

        org.assertj.core.api.Assertions.assertThat(carritoRepository.count()).isZero();
    }

    @Test
    void productoInexistenteResponde404() throws Exception {
        when(productoClient.obtener(any(), any())).thenThrow(new ProductoNoEncontradoException(99L));

        agregar(7, 99, 1)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void catalogoCaidoResponde503() throws Exception {
        when(productoClient.obtener(any(), any()))
                .thenThrow(new ServicioNoDisponibleException("ms-productos", null));

        agregar(7, 10, 1)
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.detalles.servicio").value("ms-productos"))
                .andExpect(jsonPath("$.message").value(containsString("ms-productos")));
    }

    @Test
    void actualizarCantidadRecalculaTotales() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 4000));
        agregar(7, 10, 1).andExpect(status().isOk());

        mockMvc.perform(put(URL + "/7/items/10")
                        .header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].cantidad").value(4))
                .andExpect(jsonPath("$.subtotal").value(16000));
    }

    @Test
    void cantidadCeroEliminaElItem() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 4000));
        agregar(7, 10, 2).andExpect(status().isOk());

        mockMvc.perform(put(URL + "/7/items/10")
                        .header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalUnidades").value(0));
    }

    @Test
    void eliminarItemResponde204() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 4000));
        agregar(7, 10, 2).andExpect(status().isOk());

        mockMvc.perform(delete(URL + "/7/items/10")
                        .header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(URL + "/7").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void vaciarCarritoResponde204YQuitaElCupon() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 10000));
        agregar(7, 10, 2).andExpect(status().isOk());
        aplicarCupon(7, "levelup10").andExpect(status().isOk());

        mockMvc.perform(delete(URL + "/7").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(URL + "/7").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.cuponCodigo").doesNotExist())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void cuponValidoEnMinusculasAplicaDescuento() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 10000));
        agregar(7, 10, 2).andExpect(status().isOk());

        aplicarCupon(7, "levelup10")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cuponCodigo").value("LEVELUP10"))
                .andExpect(jsonPath("$.subtotal").value(20000))
                .andExpect(jsonPath("$.descuento").value(2000))
                .andExpect(jsonPath("$.total").value(18000));
    }

    @Test
    void cuponInvalidoResponde400ConElCampo() throws Exception {
        aplicarCupon(7, "OTRO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detalles.codigo").value("Cupón inválido."));
    }

    @Test
    void quitarCuponDevuelveElCarritoSinDescuento() throws Exception {
        when(productoClient.obtener(any(), any())).thenReturn(producto(10L, 10, 10000));
        agregar(7, 10, 1).andExpect(status().isOk());
        aplicarCupon(7, "gamer20").andExpect(status().isOk());

        mockMvc.perform(delete(URL + "/7/cupon").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cuponCodigo").doesNotExist())
                .andExpect(jsonPath("$.descuento").value(0))
                .andExpect(jsonPath("$.total").value(10000));
    }

    @Test
    void clienteNoPuedeAccederAlCarritoDeOtro() throws Exception {
        mockMvc.perform(get(URL + "/8").header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminPuedeAccederAlCarritoDeCualquiera() throws Exception {
        mockMvc.perform(get(URL + "/8").header(HttpHeaders.AUTHORIZATION, token(1, "ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(8));
    }

    @Test
    void sinTokenResponde401() throws Exception {
        mockMvc.perform(get(URL + "/7"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void cantidadNegativaResponde400() throws Exception {
        mockMvc.perform(put(URL + "/7/items/10")
                        .header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.cantidad").exists());
    }

    @Test
    void agregarSinProductoResponde400() throws Exception {
        mockMvc.perform(post(URL + "/7/items")
                        .header(HttpHeaders.AUTHORIZATION, token(7, "CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.productoId").exists());

        org.mockito.Mockito.verify(productoClient, org.mockito.Mockito.never()).obtener(any(), any());
    }
}
