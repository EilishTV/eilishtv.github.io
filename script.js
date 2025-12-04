const url = "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/1";

fetch(url)
  .then(r => r.json())
  .then(data => {
    const contenedor = document.getElementById("contenedor");
    const secciones = [...new Set(data.map(item => item.seccion))];

    secciones.forEach(sec => {
      const items = data.filter(i => i.seccion === sec);
      const titulo = items[0].tituloSeccion;

      const bloque = document.createElement("div");
      bloque.classList.add("recommends");

      bloque.innerHTML = `
        <h4>${titulo}</h4>
        <div class="recommendedContent"></div>
      `;

      const contItems = bloque.querySelector(".recommendedContent");

      items.forEach(item => {
        contItems.innerHTML += `
          <div class="recWrap">
            <a href="${item.link}" target="_blank">
              <img src="${item.imagen}" alt="">
            </a>
          </div>
        `;
      });

      // flechas solo en PC si hay 5 o más
      if (items.length >= 5 && window.innerWidth >= 769) {
        const leftArrow = document.createElement('div');
        leftArrow.className = 'arrow left';
        leftArrow.textContent = '◄';

        const rightArrow = document.createElement('div');
        rightArrow.className = 'arrow right';
        rightArrow.textContent = '►';

        bloque.appendChild(leftArrow);
        bloque.appendChild(rightArrow);

        const slide = (direction) => {
            const tarjetas = contItems.querySelectorAll('.recWrap');
            const gap = parseInt(getComputedStyle(contItems).gap);
            const ancho = tarjetas[0].offsetWidth + gap;
            contItems.scrollBy({ left: ancho * 4 * direction, behavior: 'smooth' });
        }

        leftArrow.addEventListener('click', () => slide(-1));
        rightArrow.addEventListener('click', () => slide(1));
      }

      contenedor.appendChild(bloque);
    });
  });
