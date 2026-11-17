package cl.levelup.pagos.controller;

import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.repository.PagoRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la API de pagos contra el contexto completo con H2 en memoria.
 * Cada prueba se revierte al final.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PagosApiTest {

    private static final String URL = "/api/pagos";
    private static final String TARJETA_OK = "4111 1111 1111 1234";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PagoRepository pagoRepository;

    @TestConfiguration
    static class SeguridadMockMvc {

        @Bean
        MockMvcBuilderCustomizer seguridadCustomizer() {
            return builder -> builder.apply(SecurityMockMvcConfigurers.springSecurity());
        }
    }

    private String pagoJson(long ordenId, int monto, String metodo) {
        return """
                {"ordenId":%d,"monto":%d,"metodo":"%s"}""".formatted(ordenId, monto, metodo);
    }

    private String pagoJson(long ordenId, int monto, String metodo, String tarjeta) {
        return """
                {"ordenId":%d,"monto":%d,"metodo":"%s","numeroTarjeta":"%s"}""".formatted(ordenId, monto, metodo, tarjeta);
    }

    private long registrar(String json) throws Exception {
        MvcResult resultado = mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andReturn();
        String cuerpo = resultado.getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(cuerpo, "$.id")).longValue();
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void pagoAprobadoResponde201SinNumeroDeTarjeta() throws Exception {
        MvcResult resultado = mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(1L, 19990, "TARJETA_CREDITO", TARJETA_OK)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/pagos/")))
                .andExpect(jsonPath("$.estado").value("APROBADO"))
                .andExpect(jsonPath("$.ultimosDigitos").value("1234"))
                .andExpect(jsonPath("$.numeroTarjeta").doesNotExist())
                .andExpect(jsonPath("$.motivoRechazo").doesNotExist())
                .andExpect(jsonPath("$.codigoTransaccion").isNotEmpty())
                .andReturn();

        String cuerpo = resultado.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(cuerpo).doesNotContain("4111111111111234");
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void tarjetaTerminadaEn0000Responde201Rechazado() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(2L, 19990, "TARJETA_CREDITO", "4111111111110000")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("RECHAZADO"))
                .andExpect(jsonPath("$.motivoRechazo").value("Fondos insuficientes"))
                .andExpect(jsonPath("$.ultimosDigitos").value("0000"));
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void tarjetaTerminadaEn1111Responde201Rechazado() throws Exception {
        MvcResult resultado = mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(3L, 15000, "TARJETA_DEBITO", "4111111111111111")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("RECHAZADO"))
                .andExpect(jsonPath("$.ultimosDigitos").value("1111"))
                .andReturn();

        String cuerpo = resultado.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(cuerpo).contains("Tarjeta inv");
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void transferenciaQuedaAprobadaSinDigitos() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(4L, 50000, "TRANSFERENCIA")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("APROBADO"))
                .andExpect(jsonPath("$.ultimosDigitos").doesNotExist())
                .andExpect(jsonPath("$.motivoRechazo").doesNotExist());
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void montoCeroResponde400ConDetalleDelCampo() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(5L, 0, "TRANSFERENCIA")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detalles.monto").exists());
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void pagoSinOrdenResponde400() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monto\":1000,\"metodo\":\"TRANSFERENCIA\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.ordenId").exists());
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void metodosDePagoInvalidosResponden400() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ordenId\":6,\"monto\":1000}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.metodo").exists());

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ordenId\":6,\"monto\":1000,\"metodo\":\"BITCOIN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void tarjetaConFormatoInvalidoResponde400() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(7L, 19990, "TARJETA_CREDITO", "1234 5678 9012 345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.numeroTarjeta").exists());

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(7L, 19990, "TARJETA_CREDITO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.numeroTarjeta").exists());
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void segundoPagoAprobadoDeLaMismaOrdenResponde409() throws Exception {
        registrar(pagoJson(8L, 19990, "TARJETA_CREDITO", TARJETA_OK));

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(8L, 19990, "TRANSFERENCIA")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detalles.ordenId").value(8));
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void trasUnRechazoSePuedeReintentarYQuedaAprobado() throws Exception {
        registrar(pagoJson(9L, 19990, "TARJETA_CREDITO", "4111111111110000"));
        long aprobado = registrar(pagoJson(9L, 19990, "TARJETA_CREDITO", TARJETA_OK));

        mockMvc.perform(get(URL + "/" + aprobado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADO"));

        mockMvc.perform(get(URL + "/orden/9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void detalleInexistenteResponde404() throws Exception {
        mockMvc.perform(get(URL + "/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser(username = "admin@levelup.cl", roles = "ADMIN")
    void historialCompletoEsSoloParaAdmin() throws Exception {
        registrar(pagoJson(10L, 19990, "TRANSFERENCIA"));

        mockMvc.perform(get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get(URL).param("estado", "APROBADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get(URL).param("estado", "RECHAZADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        assertThat(pagoRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "cliente@levelup.cl", roles = "CLIENTE")
    void historialCompletoDevuelve403ParaCliente() throws Exception {
        mockMvc.perform(get(URL))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void endpointsSinTokenResponden401() throws Exception {
        mockMvc.perform(get(URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(11L, 19990, "TRANSFERENCIA")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@levelup.cl", roles = "ADMIN")
    void filtroDeEstadoInvalidoResponde400() throws Exception {
        mockMvc.perform(get(URL).param("estado", "PERDIDO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser(username = "admin@levelup.cl", roles = "ADMIN")
    void filtroDeEstadoDevuelveSoloLosRechazados() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(12L, 19990, "TRANSFERENCIA")))
                .andExpect(status().isCreated());
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoJson(13L, 19990, "TARJETA_CREDITO", "4111111111110000")))
                .andExpect(status().isCreated());

        mockMvc.perform(get(URL).param("estado", "RECHAZADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].estado").value(EstadoPago.RECHAZADO.name()))
                .andExpect(jsonPath("$[0].ordenId").value(13));
    }
}
