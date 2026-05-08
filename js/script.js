const globalLoader = document.getElementById("globalLoader");

function showLoader() {
  if (globalLoader) globalLoader.classList.remove("hidden");
}

function hideLoader() {
  if (globalLoader) globalLoader.classList.add("hidden");
}

// ===============================================
// URL HOJA (Verifica que el ID sea correcto)
// ===============================================
const urlHoja1 = "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/1";

// ===============================================
// UTILIDADES
// ===============================================
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function fixImagePath(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return "../" + path.replace(/^\.{0,2}\//, "");
}

function sendClick(id) {
  if (!id) return;
  navigator.sendBeacon(
    "https://script.google.com/macros/s/AKfycbyWl7csc047mwaAPRNFBoIC9DhODMOVt5ukgtU5SfRqsMF7kARPAVL-mdehydMj9od5/exec",
    JSON.stringify({ id })
  );
}

// ===============================================
// WATCH
// ===============================================
function goToWatch(id) {
  window.location.href = `/browse/watch/index.html?id=${id}`;
}

// ===============================================
// CARGAR CATÁLOGO
// ===============================================
showLoader();

fetch(urlHoja1)
  .then(r => r.json())
  .then(data => {
    // Debug: Ver si llegan datos (puedes borrarlo después)
    console.log("Datos recibidos de la hoja:", data);

    const contenedor = document.getElementById("contenedor");
    if (!contenedor) {
      console.error("Error: No se encontró el elemento #contenedor en el HTML");
      hideLoader();
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("La hoja de cálculo parece estar vacía.");
      hideLoader();
      return;
    }

    const seccionesMap = new Map();

    data.forEach((item, idx) => {
      // Usamos el nombre de la columna "seccion" exactamente como esté en el Excel
      const key = item.seccion?.toLowerCase() || "sinseccion";

      if (!seccionesMap.has(key)) {
        seccionesMap.set(key, {
          titulo: item.tituloSeccion || item.seccion || "Sin Título",
          firstIdx: idx
        });
      }
    });

    const secciones = Array.from(seccionesMap.entries())
      .sort((a, b) => a[1].firstIdx - b[1].firstIdx);

    secciones.forEach(([secKey, info]) => {
      const items = data.filter(
        x => (x.seccion?.toLowerCase() || "sinseccion") === secKey
      );

      if (!items.length) return;

      const bloque = document.createElement("div");
      bloque.className = "recommends";

      bloque.innerHTML = `
        <div class="sectionHeader">
          <h4>${escapeHtml(info.titulo)}</h4>
          <a href="genre/?seccion=${encodeURIComponent(secKey)}" class="verMas">
            <i class="fas fa-chevron-right"></i>
          </a>
        </div>
        <div class="carouselWrapper">
          <div class="recommendedContent"></div>
        </div>
      `;

      const contItems = bloque.querySelector(".recommendedContent");

      // ===============================================
      // CARDS
      // ===============================================
      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "recWrap videoItem";

        card.innerHTML = `
          <div class="cardImage">
            <img src="${fixImagePath(item.imagen)}" alt="${escapeHtml(item.alt || "")}">
          </div>
        `;

        card.addEventListener("click", () => {
          sendClick(item.id);
          goToWatch(item.id);
        });

        contItems.appendChild(card);
      });

      // ===============================================
      // FLECHAS + ANIMACIÓN
      // ===============================================
      if (items.length >= 5 && window.innerWidth >= 769) {
        const leftArrow = document.createElement("div");
        leftArrow.className = "arrow left";
        leftArrow.innerHTML = '<i class="fa-solid fa-angle-left"></i>';

        const rightArrow = document.createElement("div");
        rightArrow.className = "arrow right";
        rightArrow.innerHTML = '<i class="fa-solid fa-angle-right"></i>';

        bloque.appendChild(leftArrow);
        bloque.appendChild(rightArrow);

        const slide = (dir) => {
          const tarjetas = contItems.querySelectorAll(".recWrap");
          if (!tarjetas.length) return;

          const gap = parseInt(getComputedStyle(contItems).gap) || 12;
          const ancho = tarjetas[0].offsetWidth + gap;
          const cardsToMove = 4;

          const start = contItems.scrollLeft;
          const end = start + (ancho * cardsToMove * dir);
          const duration = 750;
          let startTime = null;

          const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Easing out cubic

            contItems.scrollLeft = start + (end - start) * ease;

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        };

        leftArrow.addEventListener("click", e => {
          e.stopPropagation();
          slide(-1);
        });

        rightArrow.addEventListener("click", e => {
          e.stopPropagation();
          slide(1);
        });
      }

      contenedor.appendChild(bloque);
    });

    hideLoader();
  })
  .catch(err => {
    console.error("Error crítico cargando el catálogo:", err);
    hideLoader();
  });