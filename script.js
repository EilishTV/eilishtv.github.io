// ===============================================
// JS COMPLETO — catálogo -> video.html?id=INDEX
// ===============================================

const url = "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/1";

// ---------------- NUEVO: función YOUTUBE SIN USAR ----------------
// (se agrega porque la pediste, pero NO interfiere en nada)
function getYouTubeId(link) {
  if (!link) return "";
  let id = "";

  // formatos válidos
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const p of patterns) {
    const m = link.match(p);
    if (m) { id = m[1]; break; }
  }

  return id;
}
// -----------------------------------------------------------------

fetch(url)
  .then(r => r.json())
  .then(data => {
    const contenedor = document.getElementById("contenedor");
    if (!contenedor) {
      console.error("No se encontró el elemento #contenedor");
      return;
    }

    // obtener secciones preservando el orden en que aparecen
    const secciones = Array.from(data.reduce((map, item) => {
      if (!map.has(item.seccion)) map.set(item.seccion, item.tituloSeccion || item.seccion);
      return map;
    }, new Map()));

    secciones.forEach(([secKey, tituloSeccion]) => {
      const itemsWithIndex = data
        .map((it, idx) => ({ ...it, _idx: idx }))
        .filter(x => x.seccion === secKey);

      if (itemsWithIndex.length === 0) return;

      const bloque = document.createElement("div");
      bloque.classList.add("recommends");

      bloque.innerHTML = `
        <h4>${tituloSeccion || secKey}</h4>
        <div class="recommendedContent"></div>
      `;

      const contItems = bloque.querySelector(".recommendedContent");

      itemsWithIndex.forEach(item => {
        const cardHTML = `
          <div class="recWrap videoItem">
            <a href="video.html?id=${item._idx}">
              <img src="${item.imagen}" alt="${escapeHtml(item.titulo || "")}">
            </a>
          </div>
        `;
        contItems.innerHTML += cardHTML;
      });

      if (itemsWithIndex.length >= 5 && window.innerWidth >= 769) {
        const leftArrow = document.createElement("div");
        leftArrow.className = "arrow left";
        leftArrow.textContent = "◄";

        const rightArrow = document.createElement("div");
        rightArrow.className = "arrow right";
        rightArrow.textContent = "►";

        bloque.appendChild(leftArrow);
        bloque.appendChild(rightArrow);

        const slide = direction => {
          const tarjetas = contItems.querySelectorAll(".recWrap");
          if (!tarjetas.length) return;

          const gap = parseInt(getComputedStyle(contItems).gap) || 12;
          const ancho = tarjetas[0].offsetWidth + gap;

          contItems.scrollBy({ left: ancho * 4 * direction, behavior: "smooth" });
        };

        leftArrow.addEventListener("click", () => slide(-1));
        rightArrow.addEventListener("click", () => slide(1));
      }

      contenedor.appendChild(bloque);
    });

    function escapeHtml(s) {
      return String(s || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c]));
    }
  })
  .catch(err => {
    console.error("Error al cargar el sheet:", err);
  });
