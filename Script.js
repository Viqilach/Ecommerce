/* DATOS — ARRAY DE PRODUCTOS. Cada producto tiene: id, nombre, categoria, precio, imagen y descripción. */
const PRODUCTOS = [
  { id: 1, nombre: "Vela Lavanda & Vainilla", categoria: "velas", precio: 18.90, img: "vela-lavanda.png", desc: "Soja 100% pura. Aroma floral y dulce. 40h de combustión." },
  { id: 2, nombre: "Vela Cedro & Ámbar", categoria: "velas", precio: 21.50, img: "vela-cedro.png", desc: "Notas amaderadas y cálidas. Perfecta para el invierno." },
  { id: 3, nombre: "Vela Eucalipto & Menta", categoria: "velas", precio: 16.75, img: "vela-eucalipto.png", desc: "Fresca y revitalizante. Ideal para espacios de trabajo." },
  { id: 4, nombre: "Vela Rosa & Pachulí", categoria: "velas", precio: 19.95, img: "vela-rosa.png", desc: "Romántica y envolvente. Tierra y flores en equilibrio." },
  { id: 5, nombre: "Difusor Bergamota", categoria: "difusores", precio: 27.00, img: "difusor-bergamota.png", desc: "Difusor de varillas con aceite esencial de bergamota, 200ml." },
  { id: 6, nombre: "Difusor Sándalo & Neroli", categoria: "difusores", precio: 32.50, img: "difusor-sandalo.png", desc: "Elegante y sofisticado. Duración de 3 a 4 meses." },
  { id: 7, nombre: "Difusor Limón & Jengibre", categoria: "difusores", precio: 24.90, img: "difusor-limon.png", desc: "Energizante y fresco. Empieza el día con vitalidad." },
  { id: 8, nombre: "Incienso Nag Champa", categoria: "incienso", precio: 8.50, img: "incienso-nagchampa.png", desc: "20 varillas artesanales. Aroma sagrado y meditativo." },
  { id: 9, nombre: "Incienso Jazmín", categoria: "incienso", precio: 7.90, img: "incienso-jazmin.png", desc: "Floral y suave. Ideal para yoga y meditación." },
  { id: 10, nombre: "Incienso Mirra & Resina", categoria: "incienso", precio: 11.20, img: "incienso-mirra.png", desc: "Aroma intenso y purificador. 15 varillas premium." },
  { id: 11, nombre: "Kit Relax Esencial", categoria: "kits", precio: 42.00, img: "kit-relax.png", desc: "Vela lavanda + difusor bergamota + incienso jazmín." },
  { id: 12, nombre: "Kit Hogar Cálido", categoria: "kits", precio: 55.90, img: "kit-hogar.png", desc: "Vela cedro + difusor sándalo + jabón artesanal." },
];

/* ESTADO DE LA APP */
let carrito = []; // array de IDs de productos añadidos
let categoriaActiva = "todas"; // categoría activa en los filtros
let ordenActual = "default"; // criterio de ordenación

/* GESTIÓN DEL CARRITO. Recibe el id de un producto y lo guarda en el array. */
function añadirAlCarrito(id) {
  // Si no hay sesión activa, pedimos login primero
  if (!sessionStorage.getItem('usuarioNombre')) {
    mostrarToast("Inicia sesión para añadir productos 🔒");
    abrirSesionModal();
    return;
  }
  carrito.push(id);
  actualizarContadorCarrito();
  mostrarToast("¡Producto añadido al carrito! ✓");
}

// Elimina una sola unidad del producto (la última aparición del id)
function eliminarDelCarrito(id) {
  const idx = carrito.lastIndexOf(Number(id));
  if (idx !== -1) carrito.splice(idx, 1);
  actualizarContadorCarrito();
  renderCarrito();
}

// Actualiza el badge con el total de productos
function actualizarContadorCarrito() {
  const badge = document.getElementById("cartCount");
  badge.textContent = carrito.length;
  badge.classList.toggle("visible", carrito.length > 0);
}

/* CÁLCULO DEL TOTAL. Suma todos los precios y calcula el envío. */
function calcularTotal() {
  // reduce() acumula la suma de precios de todos los ids del carrito
  const subtotal = carrito.reduce((acumulado, id) => {
    const producto = PRODUCTOS.find(p => p.id === id);
    return producto ? acumulado + producto.precio : acumulado;
  }, 0);

  // Envío gratis a partir de 40€, si no 4,95€
  const envio = subtotal === 0 ? 0 : subtotal >= 40 ? 0 : 4.95;
  const total = subtotal + envio;

  return { subtotal, envio, total };
}

/* FILTRAR POR CATEGORÍA */
function filtrarPorCategoria(productos, categoria) {
  if (categoria === "todas") return productos;
  return productos.filter(p => p.categoria === categoria);
}

