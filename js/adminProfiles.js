document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("profilesContainer");
  const addBtn = document.getElementById("addProfile");

  let profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  function saveProfiles() {
    localStorage.setItem("profiles", JSON.stringify(profiles));
  }

  function renderProfiles() {
    container.innerHTML = "";
    profiles.forEach((profile, index) => {
      const card = document.createElement("div");
      card.className = "profileCard";

      card.innerHTML = `
        <img src="${profile.avatar || '../images/avatars/avatar1.jpeg'}" alt="Avatar">
        <span>${profile.name}</span>
        <button class="editBtn">✎</button>
      `;

      // Editar perfil
      const editBtn = card.querySelector(".editBtn");
      editBtn.addEventListener("click", () => {
        const newName = prompt("Editar nombre del perfil:", profile.name);
        if (newName) profile.name = newName;

        const newAvatar = prompt("URL del avatar (dejar vacío para no cambiar):", profile.avatar || "");
        if (newAvatar !== null) profile.avatar = newAvatar;

        saveProfiles();
        renderProfiles();
      });

      container.appendChild(card);
    });

    addBtn.style.display = profiles.length >= 5 ? "none" : "block";
  }

  // Agregar nuevo perfil
  addBtn.addEventListener("click", () => {
    if (profiles.length >= 5) {
      alert("Máximo 5 perfiles");
      return;
    }

    const name = prompt("Nombre del perfil:");
    if (!name) return;

    profiles.push({
      name,
      avatar: "" // se puede cambiar después
    });

    saveProfiles();
    renderProfiles();
  });

  renderProfiles();
});
