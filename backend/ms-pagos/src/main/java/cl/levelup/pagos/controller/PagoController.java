package cl.levelup.pagos.controller;

import cl.levelup.pagos.dto.PagoRequest;
import cl.levelup.pagos.dto.PagoResponse;
import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    /**
     * Registra un intento de cobro. Siempre responde 201, incluso cuando el
     * resultado es RECHAZADO.
     */
    @PostMapping
    public ResponseEntity<PagoResponse> registrar(@Valid @RequestBody PagoRequest request) {
        PagoResponse creado = pagoService.registrar(request);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(creado.id())
                        .toUri())
                .body(creado);
    }

    @GetMapping("/orden/{ordenId}")
    public List<PagoResponse> listarPorOrden(@PathVariable Long ordenId) {
        return pagoService.listarPorOrden(ordenId);
    }

    @GetMapping("/{id}")
    public PagoResponse obtener(@PathVariable Long id) {
        return pagoService.obtener(id);
    }

    /**
     * Historial completo, solo para ADMIN. Permite filtrar por estado.
     */
    @GetMapping
    public List<PagoResponse> listar(@RequestParam(required = false) EstadoPago estado) {
        return pagoService.listar(estado);
    }
}
