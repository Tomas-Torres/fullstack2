import "@testing-library/jest-dom";

// Configuración global: se ejecuta antes de cada archivo de pruebas.
// beforeEach, afterEach y vi están disponibles porque vite.config.js usa globals: true.

beforeEach(() => {
  // Cada prueba parte con localStorage vacío, para que no dependan unas de otras
  localStorage.clear();
  // jsdom no implementa scrollTo (el panel admin lo usa al editar un producto)
  window.scrollTo = vi.fn();
});

afterEach(() => {
  // Restaura alert, confirm y cualquier otro espía creado con vi.spyOn
  vi.restoreAllMocks();
});
