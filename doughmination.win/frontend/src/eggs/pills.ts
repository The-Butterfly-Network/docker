(() => {
  let redPillLocked = false;
  let matrixOverlay: HTMLDivElement | null = null;
  let glyphCanvas: HTMLCanvasElement | null = null;
  let glitchInterval: number | null = null;

  // BLUE PILL — LOCKS OUT RED PILL
  (window as any).blue_pill = () => {
    redPillLocked = true;
    console.log("%cnothing happened", "color:#889; font-size:14px;");
  };

  // RED PILL — MAIN EVENT
  (window as any).red_pill = () => {
    if (redPillLocked) {
      console.log(
        "%cAccess to red_pill() has been locked. Refresh required.",
        "color:#f00; font-weight:bold;"
      );
      return;
    }

    redPillLocked = true;

    console.log(`
%c╔══════════════════════════════════════╗
║   WAKE UP, NEO...                    ║
║   THE MATRIX HAS YOU...              ║
║   FOLLOW THE WHITE RABBIT.           ║
╚══════════════════════════════════════╝
`,
      "color:#00ff00; font-family:monospace; font-size:14px;"
    );

    // 1. Show SYSTEM BREACH warning (yellow)
    showSystemBreach(() => {
      // 2. Start glitch effect
      startGlitchEffect();

      // 3. After glitch → go to full matrix mode
      setTimeout(() => {
        stopGlitchEffect();
        startMatrixOverlay();
      }, 2000);
    });
  };

  /* --------------------------------------------------------------
   *  SYSTEM BREACH WARNING (YELLOW)
   * -------------------------------------------------------------- */
  const showSystemBreach = (onComplete: () => void) => {
    const warning = document.createElement("div");
    warning.className = "system-breach-warning";
    warning.textContent = "⚠ SYSTEM BREACH DETECTED ⚠";

    document.body.appendChild(warning);

    setTimeout(() => {
      warning.remove();
      onComplete();
    }, 1500);
  };

  /* --------------------------------------------------------------
   *  MATRIX GLITCH EFFECT
   * -------------------------------------------------------------- */
  const startGlitchEffect = () => {
    glitchInterval = window.setInterval(() => {
      document.body.classList.add("glitch-active");
      setTimeout(() => {
        document.body.classList.remove("glitch-active");
      }, 100);
    }, 150);
  };

  const stopGlitchEffect = () => {
    if (glitchInterval) clearInterval(glitchInterval);
    glitchInterval = null;
    document.body.classList.remove("glitch-active");
  };

  /* --------------------------------------------------------------
   *  MATRIX OVERLAY + GLYPH RAIN
   * -------------------------------------------------------------- */
  const startMatrixOverlay = () => {
    matrixOverlay = document.createElement("div");
    matrixOverlay.className = "matrix-overlay";
    document.body.appendChild(matrixOverlay);

    glyphCanvas = document.createElement("canvas");
    glyphCanvas.className = "matrix-canvas";
    matrixOverlay.appendChild(glyphCanvas);

    startMatrixRain(glyphCanvas);
  };

  const startMatrixRain = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const glyphs = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const fontSize = 18;
    let columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    };
    draw();
  };

  /* --------------------------------------------------------------
   *  CSS Styles
   * -------------------------------------------------------------- */
  const style = document.createElement("style");
  style.textContent = `
/* SYSTEM BREACH WARNING */
.system-breach-warning {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: yellow;
  color: black;
  font-size: 2rem;
  font-weight: bold;
  z-index: 10000000;
  border: 3px solid black;
  font-family: monospace;
  animation: breach-pulse 0.2s infinite alternate;
}
@keyframes breach-pulse {
  from { transform: translate(-50%, -50%) scale(1); }
  to   { transform: translate(-50%, -50%) scale(1.05); }
}

/* MATRIX OVERLAY */
.matrix-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: black;
  z-index: 999999;
  overflow: hidden;
}

/* Canvas for glyph rain */
.matrix-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* GLITCH EFFECT */
.glitch-active * {
  text-shadow:
      1px 0px red,
     -1px 0px cyan;
  transform: skewX(2deg);
  filter: blur(1px);
}
`;
  document.head.appendChild(style);

})();
