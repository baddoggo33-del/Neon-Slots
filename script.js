// Verificación de edad
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("age-overlay");
  const btnYes = document.getElementById("btn-age-yes");
  const btnNo = document.getElementById("btn-age-no");

  if (overlay && btnYes && btnNo) {
    btnYes.addEventListener("click", () => {
      overlay.style.display = "none";
    });

    btnNo.addEventListener("click", () => {
      window.location.href = "https://es.wikipedia.org/wiki/Felis_silvestris_catus";
    });
  }

  // Carrusel (solo en index)
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  let currentIndex = 0;

  function showSlide(index) {
    if (!slides.length) return;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  if (prevBtn && nextBtn && slides.length) {
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    // Auto-rotación
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  }
});