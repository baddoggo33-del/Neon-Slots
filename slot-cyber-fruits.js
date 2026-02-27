/* ============================
   CONFIGURACIÓN
============================ */
const symbols = [
  "img/cherry.jpeg",
  "img/lemon.jpeg",
  "img/watermelon.jpeg",
  "img/grape.jpeg",
  "img/diamond.jpeg",
  "img/star.jpeg",
  "img/seven.jpeg"
];

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

let rainbowActive = false;
let rainbowTimeout = null;

let spinCounter = 0;

const creditsBox = document.getElementById("credits");
const betBox = document.getElementById("bet");

const betMinus = document.getElementById("bet-minus");
const betPlus = document.getElementById("bet-plus");

const MIN_BET = 10;
const BET_STEP = 10;

// 🌈 MODO ARCOÍRIS
const RAINBOW_CHANCE = 1; // 100% para pruebas
const RAINBOW_MULTIPLIER = 3;

const soundSpin = document.getElementById("soundSpin");
const soundStop = document.getElementById("soundStop");
const soundWin = document.getElementById("soundWin");
const soundRainbow = document.getElementById("soundRainbow");

/* ============================
   CONTROL DE VOLUMEN
============================ */
const volumeSlider = document.getElementById("volumeSlider");
const sounds = [soundSpin, soundStop, soundWin, soundRainbow];

volumeSlider.addEventListener("input", () => {
  const vol = parseFloat(volumeSlider.value);
  sounds.forEach(s => s.volume = vol);
});

function safePlay(audio) {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (e) {}
}

/* ============================
   HUD
============================ */
function updateHUD() {
  creditsBox.textContent = credits + " Raritanios";
  betBox.textContent = bet + " Raritanios";
}

/* ============================
   BOTONES DE APUESTA
============================ */
betMinus.addEventListener("click", () => {
  if (bet > MIN_BET) {
    bet -= BET_STEP;
    updateHUD();
  }
});

betPlus.addEventListener("click", () => {
  bet += BET_STEP;
  updateHUD();
});

/* ============================
   LIMPIAR PAYTABLE
============================ */
function clearHighlights() {
  document
    .querySelectorAll(".pay-highlight-normal, .pay-highlight-scatter")
    .forEach(el => {
      el.classList.remove("pay-highlight-normal", "pay-highlight-scatter");
    });
}

/* ============================
   MOSTRAR SÍMBOLOS
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
   GIRO CON BLUR
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
   GLOW
============================ */
function applyWinGlow(active) {
  slotContainer.classList.remove("win-glow");
  if (active) slotContainer.classList.add("win-glow");
}

