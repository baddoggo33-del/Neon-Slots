document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
     VERIFICACIÓN DE EDAD + INICIO DE MÚSICA
  ============================================================ */
  const overlay = document.getElementById("age-overlay");
  const btnYes = document.getElementById("btn-age-yes");
  const btnNo = document.getElementById("btn-age-no");
  const music = document.getElementById("bg-music");
  const volumeSlider = document.getElementById("volumeSlider");

  if (overlay && btnYes && btnNo) {
    // Bloquear scroll mientras el modal está activo
    document.body.classList.add("modal-open");

    btnYes.addEventListener("click", () => {
      overlay.style.display = "none";
      document.body.classList.remove("modal-open");

      // Iniciar música al aceptar (evita bloqueo del navegador)
      if (music) {
        music.volume = volumeSlider ? volumeSlider.value : 0.5;
        music.play().catch(() => {});
      }
    });

    btnNo.addEventListener("click", () => {
      window.location.href = "https://es.wikipedia.org/wiki/Felis_silvestris_catus";
    });
  }

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