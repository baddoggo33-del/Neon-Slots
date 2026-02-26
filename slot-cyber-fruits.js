/* ============================
   CONFIGURACIÓN
============================ */
const symbols = [
  "img/cherry.jpeg",
  "img/lemon.jpeg",
  "img/watermelon.jpeg",
  "img/grape.jpeg",
  "img/diamond.jpeg", // SCATTER
  "img/star.jpeg",
  "img/seven.jpeg"
];

// 5 columnas
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
  document.getElementById("reel4"),
  document.getElementById("reel5")
];

const mensaje = document.getElementById("mensaje");
const spinBtn = document.getElementById("spinBtn");
const slotContainer = document.querySelector(".slot-container");

let credits = 1000;
let bet = 10;

const creditsBox = document.getElementById("credits");
const betBox = document.getElementById("bet");

const soundSpin = document.getElementById("soundSpin");
const soundStop = document.getElementById("soundStop");
const soundWin = document.getElementById("soundWin");

// ============================
// CONTROL DE VOLUMEN
// ============================
const volumeSlider = document.getElementById("volumeSlider");
const sounds = [
  document.getElementById("soundSpin"),
  document.getElementById("soundStop"),
  document.getElementById("soundWin")
];

// Cambiar volumen en tiempo real
volumeSlider.addEventListener("input", () => {
  const vol = parseFloat(volumeSlider.value);
  sounds.forEach(s => s.volume = vol);
});

soundSpin.load();
soundStop.load();
soundWin.load();

function safePlay(audio) {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (e) {}
}

function updateHUD() {
  creditsBox.textContent = credits;
  betBox.textContent = bet;
}

/* ============================
   LIMPIAR HIGHLIGHT PAYTABLE
============================ */
function clearHighlights() {
  document
    .querySelectorAll(".pay-highlight-normal, .pay-highlight-scatter")
    .forEach(el => {
      el.classList.remove("pay-highlight-normal", "pay-highlight-scatter");
    });
}

/* ============================
   MOSTRAR 3 SÍMBOLOS POR COLUMNA
============================ */
function showRandomColumn(reel) {
  reel.innerHTML = "";
  const results = [];

  for (let i = 0; i < 3; i++) {
    const img = document.createElement("img");
    img.src = symbols[Math.floor(Math.random() * symbols.length)];
    reel.appendChild(img);
    results.push(img.src);
  }

  return results;
}

/* ============================
   ANIMACIÓN DE GIRO
============================ */
function spinReelWithBlur(reel, duration) {
  return new Promise(resolve => {
    reel.parentElement.classList.add("blur");

    const interval = setInterval(() => {
      showRandomColumn(reel);
    }, 40);

    setTimeout(() => {
      clearInterval(interval);
      reel.parentElement.classList.remove("blur");

      safePlay(soundStop);

      const finalSymbols = showRandomColumn(reel);

      resolve(finalSymbols);
    }, duration);
  });
}

/* ============================
   GLOW DE VICTORIA
============================ */
function applyWinGlow(active) {
  slotContainer.classList.remove("win-glow");
  if (active) slotContainer.classList.add("win-glow");
}

