package cl.levelup.productos.controller;

import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.ProductoRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la API contra el contexto completo. La transaccion de cada prueba
 * se revierte al final, por lo que el catalogo inicial siempre queda intacto.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductosApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * Spring Boot 4 ya no registra el configurador de seguridad de MockMvc de forma
     * automatica, por lo que se conecta aqui para que @WithMockUser funcione.
     */
    @TestConfiguration
    static class SeguridadMockMvc {

        @Bean
        MockMvcBuilderCustomizer seguridadCustomizer() {
            return builder -> builder.apply(SecurityMockMvcConfigurers.springSecurity());
        }
    }

    private Long idProducto(String nombre) {
        return productoRepository.findAll().stream()
                .filter(producto -> producto.getNombre().equals(nombre))
                .map(Producto::getId)
                .findFirst()
                .orElseThrow();
    }

    private Long idCategoria(String nombre) {
        return categoriaRepository.findByNombreIgnoreCase(nombre)
                .map(Categoria::getId)
                .orElseThrow();
    }

    private String productoJson(Long categoriaId, String nombre) {
        return """
                {"nombre":"%s","categoriaId":%d,"atributo":"Inalámbrico","precio":19990,
                 "descuento":10,"stock":4,"imagen":"/img/nuevo.png"}
                """.formatted(nombre, categoriaId);
    }

    @Test
    void listarDevuelveLosOchoProductosIniciales() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[0].nombre").value("Catan"))
                .andExpect(jsonPath("$[0].precioFinal").value(29990))
                .andExpect(jsonPath("$[0].enOferta").value(false))
                .andExpect(jsonPath("$[4].sinStock").value(true));
    }

    @Test
    void listarFiltraPorTexto() throws Exception {
        mockMvc.perform(get("/api/productos").param("q", "hyperx"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].precioFinal").value(63992));
    }

    @Test
    void listarFiltraPorCategoria() throws Exception {
        mockMvc.perform(get("/api/productos").param("categoriaId", String.valueOf(idCategoria("Mouse"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Mouse Logitech G502 HERO"));
    }

    @Test
    void listarSoloOfertasYSinStock() throws Exception {
        mockMvc.perform(get("/api/productos").param("oferta", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(get("/api/productos").param("sinStock", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("GTA6 (Versión Digital)"));
    }

    @Test
    void listarPaginadoDevuelveUnObjetoDePagina() throws Exception {
        mockMvc.perform(get("/api/productos").param("page", "0").param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.totalElements").value(8))
                .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    void detalleYOfertasYCriticos() throws Exception {
        mockMvc.perform(get("/api/productos/{id}", idProducto("Catan")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoriaNombre").value("Juegos de Mesa"));

        mockMvc.perform(get("/api/productos/ofertas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(get("/api/productos/criticos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void detalleInexistenteDevuelve404() throws Exception {
        mockMvc.perform(get("/api/productos/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void crearSinTokenDevuelve401() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson(idCategoria("Mouse"), "Producto sin token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void crearComoClienteDevuelve403() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson(idCategoria("Mouse"), "Producto de cliente")))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearConDatosInvalidosDevuelve400ConDetalle() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"","categoriaId":null,"atributo":"","precio":0,
                                 "descuento":95,"stock":-1,"imagen":"imagen.png"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.nombre").exists())
                .andExpect(jsonPath("$.detalles.precio").exists())
                .andExpect(jsonPath("$.detalles.imagen").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearProductoComoAdminDevuelve201ConLocation() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson(idCategoria("Mouse"), "Mouse de prueba")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/productos/")))
                .andExpect(jsonPath("$.precioFinal").value(17991))
                .andExpect(jsonPath("$.enOferta").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void actualizarYEliminarProducto() throws Exception {
        Long id = idProducto("Catan");

        mockMvc.perform(put("/api/productos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson(idCategoria("Juegos de Mesa"), "Catan Edición Especial")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Catan Edición Especial"));

        mockMvc.perform(delete("/api/productos/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/productos/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void actualizarProductoInexistenteDevuelve404() throws Exception {
        mockMvc.perform(put("/api/productos/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson(idCategoria("Mouse"), "No existe")))
                .andExpect(status().isNotFound());
    }

    @Test
    void listarCategoriasIncluyeCantidadDeProductos() throws Exception {
        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0].nombre").value("Accesorios"))
                .andExpect(jsonPath("$[0].cantidadProductos").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearCategoriaComoAdminDevuelve201() throws Exception {
        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Realidad Virtual\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Realidad Virtual"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void categoriaDuplicadaDevuelve409() throws Exception {
        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Mouse\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void categoriaConProductosNoSePuedeEliminar() throws Exception {
        mockMvc.perform(delete("/api/categorias/{id}", idCategoria("Accesorios")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void categoriaSinProductosSeElimina() throws Exception {
        Categoria nueva = categoriaRepository.save(new Categoria("Categoria temporal"));
        mockMvc.perform(delete("/api/categorias/{id}", nueva.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void descontarStockComoUsuarioAutenticadoDevuelve200() throws Exception {
        mockMvc.perform(post("/api/productos/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"productoId\":" + idProducto("Catan") + ",\"cantidad\":2}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Stock descontado correctamente"));
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void descontarStockInsuficienteDevuelve409ConDetalle() throws Exception {
        mockMvc.perform(post("/api/productos/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"productoId\":" + idProducto("GTA6 (Versión Digital)") + ",\"cantidad\":1}]"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detalles.productoId").exists())
                .andExpect(jsonPath("$.detalles.disponible").value(0));
    }

    @Test
    void descontarStockSinTokenDevuelve401() throws Exception {
        mockMvc.perform(post("/api/productos/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ajusteDeStockVacioDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos/stock/reponer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void documentacionOpenApiDisponible() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Level-Up Gamer - ms-productos"));
    }
}
