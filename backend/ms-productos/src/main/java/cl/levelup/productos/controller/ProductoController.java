package cl.levelup.productos.controller;

import cl.levelup.productos.dto.ProductoRequest;
import cl.levelup.productos.dto.ProductoResponse;
import cl.levelup.productos.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    /**
     * Lista productos activos. Si se envian page y size devuelve una pagina;
     * en caso contrario devuelve un arreglo plano.
     */
    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Boolean oferta,
            @RequestParam(required = false) Boolean sinStock,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null) {
            return ResponseEntity.ok(productoService.listarPaginado(q, categoriaId, oferta, sinStock, page, size));
        }
        return ResponseEntity.ok(productoService.listar(q, categoriaId, oferta, sinStock));
    }

    @GetMapping("/ofertas")
    public List<ProductoResponse> ofertas() {
        return productoService.ofertas();
    }

    @GetMapping("/criticos")
    public List<ProductoResponse> criticos(@RequestParam(defaultValue = "5") int umbral) {
        return productoService.criticos(umbral);
    }

    @GetMapping("/{id}")
    public ProductoResponse obtener(@PathVariable Long id) {
        return productoService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        ProductoResponse creado = productoService.crear(request);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(creado.id())
                        .toUri())
                .body(creado);
    }

    @PutMapping("/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
