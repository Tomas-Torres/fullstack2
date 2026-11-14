package cl.levelup.productos.service;

import cl.levelup.productos.dto.CategoriaRequest;
import cl.levelup.productos.dto.CategoriaResponse;
import cl.levelup.productos.exception.CategoriaConProductosException;
import cl.levelup.productos.exception.CategoriaDuplicadaException;
import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<CategoriaResponse> listar() {
        return categoriaRepository.listarResumen().stream()
                .map(c -> new CategoriaResponse(c.getId(), c.getNombre(), c.getCantidad()))
                .toList();
    }

    public CategoriaResponse obtener(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoria no encontrada con id: " + id));
        long cantidad = productoRepository.countByCategoriaIdAndActivoTrue(id);
        return CategoriaResponse.from(categoria, cantidad);
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new CategoriaDuplicadaException(nombre);
        }
        Categoria categoria = categoriaRepository.save(new Categoria(nombre));
        return CategoriaResponse.from(categoria, 0);
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoria no encontrada con id: " + id));
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new CategoriaDuplicadaException(nombre);
        }
        categoria.setNombre(nombre);
        long cantidad = productoRepository.countByCategoriaIdAndActivoTrue(id);
        return CategoriaResponse.from(categoria, cantidad);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoria no encontrada con id: " + id));
        if (productoRepository.existsByCategoriaId(id)) {
            throw new CategoriaConProductosException(id);
        }
        categoriaRepository.delete(categoria);
    }
}
