/* =========================
   IDENTIFY → guardar email
========================= */

const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {

        const email = document.getElementById("emailInput").value.trim();

        if (!email) {
            alert("Ingresá tu email");
            return;
        }

        // 🔥 guardar en localStorage (NO URL)
        localStorage.setItem("signupEmail", email);

        window.location.href = "/identify/signup/";
    });
}


/* =========================
   SIGNUP → mostrar email
========================= */

const userEmail = document.getElementById("userEmail");

if (userEmail) {

    const email = localStorage.getItem("signupEmail");

    if (!email) {
        userEmail.textContent = "No email";
    } else {
        userEmail.textContent = email;
    }

}