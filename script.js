document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     VERIFICACIÓN DE EDAD + INICIO DE MÚSICA
  ============================================================ */
  const overlay = document.getElementById("age-overlay");
  const btnYes = document.getElementById("btn-age-yes");
  const btnNo = document.getElementById("btn-age-no");
  const music = document.getElementById("bg-music");
  const volumeSlider = document.getElementById("volumeSlider");

  const cookieBanner = document.getElementById("cookie-banner");
  const cookieAccept = document.getElementById("cookie-accept");
  const cookieDecline = document.getElementById("cookie-decline");

  // LOGIN
  const loginOverlay = document.getElementById("login-overlay");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSubmit = document.getElementById("login-submit");
  const loginUser = document.getElementById("login-user");

  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const paymentInput = document.getElementById("payment-input");

  /* ============================================================
     MOSTRAR VERIFICACIÓN DE EDAD SOLO LA PRIMERA VEZ
  ============================================================ */
  const ageVerified = localStorage.getItem("ageVerified");

  if (!ageVerified) {
    overlay.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      overlay.style.display = "none";
      document.body.classList.remove("modal-open");

      localStorage.setItem("ageVerified", "yes");

      // Mostrar cookies si no se aceptaron antes
      if (!localStorage.getItem("cookiesAccepted")) {
        cookieBanner.style.display = "block";
      }

      // Iniciar música
      if (music) {
        music.volume = volumeSlider ? volumeSlider.value : 0.5;
        music.play().catch(() => {});
      }
    });
  }

  if (btnNo) {
    btnNo.addEventListener("click", () => {
      window.location.href = "https://es.wikipedia.org/wiki/Felis_silvestris_catus";
    });
  }

  /* ============================================================
     COOKIES
  ============================================================ */
  if (cookieAccept) {
    cookieAccept.addEventListener("click", () => {
      localStorage.setItem("cookiesAccepted", "yes");
      cookieBanner.style.display = "none";
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener("click", () => {
      cookieBanner.style.display = "none";
    });
  }

  /* ============================================================
     LOGIN
  ============================================================ */

  // Si ya hay usuario guardado → mostrarlo
  const savedUser = localStorage.getItem("loggedUser");
  if (savedUser) {
    loginUser.textContent = "Bienvenido, " + savedUser;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  }

  // Abrir login
  loginBtn.addEventListener("click", () => {
    loginOverlay.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  // Enviar login
  loginSubmit.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const payment = paymentInput.value;

    if (username.length < 3 || password.length < 3) {
      alert("Usuario y contraseña deben tener al menos 3 caracteres.");
      return;
    }

    // Guardar datos
    localStorage.setItem("loggedUser", username);
    localStorage.setItem("loggedPayment", payment);

    loginUser.textContent = "Bienvenido, " + username;

    loginOverlay.style.display = "none";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    document.body.classList.remove("modal-open");
  });

  // Cerrar sesión
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("loggedPayment");

    loginUser.textContent = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  });

  /* ============================================================
     CONTROL DE VOLUMEN NEON
  ============================================================ */
  if (music && volumeSlider) {
    music.volume = volumeSlider.value;

    volumeSlider.addEventListener("input", () => {
      music.volume = volumeSlider.value;
    });
  }

  /* ============================================================
     CARRUSEL DE IMÁGENES
  ============================================================ */
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  let currentIndex = 0;
  let autoSlide = null;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  function startAutoSlide() {
    if (!autoSlide) {
      autoSlide = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      }, 5000);
    }
  }

  if (slides.length > 0 && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    startAutoSlide();
  }
});