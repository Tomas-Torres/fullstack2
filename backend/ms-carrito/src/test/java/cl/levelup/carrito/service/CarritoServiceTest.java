package cl.levelup.carrito.service;

import cl.levelup.carrito.client.ProductoClient;
import cl.levelup.carrito.client.ProductoInfo;
import cl.levelup.carrito.dto.CarritoResponse;
import cl.levelup.carrito.exception.AccesoDenegadoException;
import cl.levelup.carrito.exception.CuponInvalidoException;
import cl.levelup.carrito.exception.ProductoNoEncontradoException;
import cl.levelup.carrito.exception.ServicioNoDisponibleException;
import cl.levelup.carrito.exception.StockInsuficienteException;
import cl.levelup.carrito.model.Carrito;
import cl.levelup.carrito.model.ItemCarrito;
import cl.levelup.carrito.repository.CarritoRepository;
import cl.levelup.comun.UsuarioAutenticado;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarritoServiceTest {

    private static final Long USUARIO_ID = 7L;
    private static final String TOKEN = "Bearer token";

    private final UsuarioAutenticado cliente = new UsuarioAutenticado(USUARIO_ID, "cliente@levelup.cl", "CLIENTE");
    private final UsuarioAutenticado admin = new UsuarioAutenticado(1L, "admin@levelup.cl", "ADMIN");

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private ProductoClient productoClient;

    @InjectMocks
    private CarritoService carritoService;

    private ProductoInfo producto(Long id, int stock, int precio) {
        return new ProductoInfo(id, "Juego " + id, "/img/" + id + ".png", precio, stock, stock <= 0);
    }

    private Carrito carritoCon(ItemCarrito... items) {
        Carrito carrito = new Carrito(USUARIO_ID);
        for (ItemCarrito item : items) {
            carrito.agregar(item);
        }
        return carrito;
    }

    private ItemCarrito item(Long productoId, int precio, int cantidad) {
        return new ItemCarrito(productoId, "Juego " + productoId, "/img/" + productoId + ".png", precio, cantidad);
    }

    private void guardarDevuelveMismo() {
        when(carritoRepository.save(any(Carrito.class))).thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void agregarProductoNuevoCalculaTotales() {
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 5, 10000));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.agregar(USUARIO_ID, 10L, 2, cliente, TOKEN);

        assertThat(respuesta.items()).hasSize(1);
        assertThat(respuesta.items().get(0).productoId()).isEqualTo(10L);
        assertThat(respuesta.items().get(0).nombre()).isEqualTo("Juego 10");
        assertThat(respuesta.totalUnidades()).isEqualTo(2);
        assertThat(respuesta.subtotal()).isEqualTo(20000);
        assertThat(respuesta.descuento()).isZero();
        assertThat(respuesta.total()).isEqualTo(20000);
    }

    @Test
    void agregarProductoRepetidoSumaCantidad() {
        Carrito existente = carritoCon(item(10L, 5000, 2));
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 10, 5000));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.agregar(USUARIO_ID, 10L, 3, cliente, TOKEN);

        assertThat(respuesta.items()).hasSize(1);
        assertThat(respuesta.items().get(0).cantidad()).isEqualTo(5);
        assertThat(respuesta.totalUnidades()).isEqualTo(5);
        assertThat(respuesta.subtotal()).isEqualTo(25000);
    }

    @Test
    void agregarSuperaElStockLanzaConflicto() {
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 2, 5000));

        assertThatThrownBy(() -> carritoService.agregar(USUARIO_ID, 10L, 3, cliente, TOKEN))
                .isInstanceOfSatisfying(StockInsuficienteException.class, ex -> {
                    assertThat(ex.getDisponible()).isEqualTo(2);
                    assertThat(ex.getSolicitado()).isEqualTo(3);
                });

        verify(carritoRepository, never()).save(any(Carrito.class));
    }

    @Test
    void agregarRepetidoSuperaElStockLanzaConflicto() {
        Carrito existente = carritoCon(item(10L, 5000, 2));
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 3, 5000));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));

        assertThatThrownBy(() -> carritoService.agregar(USUARIO_ID, 10L, 2, cliente, TOKEN))
                .isInstanceOf(StockInsuficienteException.class);

        verify(carritoRepository, never()).save(any(Carrito.class));
    }

    @Test
    void agregarProductoSinStockLanzaConflicto() {
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 0, 5000));

        assertThatThrownBy(() -> carritoService.agregar(USUARIO_ID, 10L, 1, cliente, TOKEN))
                .isInstanceOf(StockInsuficienteException.class)
                .hasMessageContaining("disponible 0");
    }

    @Test
    void agregarProductoInexistentePropagaNoEncontrado() {
        when(productoClient.obtener(99L, TOKEN)).thenThrow(new ProductoNoEncontradoException(99L));

        assertThatThrownBy(() -> carritoService.agregar(USUARIO_ID, 99L, 1, cliente, TOKEN))
                .isInstanceOf(ProductoNoEncontradoException.class);
    }

    @Test
    void catalogoCaidoPropagaServicioNoDisponible() {
        when(productoClient.obtener(10L, TOKEN))
                .thenThrow(new ServicioNoDisponibleException("ms-productos", null));

        assertThatThrownBy(() -> carritoService.agregar(USUARIO_ID, 10L, 1, cliente, TOKEN))
                .isInstanceOf(ServicioNoDisponibleException.class)
                .hasMessageContaining("ms-productos");
    }

    @Test
    void obtenerCarritoInexistenteDevuelveVacio() {
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());

        CarritoResponse respuesta = carritoService.obtener(USUARIO_ID, cliente);

        assertThat(respuesta.items()).isEmpty();
        assertThat(respuesta.totalUnidades()).isZero();
        assertThat(respuesta.subtotal()).isZero();
        assertThat(respuesta.descuento()).isZero();
        assertThat(respuesta.total()).isZero();
        assertThat(respuesta.cuponCodigo()).isNull();
    }

    @Test
    void obtenerCarritoConCuponCalculaDescuento() {
        Carrito existente = carritoCon(item(1L, 10000, 2), item(2L, 5000, 1));
        existente.setCuponCodigo("GAMER20");
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));

        CarritoResponse respuesta = carritoService.obtener(USUARIO_ID, cliente);

        assertThat(respuesta.totalUnidades()).isEqualTo(3);
        assertThat(respuesta.subtotal()).isEqualTo(25000);
        assertThat(respuesta.descuento()).isEqualTo(5000);
        assertThat(respuesta.total()).isEqualTo(20000);
        assertThat(respuesta.cuponCodigo()).isEqualTo("GAMER20");
    }

    @Test
    void actualizarCantidadRefrescaPrecioYNombre() {
        Carrito existente = carritoCon(item(10L, 10000, 1));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        when(productoClient.obtener(10L, TOKEN))
                .thenReturn(new ProductoInfo(10L, "Juego renovado", "/img/nuevo.png", 8000, 10, false));
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.actualizarCantidad(USUARIO_ID, 10L, 3, cliente, TOKEN);

        assertThat(respuesta.items().get(0).cantidad()).isEqualTo(3);
        assertThat(respuesta.items().get(0).precioUnitario()).isEqualTo(8000);
        assertThat(respuesta.items().get(0).nombre()).isEqualTo("Juego renovado");
        assertThat(respuesta.subtotal()).isEqualTo(24000);
    }

    @Test
    void actualizarCantidadCeroEliminaElItemSinConsultarCatalogo() {
        Carrito existente = carritoCon(item(10L, 10000, 3));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.actualizarCantidad(USUARIO_ID, 10L, 0, cliente, TOKEN);

        assertThat(respuesta.items()).isEmpty();
        assertThat(respuesta.totalUnidades()).isZero();
        verify(productoClient, never()).obtener(any(), any());
    }

    @Test
    void actualizarItemInexistenteLanzaNoSuchElement() {
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(carritoCon(item(1L, 1000, 1))));

        assertThatThrownBy(() -> carritoService.actualizarCantidad(USUARIO_ID, 99L, 2, cliente, TOKEN))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("99");
    }

    @Test
    void actualizarCantidadSuperaStockLanzaConflicto() {
        Carrito existente = carritoCon(item(10L, 1000, 1));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        when(productoClient.obtener(10L, TOKEN)).thenReturn(producto(10L, 2, 1000));

        assertThatThrownBy(() -> carritoService.actualizarCantidad(USUARIO_ID, 10L, 5, cliente, TOKEN))
                .isInstanceOf(StockInsuficienteException.class);
    }

    @Test
    void eliminarItemQuitaLaLinea() {
        Carrito existente = carritoCon(item(10L, 1000, 2), item(20L, 2000, 1));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));

        carritoService.eliminarItem(USUARIO_ID, 10L, cliente);

        assertThat(existente.getItems()).hasSize(1);
        assertThat(existente.getItems().get(0).getProductoId()).isEqualTo(20L);
        verify(carritoRepository).save(existente);
    }

    @Test
    void eliminarItemInexistenteLanzaNoSuchElement() {
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(carritoCon(item(10L, 1000, 2))));

        assertThatThrownBy(() -> carritoService.eliminarItem(USUARIO_ID, 99L, cliente))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void vaciarDejaCarritoSinItemsNiCupon() {
        Carrito existente = carritoCon(item(10L, 1000, 2));
        existente.setCuponCodigo("LEVELUP10");
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));

        carritoService.vaciar(USUARIO_ID, cliente);

        assertThat(existente.getItems()).isEmpty();
        assertThat(existente.getCuponCodigo()).isNull();
        verify(carritoRepository).save(existente);
    }

    @Test
    void aplicarCuponSinDistinguirMayusculas() {
        Carrito existente = carritoCon(item(10L, 10000, 2));
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.aplicarCupon(USUARIO_ID, "levelup10", cliente);

        assertThat(respuesta.cuponCodigo()).isEqualTo("LEVELUP10");
        assertThat(respuesta.descuento()).isEqualTo(2000);
        assertThat(respuesta.total()).isEqualTo(18000);
    }

    @Test
    void aplicarCuponCreaCarritoSiNoExiste() {
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.aplicarCupon(USUARIO_ID, "gamer20", cliente);

        assertThat(respuesta.cuponCodigo()).isEqualTo("GAMER20");
        assertThat(respuesta.subtotal()).isZero();
        assertThat(respuesta.total()).isZero();
    }

    @Test
    void aplicarCuponInvalidoLanzaBadRequest() {
        assertThatThrownBy(() -> carritoService.aplicarCupon(USUARIO_ID, "OTRO", cliente))
                .isInstanceOf(CuponInvalidoException.class)
                .hasMessage("Cupón inválido.");

        verify(carritoRepository, never()).save(any(Carrito.class));
    }

    @Test
    void quitarCuponRecalculaTotales() {
        Carrito existente = carritoCon(item(10L, 10000, 1));
        existente.setCuponCodigo("GAMER20");
        when(carritoRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existente));
        guardarDevuelveMismo();

        CarritoResponse respuesta = carritoService.quitarCupon(USUARIO_ID, cliente);

        assertThat(respuesta.cuponCodigo()).isNull();
        assertThat(respuesta.descuento()).isZero();
        assertThat(respuesta.total()).isEqualTo(10000);
    }

    @Test
    void clienteNoPuedeVerElCarritoDeOtro() {
        assertThatThrownBy(() -> carritoService.obtener(99L, cliente))
                .isInstanceOf(AccesoDenegadoException.class);

        verify(carritoRepository, never()).findByUsuarioId(any());
    }

    @Test
    void adminPuedeVerElCarritoDeOtro() {
        when(carritoRepository.findByUsuarioId(99L)).thenReturn(Optional.empty());

        CarritoResponse respuesta = carritoService.obtener(99L, admin);

        assertThat(respuesta.items()).isEmpty();
    }

    @Test
    void sinPrincipalSeRechazaElAcceso() {
        assertThatThrownBy(() -> carritoService.obtener(USUARIO_ID, null))
                .isInstanceOf(AccesoDenegadoException.class);
    }
}