/* ============================
   PAYTABLE
============================ */
function calculateWin(matrix) {
  let totalWin = 0;
  let scatterWin = false;
  const paytableKeys = [];

  const lines = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2]
  ];

  const SCATTER = "diamond";

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

    let key = scatterCount >= 3 && scatterCount <= 7
      ? `scatter-${scatterCount}`
      : "scatter-8plus";

    paytableKeys.push(key);
  }

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
          if (!paytableKeys.includes(key)) paytableKeys.push(key);
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
function shouldTriggerRainbow() {
  spinCounter++;

  if (spinCounter >= 15) {
    spinCounter = 0; // reiniciar contador
    return true;     // activar modo arcoíris
  }

  return false;      // no activar
}
async function spin() {

  // LIMPIAR EFECTOS SOLO SI NO ESTAMOS EN MODO ARCOÍRIS
if (!rainbowActive) {
  document.body.classList.remove("rainbow-bg");
  slotContainer.classList.remove("rainbow-spin");
  spinBtn.classList.remove("rainbow-spin-btn");

  document.querySelectorAll(".paytable").forEach(t => {
    t.classList.remove("rainbow-table");
  });
}

  spinBtn.classList.remove("blink", "rainbow");

  if (credits < bet) {
    mensaje.textContent = "No tienes créditos suficientes.";
    return;
  }

  const isRainbowSpin = shouldTriggerRainbow();

  spinBtn.disabled = true;
  mensaje.textContent = "";
  mensaje.className = "";
  applyWinGlow(false);
  clearHighlights();

  credits -= bet;
  updateHUD();

 // ACTIVAR MODO ARCOÍRIS (34 segundos)
if (isRainbowSpin && !rainbowActive) {

    rainbowActive = true;

    const banner = document.getElementById("rainbow-banner");
banner.classList.add("flash");

setTimeout(() => {
  banner.classList.remove("flash");
}, 1000); // 1 segundo

    // Activar efectos visuales
    document.body.classList.add("rainbow-bg");
    slotContainer.classList.add("rainbow-spin");
    spinBtn.classList.add("rainbow-spin-btn");

    document.getElementById("rainbow-banner").classList.add("active");

    document.querySelectorAll(".paytable").forEach(t => {
        t.classList.add("rainbow-table");
    });

    mensaje.textContent = "¡Modo Arcoíris activado! Ganancias x3 durante 34 segundos.";

    // Música arcoíris en loop
    soundRainbow.loop = true;
    safePlay(soundRainbow);

    // Temporizador de 34 segundos
    rainbowTimeout = setTimeout(() => {

        rainbowActive = false;

        // Apagar efectos visuales
        document.body.classList.remove("rainbow-bg");
        slotContainer.classList.remove("rainbow-spin");
        spinBtn.classList.remove("rainbow-spin-btn");

        document.getElementById("rainbow-banner").classList.remove("active");

        document.querySelectorAll(".paytable").forEach(t => {
            t.classList.remove("rainbow-table");
        });

        // Parar música
        soundRainbow.pause();
        soundRainbow.currentTime = 0;

        mensaje.textContent = "🌈 El Modo Arcoíris ha terminado.";

    }, 34000);
}

  if (!rainbowActive) safePlay(soundSpin);

  const results = [];
  const reelDurations = [1100, 1400, 1600, 1900, 1900];

  for (let i = 0; i < reels.length; i++) {
    const r = await spinReelWithBlur(reels[i], reelDurations[i]);
    results.push(r);
  }

  let { totalWin, scatterWin, paytableKeys } = calculateWin(results);

   // Iluminar paytable
  paytableKeys.forEach(key => {
    const row = document.getElementById(`pay-${key}`);
    if (!row) return;

    if (key.startsWith("scatter")) {
      row.classList.add("pay-highlight-scatter");
    } else {
      row.classList.add("pay-highlight-normal");
    }
  });

  // Aplicar multiplicador arcoíris
  if (rainbowActive && totalWin > 0) {
    totalWin *= RAINBOW_MULTIPLIER;
}
  // Mostrar resultados
  if (totalWin > 0) {
    credits += totalWin;
    updateHUD();
    safePlay(soundWin);

    const ganoScatter = scatterWin;
    const ganoNormal = paytableKeys.some(k => k.startsWith("normal") || k.startsWith("seven"));

    spinBtn.classList.add("rainbow");

    if (ganoScatter && ganoNormal) {
      mensaje.textContent = `¡Ganaste ${totalWin} Raritanios! (Scatter + Normales${isRainbowSpin ? " x3 Modo Arcoíris" : ""})`;
      mensaje.className = "win";
    } 
    else if (ganoScatter) {
      mensaje.textContent = `¡Ganaste ${totalWin} Raritanios por SCATTER${isRainbowSpin ? " x3 Modo Arcoíris" : ""}!`;
      mensaje.className = "scatter-win";
    } 
    else if (ganoNormal) {
      mensaje.textContent = `¡Ganaste ${totalWin} Raritanios por combinación normal${isRainbowSpin ? " x3 Modo Arcoíris" : ""}!`;
      mensaje.className = "win";
    }

    applyWinGlow(true);

  } else {
    if (!isRainbowSpin) {
      mensaje.textContent = "Nada esta vez…";
    } else {
      mensaje.textContent = "Ni con modo arcoíris ganas, matao...";
    }
    mensaje.className = "lose";
    spinBtn.classList.add("blink");
  }
  // Reactivar botón al terminar el giro
  spinBtn.disabled = false;
} // ← ESTA ES LA LLAVE QUE FALTABA (cierra la función spin)

/* ============================
   INICIO
============================ */
spinBtn.addEventListener("click", spin);

function scaleSlot() {
  const wrapper = document.getElementById("slot-wrapper");
  const baseWidth = 1200;
  const scale = Math.min(window.innerWidth / baseWidth, 1);
  wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", scaleSlot);
window.addEventListener("load", () => {
  updateHUD();
  scaleSlot();
});