/* ORDENAR PRODUCTOS. Usa Array.sort() de menor a mayor precio (o inverso). */
function ordenarProductos(productos, orden) {
  const copia = [...productos]; // copia para no mutar el array original
  if (orden === "asc")  return copia.sort((a, b) => a.precio - b.precio);
  if (orden === "desc") return copia.sort((a, b) => b.precio - a.precio);
  return copia;
}

/* RENDER DE PRODUCTOS. Genera el HTML de las tarjetas y lo inyecta en el grid. Cada tarjeta usa <img> con la imagen del producto. */
function renderProductos() {
  const grid = document.getElementById("productsGrid");
  let lista = filtrarPorCategoria(PRODUCTOS, categoriaActiva);
  lista = ordenarProductos(lista, ordenActual);

  grid.innerHTML = lista.map(prod => `
    <article class="product-card">
      <div class="product-img-wrap">
        <!-- Imagen generada con IA, mismo nombre que en el objeto del array -->
        <img src="${prod.img}" alt="${prod.nombre}" />
        <span class="product-tag">${prod.categoria}</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${prod.nombre}</h3>
        <p class="product-desc">${prod.desc}</p>
        <div class="product-footer">
          <span class="product-price">${prod.precio.toFixed(2).replace(".", ",")} €</span>
          <button class="btn-add" onclick="añadirAlCarrito(${prod.id})">+ Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* RENDER DEL CARRITO */
function renderCarrito() {
  const contenedor = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");

  if (carrito.length === 0) {
    contenedor.innerHTML = `<p class="cart-empty">Tu carrito está vacío 🕯️</p>`;
    footer.style.display = "none";
    return;
  }

  // Agrupamos los ids repetidos para mostrar cantidad
  const agrupado = carrito.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  contenedor.innerHTML = Object.entries(agrupado).map(([id, qty]) => {
    const prod = PRODUCTOS.find(p => p.id === Number(id));
    if (!prod) return "";
    return `
      <div class="cart-item">
        <span class="cart-item-emoji">🕯️</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${prod.nombre}${qty > 1 ? ` ×${qty}` : ""}</div>
          <div class="cart-item-price">${(prod.precio * qty).toFixed(2).replace(".", ",")} €</div>
        </div>
        <button class="btn-remove" onclick="eliminarDelCarrito(${id})" title="Quitar">✕</button>
      </div>
    `;
  }).join("");

  // Actualizamos el resumen de precios
  const { subtotal, envio, total } = calcularTotal();
  document.getElementById("subtotalVal").textContent = `${subtotal.toFixed(2).replace(".", ",")} €`;
  document.getElementById("shippingVal").textContent = envio === 0 ? "Gratis 🎉" : `${envio.toFixed(2).replace(".", ",")} €`;
  document.getElementById("totalVal").textContent = `${total.toFixed(2).replace(".", ",")} €`;

  footer.style.display = "flex";
}

/* TOAST */
let toastTimer = null;
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* SESIÓN DE USUARIO — sessionStorage */
function abrirSesionModal() {
  document.getElementById("sessionOverlay").classList.add("open");
  setTimeout(() => document.getElementById("inputEmail").focus(), 100);
}

function cerrarSesionModal() {
  document.getElementById("sessionOverlay").classList.remove("open");
  document.getElementById("inputEmail").value = "";
  document.getElementById("inputPass").value = "";
}

function iniciarSesion() {
  const email = document.getElementById("inputEmail").value.trim();
  const pass  = document.getElementById("inputPass").value.trim();

  if (!email || !pass) {
    mostrarToast("Rellena todos los campos ✦");
    return;
  }

  const nombre = email.split("@")[0];

  // Guardamos en sessionStorage (solo acepta strings)
  sessionStorage.setItem('usuarioNombre', nombre);
  sessionStorage.setItem('usuarioEmail', email);

  cerrarSesionModal();
  actualizarBotonSesion();
  mostrarToast(`¡Bienvenida, ${nombre}! 🕯️`);
}

function cerrarSesion() {
  // Eliminamos los datos del sessionStorage
  sessionStorage.removeItem('usuarioNombre');
  sessionStorage.removeItem('usuarioEmail');
  // Vaciamos el carrito al cerrar sesión
  carrito = [];
  actualizarContadorCarrito();
  actualizarBotonSesion();
  mostrarToast("Sesión cerrada. ¡Hasta pronto!");
}

// Actualiza el botón según si hay sesión activa o no
function actualizarBotonSesion() {
  const btn = document.getElementById("btnSession");
  const nombreGuardado = sessionStorage.getItem('usuarioNombre');
  if (nombreGuardado) {
    btn.textContent = `${nombreGuardado} · Salir`;
    btn.classList.add("logged");
  } else {
    btn.textContent = "Iniciar sesión";
    btn.classList.remove("logged");
  }
}

/* DROPDOWN DE COLECCIONES. Abre/cierra el menú y al hacer clic en una opción filtra los productos y baja al grid con scroll. */
function toggleDropdown() {
  document.getElementById("navDropdown").classList.toggle("open");
}

function cerrarDropdown() {
  document.getElementById("navDropdown").classList.remove("open");
}

/* MODAL NOSOTRAS */
function abrirNosotras() {
  document.getElementById("nosotrasOverlay").classList.add("open");
}

function cerrarNosotras() {
  document.getElementById("nosotrasOverlay").classList.remove("open");
}

/* EVENTOS */

// --- Carrito ---
document.getElementById("btnCart").addEventListener("click", () => {
  // Si no hay sesión activa, no se puede abrir el carrito
  if (!sessionStorage.getItem('usuarioNombre')) {
    mostrarToast("Inicia sesión para ver tu carrito 🔒");
    abrirSesionModal();
    return;
  }
  renderCarrito();
  document.getElementById("cartOverlay").classList.add("open");
});
document.getElementById("cartOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget)
    document.getElementById("cartOverlay").classList.remove("open");
});
document.getElementById("btnCloseCart").addEventListener("click", () => {
  document.getElementById("cartOverlay").classList.remove("open");
});

// --- Sesión ---
document.getElementById("btnSession").addEventListener("click", () => {
  if (sessionStorage.getItem('usuarioNombre')) cerrarSesion();
  else abrirSesionModal();
});
document.getElementById("btnLogin").addEventListener("click", iniciarSesion);
document.getElementById("btnCancelSession").addEventListener("click", cerrarSesionModal);
document.getElementById("inputPass").addEventListener("keydown", e => {
  if (e.key === "Enter") iniciarSesion();
});

// --- Dropdown Colecciones ---
document.getElementById("btnColecciones").addEventListener("click", e => {
  e.stopPropagation(); // evita que el clic se propague al document y lo cierre
  toggleDropdown();
});

// Cada opción del dropdown filtra y baja al grid
document.getElementById("dropdownMenu").addEventListener("click", e => {
  const item = e.target.closest(".dropdown-item");
  if (!item) return;

  const cat = item.dataset.cat;
  categoriaActiva = cat;

  // Marcamos el filtro correspondiente como activo
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  const tabCorrespondiente = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
  if (tabCorrespondiente) tabCorrespondiente.classList.add("active");

  renderProductos();
  cerrarDropdown();

  // Scroll suave hasta la sección de tienda
  document.getElementById("tienda").scrollIntoView({ behavior: "smooth" });
});

// Cerrar el dropdown al hacer clic fuera de él
document.addEventListener("click", e => {
  if (!document.getElementById("navDropdown").contains(e.target)) {
    cerrarDropdown();
  }
});

// --- Menú hamburguesa (móvil) ---
document.getElementById("btnHamburger").addEventListener("click", () => {
  const menu = document.getElementById("mobileMenu");
  const btn = document.getElementById("btnHamburger");
  menu.classList.toggle("open");
  btn.classList.toggle("open"); // anima las líneas en X
});

// Tienda desde menú móvil: resetea filtros y cierra el menú
document.getElementById("mobileTienda").addEventListener("click", () => {
  categoriaActiva = "todas";
  ordenActual = "default";
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  document.querySelector('.filter-tab[data-cat="todas"]').classList.add("active");
  document.getElementById("sortSelect").value = "default";
  renderProductos();
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("btnHamburger").classList.remove("open");
});

// Opciones de colección desde menú móvil
document.getElementById("mobileMenu").addEventListener("click", e => {
  const link = e.target.closest(".mobile-link[data-cat]");
  if (!link) return;
  const cat = link.dataset.cat;
  categoriaActiva = cat;
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  const tab = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
  if (tab) tab.classList.add("active");
  renderProductos();
  document.getElementById("tienda").scrollIntoView({ behavior: "smooth" });
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("btnHamburger").classList.remove("open");
});

// Nosotras desde menú móvil
document.getElementById("mobileNosotras").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("btnHamburger").classList.remove("open");
  abrirNosotras();
});
document.getElementById("btnNosotras").addEventListener("click", abrirNosotras);
document.getElementById("btnCloseNosotras").addEventListener("click", cerrarNosotras);
// Cerrar al hacer clic en el fondo oscuro
document.getElementById("nosotrasOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) cerrarNosotras();
});

// --- Tienda: resetea filtro a "todas" al hacer clic ---
document.querySelector('nav a[href="#tienda"]').addEventListener("click", () => {
  categoriaActiva = "todas";
  ordenActual = "default";
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  document.querySelector('.filter-tab[data-cat="todas"]').classList.add("active");
  document.getElementById("sortSelect").value = "default";
  renderProductos();
});
document.getElementById("filterTabs").addEventListener("click", e => {
  const tab = e.target.closest(".filter-tab");
  if (!tab) return;
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  categoriaActiva = tab.dataset.cat;
  renderProductos();
});

// --- Ordenar ---
document.getElementById("sortSelect").addEventListener("change", e => {
  ordenActual = e.target.value;
  renderProductos();
});

/* INICIO */
// Recuperamos la sesión guardada si la había
actualizarBotonSesion();

// Pintamos los productos por primera vez
renderProductos();