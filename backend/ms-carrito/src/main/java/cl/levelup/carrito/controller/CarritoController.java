package cl.levelup.carrito.controller;

import cl.levelup.carrito.dto.CantidadRequest;
import cl.levelup.carrito.dto.CarritoResponse;
import cl.levelup.carrito.dto.CuponRequest;
import cl.levelup.carrito.dto.ItemRequest;
import cl.levelup.carrito.service.CarritoService;
import cl.levelup.comun.UsuarioAutenticado;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carritos")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping("/{usuarioId}")
    public CarritoResponse obtener(@PathVariable Long usuarioId,
                                   @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return carritoService.obtener(usuarioId, usuario);
    }

    @PostMapping("/{usuarioId}/items")
    public CarritoResponse agregar(@PathVariable Long usuarioId,
                                   @Valid @RequestBody ItemRequest request,
                                   @AuthenticationPrincipal UsuarioAutenticado usuario,
                                   @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return carritoService.agregar(usuarioId, request.productoId(), request.cantidad(), usuario, authorization);
    }

    @PutMapping("/{usuarioId}/items/{productoId}")
    public CarritoResponse actualizarCantidad(@PathVariable Long usuarioId,
                                              @PathVariable Long productoId,
                                              @Valid @RequestBody CantidadRequest request,
                                              @AuthenticationPrincipal UsuarioAutenticado usuario,
                                              @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return carritoService.actualizarCantidad(usuarioId, productoId, request.cantidad(), usuario, authorization);
    }

    @DeleteMapping("/{usuarioId}/items/{productoId}")
    public ResponseEntity<Void> eliminarItem(@PathVariable Long usuarioId,
                                             @PathVariable Long productoId,
                                             @AuthenticationPrincipal UsuarioAutenticado usuario) {
        carritoService.eliminarItem(usuarioId, productoId, usuario);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{usuarioId}")
    public ResponseEntity<Void> vaciar(@PathVariable Long usuarioId,
                                       @AuthenticationPrincipal UsuarioAutenticado usuario) {
        carritoService.vaciar(usuarioId, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{usuarioId}/cupon")
    public CarritoResponse aplicarCupon(@PathVariable Long usuarioId,
                                        @Valid @RequestBody CuponRequest request,
                                        @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return carritoService.aplicarCupon(usuarioId, request.codigo(), usuario);
    }

    @DeleteMapping("/{usuarioId}/cupon")
    public CarritoResponse quitarCupon(@PathVariable Long usuarioId,
                                       @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return carritoService.quitarCupon(usuarioId, usuario);
    }
}