/* ============================
   PAYTABLE + SCATTER + CLAVES PAYTABLE
============================ */
function calculateWin(matrix) {
  let totalWin = 0;
  let scatterWin = false;
  const paytableKeys = [];

  const lines = [
    [0, 0, 0, 0, 0], // superior
    [1, 1, 1, 1, 1], // central
    [2, 2, 2, 2, 2], // inferior
    [0, 1, 2, 1, 0], // diagonal ↘️
    [2, 1, 0, 1, 2]  // diagonal ↙️
  ];

  const SCATTER = "diamond";

  /* ============================
     1. CONTAR SCATTERS
  ============================ */
  let scatterCount = 0;

  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      if (matrix[col][row].includes(SCATTER)) {
        scatterCount++;
      }
    }
  }

  if (scatterCount >= 3) {
    const scatterPay = {
      3: 3,
      4: 10,
      5: 30,
      6: 50,
      7: 100
    };

    const multiplier = scatterPay[scatterCount] || 150;
    totalWin += bet * multiplier;
    scatterWin = true;

    let key = "";
    if (scatterCount >= 3 && scatterCount <= 7) {
      key = `scatter-${scatterCount}`;
    } else {
      key = "scatter-8plus";
    }
    paytableKeys.push(key);
  }

  /* ============================
     2. PAGOS NORMALES (3+ consecutivos)
  ============================ */
  for (const pattern of lines) {
    const line = pattern.map((row, col) => matrix[col][row]);

    let i = 0;
    while (i < line.length) {
      let count = 1;

      while (i + count < line.length && line[i] === line[i + count]) {
        count++;
      }

      if (count >= 3) {
        const symbol = line[i];
        let multiplier = 0;
        let key = "";

        if (symbol.includes("seven")) {
          if (count === 3) { multiplier = 20; key = "seven-3"; }
          if (count === 4) { multiplier = 50; key = "seven-4"; }
          if (count === 5) { multiplier = 200; key = "seven-5"; }
        } else if (!symbol.includes(SCATTER)) {
          if (count === 3) { multiplier = 5; key = "normal-3"; }
          if (count === 4) { multiplier = 15; key = "normal-4"; }
          if (count === 5) { multiplier = 40; key = "normal-5"; }
        }

        if (multiplier > 0) {
          totalWin += bet * multiplier;
          if (key && !paytableKeys.includes(key)) {
            paytableKeys.push(key);
          }
        }
      }

      i += count;
    }
  }

  return { totalWin, scatterWin, paytableKeys };
}

/* ============================
   SPIN PRINCIPAL
============================ */
async function spin() {

  /* DESACTIVAR PARPADEO Y ARCOÍRIS AL EMPEZAR */
  spinBtn.classList.remove("blink", "rainbow");

  if (credits < bet) {
    mensaje.textContent = "No tienes créditos suficientes.";
    return;
  }

  spinBtn.disabled = true;
  mensaje.textContent = "";
  mensaje.className = "";
  applyWinGlow(false);
  clearHighlights();

  credits -= bet;
  updateHUD();

  safePlay(soundSpin);

  const results = [];

  /* Duraciones exactas para total = 7.9s */
  const reelDurations = [1100, 1400, 1600, 1900, 1900];

  for (let i = 0; i < reels.length; i++) {
    const duration = reelDurations[i];
    const r = await spinReelWithBlur(reels[i], duration);
    results.push(r);
  }

  const { totalWin, scatterWin, paytableKeys } = calculateWin(results);

  /* ============================
     ILUMINAR FILAS PAYTABLE
  ============================ */
  paytableKeys.forEach(key => {
    const row = document.getElementById(`pay-${key}`);
    if (!row) return;

    if (key.startsWith("scatter")) {
      row.classList.add("pay-highlight-scatter");
    } else {
      row.classList.add("pay-highlight-normal");
    }
  });

  /* ============================
     MENSAJE FINAL (ACTUALIZADO)
  ============================ */
  if (totalWin > 0) {
    credits += totalWin;
    updateHUD();
    safePlay(soundWin);

    const ganoScatter = scatterWin;
    const ganoNormal = paytableKeys.some(k => k.startsWith("normal") || k.startsWith("seven"));

    // MODO ARCOÍRIS CUANDO GANAS
    spinBtn.classList.add("rainbow");

    if (ganoScatter && ganoNormal) {
      mensaje.textContent = `¡Ganaste ${totalWin} créditos! (Scatter + Normales)`;
      mensaje.className = "win";
    } 
    else if (ganoScatter) {
      mensaje.textContent = `¡Ganaste ${totalWin} créditos por SCATTER!`;
      mensaje.className = "scatter-win";
    } 
    else if (ganoNormal) {
      mensaje.textContent = `¡Ganaste ${totalWin} créditos por combinación normal!`;
      mensaje.className = "win";
    }

    applyWinGlow(true);

  } else {
    mensaje.textContent = "Nada esta vez…";
    mensaje.className = "lose";

    // SI NO GANAS, VUELVE A PARPADEAR
    spinBtn.classList.add("blink");
  }

  spinBtn.disabled = false;
}

/* ============================
   INICIO
============================ */
spinBtn.addEventListener("click", spin);