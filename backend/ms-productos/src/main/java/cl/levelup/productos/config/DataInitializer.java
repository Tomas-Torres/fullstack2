package cl.levelup.productos.config;

import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Carga el catalogo inicial solo cuando las tablas estan vacias.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public DataInitializer(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (categoriaRepository.count() == 0) {
            List.of("Juegos de Mesa", "Accesorios", "Videojuegos", "Computadores Gamers", "Sillas Gamers", "Mouse")
                    .forEach(nombre -> categoriaRepository.save(new Categoria(nombre)));
            log.info("Categorias iniciales creadas: 6");
        }

        if (productoRepository.count() == 0) {
            producto("Catan", "Juegos de Mesa", "3-4 jugadores", 29990, 0, 10, "/img/catan.png");
            producto("Carcassonne", "Juegos de Mesa", "2-5 jugadores", 24990, 15, 10, "/img/Carcassonne.webp");
            producto("Controlador Xbox Series X", "Accesorios", "Inalámbrico", 59990, 0, 10, "/img/control_xbox.png");
            producto("Audífonos HyperX Cloud II", "Accesorios", "Micrófono desmontable", 79990, 20, 10,
                    "/img/Audífonos_HyperX_Cloud_II.jpg");
            producto("GTA6 (Versión Digital)", "Videojuegos", "Sin lector de discos", 429990, 0, 0, "/img/gta_6.webp");
            producto("PC Gamer ASUS ROG Strix", "Computadores Gamers", "Alto rendimiento", 1299990, 0, 5,
                    "/img/PC_Gamer_ASUS_ROG_Strix.png");
            producto("Silla Gamer Secretlab Titan", "Sillas Gamers", "Soporte ergonómico", 349990, 0, 5,
                    "/img/Silla_Gamer_Secretlab_Titan.webp");
            producto("Mouse Logitech G502 HERO", "Mouse", "Sensor de alta precisión", 49990, 10, 10,
                    "/img/Mouse_Logitech_G502_HERO.png");
            log.info("Productos iniciales creados: 8");
        }
    }

    private void producto(String nombre, String nombreCategoria, String atributo, int precio, int descuento,
                          int stock, String imagen) {
        Categoria categoria = categoriaRepository.findByNombreIgnoreCase(nombreCategoria)
                .orElseThrow(() -> new IllegalStateException("Falta la categoria inicial: " + nombreCategoria));

        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setAtributo(atributo);
        producto.setPrecio(precio);
        producto.setDescuento(descuento);
        producto.setStock(stock);
        producto.setImagen(imagen);
        producto.setActivo(true);
        productoRepository.save(producto);
    }
}
