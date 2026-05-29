import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth } from "../../js/auth.js";

const db = getFirestore();

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const globalLoader =
document.getElementById("globalLoader");

function hideLoader(){
  globalLoader.classList.add("hidden");
}

/* URLS */

const urlBaseID =
"https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/BaseID";

const urlEpisodes =
"https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/Episodes";

/* FETCH */

Promise.all([
  fetch(urlBaseID).then(r => r.json()),
  fetch(urlEpisodes).then(r => r.json())
])

.then(([baseData, episodesData]) => {

  const itemBase =
  baseData.find(
    x => String(x.id).trim() === String(id).trim()
  );

  if(!itemBase){
    hideLoader();
    return;
  }

  /* TITLE */

  document.title = itemBase.alt || "Series";

  /* BG */

  const hero =
  document.getElementById("hero");

  const bg =
  `url(${itemBase["background-image"]})`;

  function applyBackground(){

    hero.style.setProperty("--bg-img", bg);

    if(window.innerWidth <= 768){

      hero.style.backgroundImage = "none";

    }else{

      hero.style.backgroundImage = bg;
    }
  }

  applyBackground();

  window.addEventListener(
    "resize",
    applyBackground
  );

  /* CONTENT */

  const logo =
  document.getElementById("logo");

  logo.src = itemBase.logo || "";

  document.getElementById("year").textContent =
  itemBase.year || "";

  document.getElementById("desc").textContent =
  itemBase.description || "";

  const tagsContainer =
  document.getElementById("tags");

  if(itemBase.genres){

    itemBase.genres
    .split(",")

    .forEach(tag => {

      const span =
      document.createElement("span");

      span.className = "tag";

      span.textContent =
      tag.trim();

      tagsContainer.appendChild(span);

    });
  }

  /* EPISODES */

  const serieEpisodes =
  episodesData.filter(
    ep =>
    String(ep.id).trim() === String(id).trim()
  );

  const seasons =
  [...new Set(
    serieEpisodes.map(
      ep => ep.season
    )
  )];

  const seasonSelector =
  document.getElementById("seasonSelector");

  seasons.forEach(season => {

    const option =
    document.createElement("option");

    option.value = season;

    option.textContent =
    `Temporada ${season}`;

    seasonSelector.appendChild(option);

  });

  const episodesList =
  document.getElementById("episodesList");

  function renderEpisodes(season){

    episodesList.innerHTML = "";

    const filtered =
    serieEpisodes.filter(
      ep => String(ep.season) === String(season)
    );

    filtered.sort(
      (a,b) =>
      Number(a.episode) -
      Number(b.episode)
    );

    filtered.forEach(ep => {

      const card =
      document.createElement("div");

      card.className =
      "episodeCard";

card.innerHTML = `

  <div class="episodeImageWrap">

    <img
      class="episodeImage"
      src="${ep.image || ''}"
      alt="${ep.title || ''}"
    >

  </div>

  <div class="episodeContent">

    <div class="episodeNumber">
      Episodio ${ep.episode}
    </div>

    <div class="episodeTitle">
      ${ep.title || "Sin título"}
    </div>

    <div class="episodeDesc">
      ${ep.description || ""}
    </div>

  </div>

`;

      card.onclick = () => {

        window.location.href =
        `/browse/video.html?id=${id}&season=${ep.season}&episode=${ep.episode}`;
      };

      episodesList.appendChild(card);

    });
  }

  renderEpisodes(seasons[0]);

  seasonSelector.onchange = () => {

    renderEpisodes(
      seasonSelector.value
    );
  };

  /* PLAY BUTTON */

  document.getElementById("playBtn").onclick = () => {

    const firstEpisode =
    serieEpisodes.find(
      ep =>
      String(ep.season) ===
      String(seasonSelector.value)
    );

    if(!firstEpisode) return;

    window.location.href =
    `/browse/video.html?id=${id}&season=${firstEpisode.season}&episode=${firstEpisode.episode}`;
  };

  /* MY LIST */

  const listBtn =
  document.querySelector(".myListBtn");

  auth.onAuthStateChanged(
    async (user) => {

      if(!user){

        listBtn.onclick = () => {
          alert("Debes iniciar sesión.");
        };

        return;
      }

      const listDocRef =
      doc(
        db,
        "users",
        user.uid,
        "myList",
        id
      );

      const checkDoc =
      await getDoc(listDocRef);

      let isAdded =
      checkDoc.exists();

      function updateBtnUI(added){

        if(added){

          listBtn.innerHTML =
          `<i class="fa-solid fa-check"></i> En mi Lista`;

        }else{

          listBtn.innerHTML =
          `<i class="fa-solid fa-plus"></i> Mi Lista`;
        }
      }

      updateBtnUI(isAdded);

      listBtn.onclick =
      async () => {

        if(isAdded){

          await deleteDoc(listDocRef);

          isAdded = false;

        }else{

          await setDoc(listDocRef, {

            id:id,

            titulo:
            itemBase.alt || "Sin título",

            imagen:
            itemBase["background-image"] || ""

          });

          isAdded = true;
        }

        updateBtnUI(isAdded);
      };
    });

  logo.onload = hideLoader;
  logo.onerror = hideLoader;

})

.catch(err => {

  console.error(err);

  hideLoader();

});