package cl.levelup.pagos.service;

import cl.levelup.pagos.dto.PagoRequest;
import cl.levelup.pagos.dto.PagoResponse;
import cl.levelup.pagos.exception.PagoDuplicadoException;
import cl.levelup.pagos.exception.PagoInvalidoException;
import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.model.MetodoPago;
import cl.levelup.pagos.model.Pago;
import cl.levelup.pagos.repository.PagoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    private static final Long ORDEN_ID = 10L;
    private static final String TARJETA_OK = "4111 1111 1111 1234";

    @Mock
    private PagoRepository pagoRepository;

    @InjectMocks
    private PagoService pagoService;

    private PagoRequest request(Integer monto, MetodoPago metodo, String tarjeta) {
        return new PagoRequest(ORDEN_ID, monto, metodo, tarjeta);
    }

    private void guardarDevuelveEntidad() {
        when(pagoRepository.save(any(Pago.class))).thenAnswer(invocacion -> {
            Pago pago = invocacion.getArgument(0);
            pago.setId(99L);
            return pago;
        });
    }

    private Pago pagoGuardado(Long id, EstadoPago estado) {
        Pago pago = new Pago();
        pago.setId(id);
        pago.setOrdenId(ORDEN_ID);
        pago.setMonto(19990);
        pago.setMetodo(MetodoPago.TRANSFERENCIA);
        pago.setEstado(estado);
        pago.setCodigoTransaccion(UUID.randomUUID().toString());
        pago.setFecha(LocalDateTime.now());
        return pago;
    }

    @Test
    void pagoConTarjetaNormalQuedaAprobado() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(false);
        guardarDevuelveEntidad();

        PagoResponse respuesta = pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, TARJETA_OK));

        assertThat(respuesta.estado()).isEqualTo(EstadoPago.APROBADO);
        assertThat(respuesta.motivoRechazo()).isNull();
        assertThat(respuesta.ultimosDigitos()).isEqualTo("1234");
        assertThat(respuesta.codigoTransaccion()).hasSize(36);
        assertThat(respuesta.fecha()).isNotNull();
        assertThat(respuesta.id()).isEqualTo(99L);
        assertThat(respuesta.monto()).isEqualTo(19990);
    }

    @Test
    void tarjetaTerminadaEn0000EsRechazadaPorFondos() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(false);
        guardarDevuelveEntidad();

        PagoResponse respuesta = pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, "4111111111110000"));

        assertThat(respuesta.estado()).isEqualTo(EstadoPago.RECHAZADO);
        assertThat(respuesta.motivoRechazo()).isEqualTo("Fondos insuficientes");
        assertThat(respuesta.ultimosDigitos()).isEqualTo("0000");
    }

    @Test
    void tarjetaTerminadaEn1111EsRechazadaPorTarjetaInvalida() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(false);
        guardarDevuelveEntidad();

        PagoResponse respuesta = pagoService.registrar(request(19990, MetodoPago.TARJETA_DEBITO, "4111111111111111"));

        assertThat(respuesta.estado()).isEqualTo(EstadoPago.RECHAZADO);
        assertThat(respuesta.motivoRechazo()).isEqualTo("Tarjeta inválida");
        assertThat(respuesta.ultimosDigitos()).isEqualTo("1111");
    }

    @Test
    void transferenciaSiempreQuedaAprobadaYSinDigitos() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(false);
        guardarDevuelveEntidad();

        PagoResponse respuesta = pagoService.registrar(request(50000, MetodoPago.TRANSFERENCIA, null));

        assertThat(respuesta.estado()).isEqualTo(EstadoPago.APROBADO);
        assertThat(respuesta.ultimosDigitos()).isNull();
        assertThat(respuesta.motivoRechazo()).isNull();
    }

    @Test
    void elNumeroCompletoNoSePersisteNiSeDevuelve() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(false);
        guardarDevuelveEntidad();
        ArgumentCaptor<Pago> captor = ArgumentCaptor.forClass(Pago.class);

        PagoResponse respuesta = pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, "4111 1111 1111 9876"));

        verify(pagoRepository).save(captor.capture());
        Pago persistido = captor.getValue();
        assertThat(persistido.getUltimosDigitos()).isEqualTo("9876");
        assertThat(persistido.getUltimosDigitos()).hasSize(4);
        assertThat(respuesta.toString()).doesNotContain("4111111111119876");
    }

    @Test
    void segundoPagoAprobadoDeLaMismaOrdenEsConflicto() {
        when(pagoRepository.existsByOrdenIdAndEstado(ORDEN_ID, EstadoPago.APROBADO)).thenReturn(true);

        assertThatThrownBy(() -> pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, TARJETA_OK)))
                .isInstanceOf(PagoDuplicadoException.class)
                .hasMessageContaining(String.valueOf(ORDEN_ID));

        verify(pagoRepository, never()).save(any(Pago.class));
    }

    @Test
    void tarjetaSinNumeroEsCampoInvalido() {
        assertThatThrownBy(() -> pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, "   ")))
                .isInstanceOfSatisfying(PagoInvalidoException.class, excepcion -> {
                    assertThat(excepcion.getCampo()).isEqualTo("numeroTarjeta");
                    assertThat(excepcion.getMessage()).contains("obligatorio");
                });
    }

    @Test
    void tarjetaConMenosDeDieciseisDigitosEsCampoInvalido() {
        assertThatThrownBy(() -> pagoService.registrar(request(19990, MetodoPago.TARJETA_DEBITO, "1234 5678 9012 345")))
                .isInstanceOf(PagoInvalidoException.class)
                .hasMessageContaining("16 digitos");
    }

    @Test
    void tarjetaConLetrasEsCampoInvalido() {
        assertThatThrownBy(() -> pagoService.registrar(request(19990, MetodoPago.TARJETA_CREDITO, "4111-1111-1111-1234")))
                .isInstanceOf(PagoInvalidoException.class);
    }

    @Test
    void obtenerDevuelveElPago() {
        when(pagoRepository.findById(5L)).thenReturn(Optional.of(pagoGuardado(5L, EstadoPago.APROBADO)));

        PagoResponse respuesta = pagoService.obtener(5L);

        assertThat(respuesta.id()).isEqualTo(5L);
        assertThat(respuesta.estado()).isEqualTo(EstadoPago.APROBADO);
    }

    @Test
    void obtenerInexistenteLanzaNoSuchElement() {
        when(pagoRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pagoService.obtener(404L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("404");
    }

    @Test
    void listarPorOrdenDevuelveHistorial() {
        when(pagoRepository.findByOrdenIdOrderByFechaDesc(ORDEN_ID))
                .thenReturn(List.of(pagoGuardado(2L, EstadoPago.APROBADO), pagoGuardado(1L, EstadoPago.RECHAZADO)));

        List<PagoResponse> historial = pagoService.listarPorOrden(ORDEN_ID);

        assertThat(historial).hasSize(2);
        assertThat(historial.get(0).id()).isEqualTo(2L);
        assertThat(historial.get(1).estado()).isEqualTo(EstadoPago.RECHAZADO);
    }

    @Test
    void listarSinFiltroUsaTodosLosPagos() {
        when(pagoRepository.findAll(any(Sort.class)))
                .thenReturn(List.of(pagoGuardado(1L, EstadoPago.APROBADO)));

        List<PagoResponse> pagos = pagoService.listar(null);

        assertThat(pagos).hasSize(1);
    }

    @Test
    void listarPorEstadoFiltraEnElRepositorio() {
        when(pagoRepository.findByEstadoOrderByFechaDesc(EstadoPago.RECHAZADO))
                .thenReturn(List.of(pagoGuardado(3L, EstadoPago.RECHAZADO)));

        List<PagoResponse> pagos = pagoService.listar(EstadoPago.RECHAZADO);

        assertThat(pagos).hasSize(1);
        assertThat(pagos.get(0).estado()).isEqualTo(EstadoPago.RECHAZADO);
    }
}
