const globalLoader = document.getElementById("globalLoader");

function showLoader() {
  if (globalLoader) globalLoader.classList.remove("hidden");
}

function hideLoader() {
  if (globalLoader) globalLoader.classList.add("hidden");
}

// ===============================================
// CONTENEDORES
// ===============================================

const trendingContainer =
  document.getElementById("trending");

const contenedor =
  document.getElementById("contenedor");

// ===============================================
// URLS
// ===============================================

const urlHoja1 =
  "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/Hoja1";

const urlClicks =
  "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/Clicks";

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

  window.location.href =
    `/browse/watch/index.html?id=${id}`;
}

// ===============================================
// CARGAR TODO
// ===============================================

showLoader();

Promise.all([

  fetch(urlHoja1).then(r => r.json()),

  fetch(urlClicks).then(r => r.json())

])

.then(([data, clicksData]) => {

  console.log("CATALOGO:", data);

  console.log("CLICKS:", clicksData);

  if (!Array.isArray(data) || !data.length) {

    console.error("Hoja1 vacía");

    hideLoader();

    return;
  }

  // ===============================================
  // MAPA CLICKS
  // ===============================================

  const clicksMap = new Map();

  clicksData.forEach(item => {

    const id =
      String(
        item.id ||
        item.ID ||
        Object.values(item)[0] ||
        ""
      ).trim();

    const clicks =
      Number(
        item.clicks ||
        item.Clicks ||
        Object.values(item)[1] ||
        0
      );

    clicksMap.set(id, clicks);
  });

  // ===============================================
// TOP 10 EN TENDENCIA
// ===============================================

const topContainer = document.getElementById("trending");

if (topContainer) {

  // =============================================
  // SACAR SOLO IDS ÚNICOS
  // =============================================

  const idsUsados = new Set();

  const top10Items = [...clicksData]

    .filter(item => Number(item.clicks || 0) > 0)

    .sort((a, b) =>
      Number(b.clicks || 0) -
      Number(a.clicks || 0)
    )

    .filter(item => {

      const id = String(item.id || "").trim();

      // si ya existe no lo agrega
      if (idsUsados.has(id)) {
        return false;
      }

      idsUsados.add(id);

      return true;
    })

    .slice(0, 10)

    .map(clickItem => {

      const id = String(clickItem.id || "").trim();

      // busca SOLO el primer match en Hoja1
      return data.find(x =>
        String(x.id || "").trim() === id
      );

    })

    .filter(Boolean);

  // =============================================
  // CREAR BLOQUE
  // =============================================

  if (top10Items.length) {

    const topBlock = document.createElement("div");

    topBlock.className = "recommends";

    topBlock.innerHTML = `
      <div class="sectionHeader">
        <h4>En tendencias ahora mismo</h4>
      </div>

      <div class="carouselWrapper">
        <div class="recommendedContent top10Row"></div>
      </div>
    `;

    const topRow =
      topBlock.querySelector(".top10Row");

    // =============================================
    // ITEMS
    // =============================================

    top10Items.forEach((item, index) => {

      const position = index + 1;

      const card = document.createElement("div");

      card.className =
        position === 10
          ? "top10Item ten"
          : "top10Item";

      card.innerHTML = `
        <div class="topRank ${position === 10 ? "double" : ""}">
          ${position}
        </div>

        <div class="topCard">

          <img
            src="${fixImagePath(item.imagen)}"
            alt="${escapeHtml(item.alt || "")}"
          >

        </div>
      `;

      card.addEventListener("click", () => {

        sendClick(item.id);

        goToWatch(item.id);

      });

      topRow.appendChild(card);
    });

    // =============================================
    // FLECHAS
    // =============================================

    if (
      top10Items.length >= 5 &&
      window.innerWidth >= 769
    ) {

      const leftArrow =
        document.createElement("div");

      leftArrow.className = "arrow left";

      leftArrow.innerHTML =
        '<i class="fa-solid fa-angle-left"></i>';

      const rightArrow =
        document.createElement("div");

      rightArrow.className = "arrow right";

      rightArrow.innerHTML =
        '<i class="fa-solid fa-angle-right"></i>';

      topBlock.appendChild(leftArrow);
      topBlock.appendChild(rightArrow);

      const slide = (dir) => {

        const tarjetas =
          topRow.querySelectorAll(".top10Item");

        if (!tarjetas.length) return;

        const gap =
          parseInt(getComputedStyle(topRow).gap) || 34;

        const ancho =
          tarjetas[0].offsetWidth + gap;

        const cardsToMove = 3;

        const start = topRow.scrollLeft;

        const end =
          start + (ancho * cardsToMove * dir);

        const duration = 750;

        let startTime = null;

        const animate = (time) => {

          if (!startTime) startTime = time;

          const progress =
            Math.min(
              (time - startTime) / duration,
              1
            );

          const ease =
            1 - Math.pow(1 - progress, 3);

          topRow.scrollLeft =
            start + (end - start) * ease;

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

    topContainer.appendChild(topBlock);
  }
}
  // ===============================================
  // SECCIONES NORMALES
  // ===============================================

  if (!contenedor) {

    console.error("No existe #contenedor");

    hideLoader();

    return;
  }

  const seccionesMap = new Map();

  data.forEach((item, idx) => {

    const key =
      item.seccion?.toLowerCase() ||
      "sinseccion";

    if (!seccionesMap.has(key)) {

      seccionesMap.set(key, {

        titulo:
          item.tituloSeccion ||
          item.seccion ||
          "Sin Título",

        firstIdx: idx
      });
    }
  });

  const secciones =
    Array.from(seccionesMap.entries())

    .sort((a, b) =>
      a[1].firstIdx - b[1].firstIdx
    );

  secciones.forEach(([secKey, info]) => {

    const items = data.filter(
      x =>
        (
          x.seccion?.toLowerCase() ||
          "sinseccion"
        ) === secKey
    );

    if (!items.length) return;

    const bloque =
      document.createElement("div");

    bloque.className = "recommends";

    bloque.innerHTML = `

      <div class="sectionHeader">

        <h4>${escapeHtml(info.titulo)}</h4>

        <a
          href="genre/?seccion=${encodeURIComponent(secKey)}"
          class="verMas"
        >

          <i class="fas fa-chevron-right"></i>

        </a>

      </div>

      <div class="carouselWrapper">

        <div class="recommendedContent"></div>

      </div>
    `;

    const contItems =
      bloque.querySelector(".recommendedContent");

    // ===========================================
    // CARDS
    // ===========================================

    items.forEach(item => {

      const card =
        document.createElement("div");

      card.className =
        "recWrap videoItem";

      card.innerHTML = `

        <div class="cardImage">

          <img
            src="${fixImagePath(item.imagen)}"
            alt="${escapeHtml(item.alt || "")}"
          >

        </div>
      `;

      card.addEventListener("click", () => {

        sendClick(item.id);

        goToWatch(item.id);
      });

      contItems.appendChild(card);
    });

    // ===========================================
    // FLECHAS
    // ===========================================

    if (
      items.length >= 5 &&
      window.innerWidth >= 769
    ) {

      const leftArrow =
        document.createElement("div");

      leftArrow.className = "arrow left";

      leftArrow.innerHTML =
        '<i class="fa-solid fa-angle-left"></i>';

      const rightArrow =
        document.createElement("div");

      rightArrow.className = "arrow right";

      rightArrow.innerHTML =
        '<i class="fa-solid fa-angle-right"></i>';

      bloque.appendChild(leftArrow);

      bloque.appendChild(rightArrow);

      const slide = (dir) => {

        const tarjetas =
          contItems.querySelectorAll(".recWrap");

        if (!tarjetas.length) return;

        const gap =
          parseInt(
            getComputedStyle(contItems).gap
          ) || 12;

        const ancho =
          tarjetas[0].offsetWidth + gap;

        const cardsToMove = 4;

        const start =
          contItems.scrollLeft;

        const end =
          start + (ancho * cardsToMove * dir);

        const duration = 750;

        let startTime = null;

        const animate = (time) => {

          if (!startTime)
            startTime = time;

          const progress =
            Math.min(
              (time - startTime) / duration,
              1
            );

          const ease =
            1 - Math.pow(1 - progress, 3);

          contItems.scrollLeft =
            start + (end - start) * ease;

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

  console.error(
    "Error crítico cargando catálogo:",
    err
  );

  hideLoader();
});