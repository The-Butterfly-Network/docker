(() => {
  let relicTriggered = false;
  let glitchInterval: number | null = null;
  let relicOverlay: HTMLDivElement | null = null;

  // PUBLIC COMMAND
  (window as any).relic_breach = () => {
    if (relicTriggered) {
      console.log("%c[RELIC] Already unstable...", "color:#00c8ff; font-size:14px;");
      return;
    }

    relicTriggered = true;
    console.log(`
%c[RELIC MALFUNCTION DETECTED]
ENGRAM STATIC RISING...
`, "color:#00c8ff; font-family:monospace; font-size:14px;");

    triggerRelicWarning();
  };

  // RELIC WARNING OVERLAY
  const triggerRelicWarning = () => {
    const overlay = document.createElement("div");
    overlay.className = "relic-warning-overlay";
    overlay.innerHTML = `
      <div class="relic-warning-box">
        <div class="relic-warning-header">⚠ RELIC MALFUNCTION ⚠</div>

        <div class="relic-warning-body">
          <p>Biochip Temperature: <span class="glow-yellow">CRITICAL</span></p>
          <p>Engram Interference: <span class="glow-blue">SEVERE</span></p>
          <p>Memory Stability: <span class="glow-yellow">FAILING</span></p>
        </div>

        <div class="relic-bars">
          <div class="relic-bar"></div>
          <div class="relic-bar"></div>
          <div class="relic-bar"></div>
        </div>

        <div class="relic-warning-footer">Neural Link Destabilizing…</div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      startRelicGlitch();
      setTimeout(() => {
        stopRelicGlitch();
        showEngramInterference();
      }, 2500);
    }, 2500);
  };

  // GLITCH EFFECT
  const startRelicGlitch = () => {
    document.body.classList.add("relic-glitch-active");

    glitchInterval = window.setInterval(() => {
      const intensity = Math.random();
      if (intensity > 0.65) {
        document.body.classList.add("relic-glitch-heavy");
        setTimeout(() => {
          document.body.classList.remove("relic-glitch-heavy");
        }, 60);
      }
    }, 110);
  };

  const stopRelicGlitch = () => {
    if (glitchInterval) clearInterval(glitchInterval);
    glitchInterval = null;
    document.body.classList.remove("relic-glitch-active", "relic-glitch-heavy");
  };

  // JOHNNY OVERLAY
  const showEngramInterference = () => {
    relicOverlay = document.createElement("div");
    relicOverlay.className = "relic-overlay";
    relicOverlay.innerHTML = `
      <div class="johnny-hologram">
        <div class="johnny-line">“You really did it now, V…”</div>
      </div>
    `;

    document.body.appendChild(relicOverlay);

    setTimeout(() => {
      showJohnnyQuotes();
    }, 2000);
  };

  // Johnny dialogue rotation
  const showJohnnyQuotes = () => {
    const quotes = [
      "“Biochip's cooking your brainpan, V.”",
      "“Should’ve listened when I said don’t slot that thing.”",
      "“Tick-fucking-tock.”",
      "“You hearing me, or just the ringing?”"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (!relicOverlay) return;
      relicOverlay.querySelector(".johnny-line")!.textContent = quotes[i];
      i++;

      if (i >= quotes.length) {
        clearInterval(interval);
        setTimeout(() => finalizeRelic());
      }
    }, 1700);
  };

  // FINAL MESSAGE + RESET
  const finalizeRelic = () => {
    if (!relicOverlay) return;

    const final = document.createElement("div");
    final.className = "relic-final-message";

    const survived = Math.random() > 0.3;

    // Fully forced colors to avoid green bleeding
    final.innerHTML = survived
      ? `<h1 class="good">RELIC STABILIZED</h1>
         <p class="final-sub good-sub">Engram activity dropping...</p>`
      : `<h1 class="bad">CRITICAL CORRUPTION</h1>
         <p class="final-sub bad-sub">Bleedthrough escalating...</p>`;

    relicOverlay.appendChild(final);

    setTimeout(() => {
      final.classList.add("fade-out");
      setTimeout(() => {
        relicOverlay?.remove();
        relicOverlay = null;

        // RESET STATE
        relicTriggered = false;

        console.log(
          "%cRelic systems nominal. Override available.",
          "color:#00c8ff; font-size:12px; font-family:monospace;"
        );
      }, 2000);
    }, 3500);
  };

  // CSS (FULLY BLUE/YELLOW & CENTERED BARS)
  const johnnyStyle = document.createElement("style");
  johnnyStyle.textContent = `
:root {
  --yellow: #ffd800;
  --blue: #00c8ff;
}

/* GENERAL */
@keyframes fade-in { from {opacity:0} to {opacity:1} }
@keyframes fade-out { from {opacity:1} to {opacity:0} }

/* WARNING OVERLAY */
.relic-warning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 20, 0.92);
  z-index: 999999999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.relic-warning-box {
  background: rgba(0, 200, 255, 0.12);
  border: 3px solid var(--blue);
  padding: 40px;
  color: var(--blue);
  font-family: monospace;
  width: 480px;
  text-align: center;
  box-shadow: 0 0 25px var(--blue);
}

.relic-warning-header {
  font-size: 2rem;
  text-shadow: 0 0 15px var(--blue);
  margin-bottom: 20px;
}

.glow-yellow {
  color: var(--yellow);
  text-shadow: 0 0 10px var(--yellow);
}

.glow-blue {
  color: var(--blue);
  text-shadow: 0 0 10px var(--blue);
}

/* CENTERED BARS */
.relic-bars {
  margin: 25px auto 10px;
  width: 180px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.relic-bar {
  width: 40px;
  height: 10px;
  background: var(--yellow);
  animation: relic-bar-pulse 0.5s infinite alternate;
}

.relic-bar:nth-child(2) { animation-delay: 0.1s; }
.relic-bar:nth-child(3) { animation-delay: 0.2s; }

@keyframes relic-bar-pulse { from { opacity:1 } to { opacity:0.2 } }

.relic-warning-footer {
  margin-top: 20px;
  color: var(--yellow);
  font-size: 1rem;
  opacity: 0.85;
}

/* GLITCH EFFECT */
.relic-glitch-active * {
  animation: relic-skew 0.25s infinite;
  text-shadow:
    1px 0px var(--yellow),
   -1px 0px var(--blue);
}

@keyframes relic-skew {
  0% { transform: skewX(0deg); }
  25% { transform: skewX(4deg); }
  50% { transform: skewX(-4deg); }
  75% { transform: skewX(2deg); }
  100% { transform: skewX(0deg); }
}

.relic-glitch-heavy {
  filter: contrast(230%) saturate(200%);
}

/* JOHNNY HOLOGRAM */
.relic-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.johnny-hologram {
  color: var(--blue);
  font-family: monospace;
  text-align: center;
  animation: fade-in 1s;
  filter: drop-shadow(0 0 10px var(--blue));
}

.johnny-line {
  font-size: 1.7rem;
  text-shadow: 0 0 10px var(--blue);
}

/* FINAL MESSAGE */
.relic-final-message {
  position: absolute;
  bottom: 15%;
  width: 100%;
  text-align: center;
  animation: fade-in 1s;
}

.good {
  color: var(--blue) !important;
  text-shadow: 0 0 25px var(--blue) !important;
  font-size: 3rem;
}

.bad {
  color: var(--yellow) !important;
  text-shadow: 0 0 25px var(--yellow) !important;
  font-size: 3rem;
}

.final-sub {
  font-size: 1.4rem;
  margin-top: 10px;
}

.good-sub {
  color: var(--blue) !important;
  text-shadow: 0 0 10px var(--blue) !important;
}

.bad-sub {
  color: var(--yellow) !important;
  text-shadow: 0 0 10px var(--yellow) !important;
}

.relic-final-message.fade-out {
  animation: fade-out 2s forwards;
}
`;

  document.head.appendChild(johnnyStyle);
})();
