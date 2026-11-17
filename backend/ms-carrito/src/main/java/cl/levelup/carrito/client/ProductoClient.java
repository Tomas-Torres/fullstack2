package cl.levelup.carrito.client;

import cl.levelup.carrito.exception.ProductoNoEncontradoException;
import cl.levelup.carrito.exception.ServicioNoDisponibleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.time.Duration;

/**
 * Cliente HTTP hacia ms-productos. Reenvia el header Authorization del usuario
 * y traduce los errores del catalogo a excepciones del carrito.
 */
@Component
public class ProductoClient {

    private final RestClient restClient;

    public ProductoClient(@Value("${productos.url}") String url,
                          @Value("${productos.timeout-ms:2000}") long timeoutMs) {
        Duration timeout = Duration.ofMillis(timeoutMs);
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(timeout)
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(timeout);
        this.restClient = RestClient.builder()
                .baseUrl(url)
                .requestFactory(factory)
                .build();
    }

    /**
     * Obtiene el producto o lanza una excepcion acorde al resultado.
     */
    public ProductoInfo obtener(Long productoId, String authorization) {
        try {
            ProductoInfo producto = restClient.get()
                    .uri("/api/productos/{id}", productoId)
                    .headers(headers -> {
                        if (authorization != null && !authorization.isBlank()) {
                            headers.set(HttpHeaders.AUTHORIZATION, authorization);
                        }
                    })
                    .retrieve()
                    .onStatus(status -> status.value() == 404,
                            (request, response) -> {
                                throw new ProductoNoEncontradoException(productoId);
                            })
                    .body(ProductoInfo.class);

            if (producto == null) {
                throw new ServicioNoDisponibleException("ms-productos", null);
            }
            return producto;
        } catch (ProductoNoEncontradoException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ServicioNoDisponibleException("ms-productos", ex);
        }
    }
}
