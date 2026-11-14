package cl.levelup.productos.service;

import cl.levelup.productos.dto.PageResponse;
import cl.levelup.productos.dto.ProductoRequest;
import cl.levelup.productos.dto.ProductoResponse;
import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.ProductoRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<ProductoResponse> listar(String q, Long categoriaId, Boolean oferta, Boolean sinStock) {
        return productoRepository
                .findAll(filtro(q, categoriaId, oferta, sinStock), Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    public PageResponse<ProductoResponse> listarPaginado(String q, Long categoriaId, Boolean oferta, Boolean sinStock,
                                                         int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("El numero de pagina no puede ser negativo");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("El tamano de pagina debe estar entre 1 y 100");
        }
        var resultado = productoRepository
                .findAll(filtro(q, categoriaId, oferta, sinStock),
                        PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id")))
                .map(ProductoResponse::from);
        return PageResponse.from(resultado);
    }

    public ProductoResponse obtener(Long id) {
        return ProductoResponse.from(buscarActivo(id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = buscarCategoria(request.categoriaId());
        Producto producto = new Producto();
        aplicar(producto, request, categoria);
        producto.setActivo(request.activo() == null ? Boolean.TRUE : request.activo());
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con id: " + id));
        aplicar(producto, request, buscarCategoria(request.categoriaId()));
        if (request.activo() != null) {
            producto.setActivo(request.activo());
        }
        return ProductoResponse.from(productoRepository.save(producto));
    }

    /**
     * Baja logica: el producto deja de mostrarse pero se conserva su historial.
     */
    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con id: " + id));
        producto.setActivo(false);
    }

    public List<ProductoResponse> ofertas() {
        return productoRepository.findByActivoTrueAndDescuentoGreaterThanOrderByNombreAsc(0)
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    public List<ProductoResponse> criticos(int umbral) {
        if (umbral < 0) {
            throw new IllegalArgumentException("El umbral no puede ser negativo");
        }
        return productoRepository.findByActivoTrueAndStockLessThanEqualOrderByStockAsc(umbral)
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    private Producto buscarActivo(Long id) {
        return productoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con id: " + id));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("La categoria indicada no existe: " + categoriaId));
    }

    private void aplicar(Producto producto, ProductoRequest request, Categoria categoria) {
        producto.setNombre(request.nombre().trim());
        producto.setCategoria(categoria);
        producto.setAtributo(request.atributo().trim());
        producto.setPrecio(request.precio());
        producto.setDescuento(request.descuento() == null ? 0 : request.descuento());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen().trim());
    }

    private Specification<Producto> filtro(String q, Long categoriaId, Boolean oferta, Boolean sinStock) {
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            predicados.add(cb.isTrue(root.get("activo")));

            if (q != null && !q.isBlank()) {
                predicados.add(cb.like(cb.lower(root.get("nombre")), "%" + q.trim().toLowerCase() + "%"));
            }
            if (categoriaId != null) {
                predicados.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }
            if (Boolean.TRUE.equals(oferta)) {
                predicados.add(cb.greaterThan(root.<Integer>get("descuento"), 0));
            }
            if (Boolean.TRUE.equals(sinStock)) {
                predicados.add(cb.le(root.<Integer>get("stock"), 0));
            }
            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }
}
