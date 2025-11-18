(() => {
  /**
   * Valorant-style "plant_spike" easter egg
   *
   * Usage:
   *   window.plant_spike()
   *
   * Requirements:
   *   Place these audio files in your public root:
   *     /plant.mp3
   *     /countdown.mp3
   *     /explode.mp3
   *     /defuse.mp3
   *
   * Behavior:
   *   - Plant: 4s (plays plant.mp3)
   *   - Countdown (after plant): 45s (plays countdown.mp3 starting at plant)
   *       Visual countdown never pauses.
   *   - Defuse: 7s total to defuse, with a 3.5s checkpoint (50%).
   *       - Defuse audio (defuse.mp3) only plays while holding the defuse button.
   *       - Defuse progress persists to checkpoint if you reach 3.5s and release early.
   *   - If defuse completes -> show "DEFUSED" overlay, prevent explosion.
   *   - If timer reaches 0 -> explode (explosion visuals + explode.mp3).
   *
   * Notes:
   *   - countdown audio is intentionally not paused by defuse and will continue playing
   *     independently. It will be stopped/cleaned up on final reset (after defuse/explode).
   */

  // STATE
  let running = false;
  let planted = false;
  let exploded = false;
  let defused = false;

  let plantTimeout: number | null = null;
  let explodeTimeout: number | null = null;
  let countdownInterval: number | null = null;

  let defuseHoldInterval: number | null = null;

  // Timers (ms)
  const PLANT_MS = 4000;
  const COUNTDOWN_MS = 45000;
  const DEFUSE_TOTAL_MS = 7000;
  const DEFUSE_CHECKPOINT_MS = 3500;

  // remaining defuse progress in ms (starts at full 7000 when someone begins defusing)
  let defuseProgressMs = DEFUSE_TOTAL_MS;

  // When defuse progress has been partially completed to checkpoint, we store minimal progress
  // We'll track "savedProgressMs" so resuming continues from saved point (checkpoint).
  let savedDefuseProgressMs = DEFUSE_TOTAL_MS;

  // UI elements
  let overlay: HTMLDivElement | null = null;
  let spikeEl: HTMLDivElement | null = null;
  let plantProgressEl: HTMLDivElement | null = null;
  let countdownTimerEl: HTMLDivElement | null = null;
  let defuseBtnEl: HTMLButtonElement | null = null;
  let defuseProgressBarEl: HTMLDivElement | null = null;
  let statusEl: HTMLDivElement | null = null;

  // Audio
  const plantAudio = new Audio("/plant.mp3");
  const countdownAudio = new Audio("/countdown.mp3");
  const explodeAudio = new Audio("/explode.mp3");
  const defuseAudio = new Audio("/defuse.mp3");

  // Default audio settings
  plantAudio.preload = "auto";
  countdownAudio.preload = "auto";
  explodeAudio.preload = "auto";
  defuseAudio.preload = "auto";

  // countdown audio will play once from start (do not loop by default).
  countdownAudio.loop = false;

  // Helper: format seconds -> MM:SS
  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const ss = (totalSec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Reset / cleanup (called after final)
  const cleanReset = () => {
    running = false;
    planted = false;
    exploded = false;
    defused = false;

    if (plantTimeout) { clearTimeout(plantTimeout); plantTimeout = null; }
    if (explodeTimeout) { clearTimeout(explodeTimeout); explodeTimeout = null; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    if (defuseHoldInterval) { clearInterval(defuseHoldInterval); defuseHoldInterval = null; }

    // stop and reset audios (defuseAudio should already be stopped unless defusing)
    try { plantAudio.pause(); plantAudio.currentTime = 0; } catch (e) {}
    try { explodeAudio.pause(); explodeAudio.currentTime = 0; } catch (e) {}
    // Per spec: countdown audio is independent of defuse. We'll stop it on final cleanup.
    try { countdownAudio.pause(); countdownAudio.currentTime = 0; } catch (e) {}
    try { defuseAudio.pause(); defuseAudio.currentTime = 0; } catch (e) {}

    // remove UI
    overlay?.remove();
    overlay = null;
    spikeEl = null;
    plantProgressEl = null;
    countdownTimerEl = null;
    defuseBtnEl = null;
    defuseProgressBarEl = null;
    statusEl = null;

    // reset defuse progress to full for next run
    defuseProgressMs = DEFUSE_TOTAL_MS;
    savedDefuseProgressMs = DEFUSE_TOTAL_MS;
  };

  // UI builder
  const buildUI = () => {
    // container overlay
    overlay = document.createElement("div");
    overlay.className = "vs-spike-overlay";

    overlay.innerHTML = `
      <div class="vs-spike-center">
        <div class="vs-spike-box">
          <div class="vs-spike-header">SPIKE PROTOCOL</div>

          <div class="vs-spike-main">
            <!-- Spike graphic -->
            <div class="spike-wrap">
              <svg class="spike-svg" viewBox="0 0 100 140" width="120" height="168" aria-hidden="true">
                <!-- custom stylized spike -->
                <g transform="translate(50,10)">
                  <ellipse cx="0" cy="110" rx="30" ry="6" fill="#111" opacity="0.6"></ellipse>
                  <path class="spike-core" d="M0 -5 L18 45 L0 80 L-18 45 Z" fill="#ff4655" stroke="#fff" stroke-width="1"/>
                  <circle class="spike-glow" cx="0" cy="20" r="8" fill="#ff4655" opacity="0.9"></circle>
                </g>
              </svg>
            </div>

            <div class="plant-progress">
              <div class="plant-bar-bg">
                <div class="plant-bar-fill"></div>
              </div>
              <div class="plant-text">Planting... <span class="plant-time">4.0s</span></div>
            </div>
          </div>

          <div class="vs-spike-footer">
            <div class="countdown-display">Time to explosion: <span class="countdown-time">00:45</span></div>

            <div class="defuse-row">
              <button class="defuse-btn">HOLD TO DEFUSE</button>
              <div class="defuse-progress-wrap">
                <div class="defuse-progress-bg">
                  <div class="defuse-progress-fill"></div>
                </div>
                <div class="defuse-time">7.0s</div>
              </div>
            </div>

            <div class="status-line"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // capture references
    spikeEl = overlay.querySelector(".spike-wrap") as HTMLDivElement;
    plantProgressEl = overlay.querySelector(".plant-bar-fill") as HTMLDivElement;
    countdownTimerEl = overlay.querySelector(".countdown-time") as HTMLDivElement;
    defuseBtnEl = overlay.querySelector(".defuse-btn") as HTMLButtonElement;
    defuseProgressBarEl = overlay.querySelector(".defuse-progress-fill") as HTMLDivElement;
    statusEl = overlay.querySelector(".status-line") as HTMLDivElement;

    // show initial states
    if (countdownTimerEl) countdownTimerEl.textContent = formatTime(COUNTDOWN_MS);
    if (overlay) overlay.classList.add("enter");
  };

  // Visual plant progress (4s)
  const runPlant = () => {
    planted = false;
    if (!overlay) return;

    statusEl && (statusEl.textContent = "Planting spike...");
    // Play plant audio
    plantAudio.currentTime = 0;
    plantAudio.play().catch(() => {});

    const startTs = Date.now();
    const endTs = startTs + PLANT_MS;

    const tick = () => {
      const now = Date.now();
      const pct = Math.min(1, (now - startTs) / PLANT_MS);
      if (plantProgressEl) plantProgressEl.style.width = `${pct * 100}%`;
      const remaining = Math.max(0, endTs - now);
      const sec = (remaining / 1000).toFixed(1);
      const plantText = overlay!.querySelector(".plant-time") as HTMLElement;
      if (plantText) plantText.textContent = `${sec}s`;

      if (now >= endTs) {
        // done planting
        planted = true;
        statusEl && (statusEl.textContent = "Spike planted.");
        // start countdown
        startCountdown();
      } else {
        plantTimeout = window.setTimeout(tick, 50);
      }
    };

    tick();
  };

  // Countdown visual + timer
  let countdownStartTs = 0;
  const startCountdown = () => {
    // Play countdown audio from start (independent of defuse). Per spec, defuse MUST NOT stop this audio.
    countdownAudio.currentTime = 0;
    countdownAudio.play().catch(() => {});

    countdownStartTs = Date.now();
    const countdownEndTs = countdownStartTs + COUNTDOWN_MS;

    // Reset UI plant bar to full (visual)
    const plantTextEl = overlay!.querySelector(".plant-text") as HTMLElement;
    if (plantTextEl) plantTextEl.textContent = "Spike active";

    // update visual countdown every 200ms
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, countdownEndTs - now);
      if (countdownTimerEl) countdownTimerEl.textContent = formatTime(remaining);

      // when time reaches 0 -> explosion (if not defused)
      if (remaining <= 0) {
        if (!defused) {
          doExplosion();
        } else {
          // already defused — but per spec the countdown audio remains unaffected.
          finalizeAfterDelay();
        }
      } else {
        countdownInterval = window.setTimeout(tick, 200);
      }
    };

    tick();

    // schedule final explosion in case intervals are blocked
    explodeTimeout = window.setTimeout(() => {
      const now = Date.now();
      const rem = countdownEndTs - now;
      if (rem <= 0 && !defused) doExplosion();
    }, COUNTDOWN_MS + 100);
  };

  // Explosion
  const doExplosion = () => {
    if (exploded || defused) return;
    exploded = true;
    statusEl && (statusEl.textContent = "SPIKE EXPLODED!");
    // explosion audio
    explodeAudio.currentTime = 0;
    explodeAudio.play().catch(() => {});
    // explosion visuals: big red flash + shake
    if (overlay) overlay.classList.add("explode");

    // small page shake
    document.body.classList.add("vs-explode-shake");

    // clear intervals
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    if (explodeTimeout) { clearTimeout(explodeTimeout); explodeTimeout = null; }

    // Cleanup after short delay
    window.setTimeout(() => {
      document.body.classList.remove("vs-explode-shake");
      finalizeAfterDelay();
    }, 1800);
  };

  // Finalize (defused or exploded): show message then reset
  const finalizeAfterDelay = () => {
    // show final overlay text
    if (!overlay) return;

    const finalMsg = document.createElement("div");
    finalMsg.className = "vs-final-msg";

    if (defused) {
      finalMsg.innerHTML = `<div class="vs-defused">SPIKE DEFUSED</div>`;
    } else if (exploded) {
      finalMsg.innerHTML = `<div class="vs-exploded">SITE SECURED — EXPLOSION</div>`;
    } else {
      finalMsg.innerHTML = `<div class="vs-ended">SEQUENCE ENDED</div>`;
    }

    overlay.appendChild(finalMsg);

    // After a short visible pause, reset everything
    window.setTimeout(() => {
      cleanReset();
    }, 3000);
  };

  // DEFUSE logic
  // We implement hold-to-defuse: pointerdown on button starts defuse; pointerup cancels hold.
  // If player reaches DEFUSE_CHECKPOINT_MS (3.5s) we save progress (checkpoint).
  // Resuming defuse picks up from savedDefuseProgressMs.
  const startDefuseHold = () => {
    if (!planted || exploded || defused) return;
    if (!defuseBtnEl || !defuseProgressBarEl || !statusEl) return;

    // If a saved checkpoint exists, resume from savedDefuseProgressMs
    defuseProgressMs = savedDefuseProgressMs;

    statusEl.textContent = "Defusing...";
    defuseAudio.currentTime = 0;
    defuseAudio.loop = true; // loop defuse sound while holding
    defuseAudio.play().catch(() => {});

    const start = Date.now();
    const tickMs = 50;

    defuseHoldInterval = window.setInterval(() => {
      // decrease defuseProgressMs by tickMs
      defuseProgressMs = Math.max(0, defuseProgressMs - tickMs);

      // update UI progress
      const percent = 1 - defuseProgressMs / DEFUSE_TOTAL_MS;
      defuseProgressBarEl.style.width = `${percent * 100}%`;
      const secLeft = (defuseProgressMs / 1000).toFixed(1);
      const defuseTimeEl = overlay!.querySelector(".defuse-time") as HTMLElement;
      if (defuseTimeEl) defuseTimeEl.textContent = `${secLeft}s`;

      // if reach checkpoint (<= DEFUSE_TOTAL_MS - DEFUSE_CHECKPOINT_MS) -> we have partially saved
      const reachedMs = DEFUSE_TOTAL_MS - defuseProgressMs;
      if (reachedMs >= DEFUSE_CHECKPOINT_MS) {
        // save checkpoint only once (store min)
        savedDefuseProgressMs = Math.min(savedDefuseProgressMs, defuseProgressMs);
        // Note: we save the remaining ms; to resume we will set defuseProgressMs = savedDefuseProgressMs
      }

      // If defuse complete
      if (defuseProgressMs <= 0) {
        // success!
        defused = true;
        // stop defuse audio (should stop when user releases too, but ensure stop)
        try { defuseAudio.pause(); defuseAudio.currentTime = 0; } catch (e) {}
        // do defuse visuals
        statusEl.textContent = "DEFUSED.";
        overlay!.classList.add("defused");
        // Important: per spec, countdown audio MUST NOT be stopped by defuse; we won't stop it.
        // However we will visually prevent explosion and proceed to finalize.
        if (defuseHoldInterval) { clearInterval(defuseHoldInterval); defuseHoldInterval = null; }
        // cleanup any scheduled explosion
        if (explodeTimeout) { clearTimeout(explodeTimeout); explodeTimeout = null; }
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
        // show defused final state and finalize
        finalizeAfterDelay();
      }

    }, tickMs);
  };

  const stopDefuseHold = () => {
    // called on pointerup / release
    if (defuseHoldInterval) {
      clearInterval(defuseHoldInterval);
      defuseHoldInterval = null;
    }
    // stop defuse audio
    try { defuseAudio.pause(); defuseAudio.currentTime = 0; } catch (e) {}

    if (!overlay) return;
    // If player reached checkpoint (<= half), we persist savedDefuseProgressMs such that next defuse resumes from there
    // savedDefuseProgressMs already set in the tick logic to the remaining ms at checkpoint moment.
    // If player released before checkpoint, we reset to full progress for next attempt.
    const reachedMs = DEFUSE_TOTAL_MS - savedDefuseProgressMs;
    // If they haven't reached checkpoint at all, reset saved progress to full (no partial progress preserved)
    if (reachedMs < DEFUSE_CHECKPOINT_MS) {
      // No checkpoint reached; reset saved progress to full
      savedDefuseProgressMs = DEFUSE_TOTAL_MS;
    } else {
      // checkpoint reached: savedDefuseProgressMs holds the remaining ms to finish
      // next attempt will resume from savedDefuseProgressMs.
      // Provide a small status note
      statusEl && (statusEl.textContent = `Checkpoint reached (${((DEFUSE_TOTAL_MS - savedDefuseProgressMs)/1000).toFixed(1)}s). Resume to finish.`);
    }
  };

  // Public command
  (window as any).plant_spike = () => {
    if (running) {
      console.log("%c[plant_spike] Sequence already running.", "color:#ff4655; font-family:monospace;");
      return;
    }
    running = true;

    // Build UI
    buildUI();

    // Hook up defuse pointer events
    defuseBtnEl!.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      startDefuseHold();
    });
    // stop on pointerup / pointercancel / pointerleave
    defuseBtnEl!.addEventListener("pointerup", (ev) => {
      ev.preventDefault();
      stopDefuseHold();
    });
    defuseBtnEl!.addEventListener("pointercancel", (ev) => {
      ev.preventDefault();
      stopDefuseHold();
    });
    defuseBtnEl!.addEventListener("pointerleave", (ev) => {
      // If pointer leaves while pressing, consider it a release
      if ((ev as PointerEvent).buttons === 1) stopDefuseHold();
    });

    // Accessibility: also allow Space key to act as hold while the button is focused
    defuseBtnEl!.addEventListener("keydown", (ev) => {
      if (ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        // emulate pointerdown only once
        if (!defuseHoldInterval) startDefuseHold();
      }
    });
    defuseBtnEl!.addEventListener("keyup", (ev) => {
      if (ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        stopDefuseHold();
      }
    });

    // Start plant animation -> after PLANT_MS start countdown
    const plantBarFill = overlay!.querySelector(".plant-bar-fill") as HTMLElement;
    if (plantBarFill) plantBarFill.style.width = "0%";

    // small CSS animation class to visually show planting (also used by plant tick)
    overlay!.classList.add("planting");

    // play plant audio and animate plant bar
    plantAudio.currentTime = 0;
    plantAudio.play().catch(() => {});

    // animate plant bar smoothly
    const plantStart = Date.now();
    const plantEnd = plantStart + PLANT_MS;

    const plantTick = () => {
      const now = Date.now();
      const pct = Math.min(1, (now - plantStart) / PLANT_MS);
      plantProgressEl && (plantProgressEl.style.width = `${pct * 100}%`);
      const remaining = Math.max(0, plantEnd - now);
      const plantText = overlay!.querySelector(".plant-time") as HTMLElement;
      if (plantText) plantText.textContent = `${(remaining/1000).toFixed(1)}s`;

      if (now >= plantEnd) {
        // planting finished
        overlay!.classList.remove("planting");
        planted = true;
        statusEl && (statusEl.textContent = "Spike planted. Countdown started.");
        // Start countdown visuals and logic
        startCountdown();
      } else {
        plantTimeout = window.setTimeout(plantTick, 40);
      }
    };

    plantTick();
  };

  // CSS injection
  const style = document.createElement("style");
  style.textContent = `
/* Valorant-ish spike UI */
.vs-spike-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,6,10,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999999;
  font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.vs-spike-center { display:flex; align-items:center; justify-content:center; width:100%; }

.vs-spike-box {
  width: 760px;
  max-width: 92%;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.25));
  border: 2px solid rgba(255,70,85,0.15);
  padding: 18px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  color: #ece8e1;
}

.vs-spike-header {
  font-weight: 700;
  color: #ff4655;
  letter-spacing: 1px;
  font-size: 18px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

/* Main area */
.vs-spike-main {
  display:flex;
  gap:18px;
  align-items:center;
  padding: 12px 6px;
}

.spike-wrap { width:140px; display:flex; align-items:center; justify-content:center; }

.spike-svg { filter: drop-shadow(0 6px 12px rgba(255,70,85,0.12)); }

.spike-core { transition: fill 300ms; }
.spike-glow { transition: r 300ms, opacity 300ms; }

/* Plant progress */
.plant-progress { flex:1; display:flex; flex-direction:column; gap:8px; }

.plant-bar-bg {
  width:100%;
  height:14px;
  background: rgba(255,255,255,0.06);
  border-radius: 6px;
  overflow:hidden;
}

.plant-bar-fill {
  width: 0%;
  height:100%;
  background: linear-gradient(90deg, #ff4655, #ff8b8b);
  transition: width 40ms linear;
}

/* footer area */
.vs-spike-footer { padding-top: 8px; display:flex; flex-direction:column; gap:12px; }

.countdown-display { font-size: 16px; color: #f7eaea; }

.defuse-row { display:flex; gap:12px; align-items:center; }

.defuse-btn {
  background: linear-gradient(180deg, rgba(255,70,85,0.12), rgba(255,70,85,0.06));
  color: #fff;
  border: 1px solid rgba(255,70,85,0.18);
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  user-select: none;
}

.defuse-btn:active { transform: translateY(1px); }

.defuse-progress-wrap { display:flex; gap:10px; align-items:center; width:100%; }

.defuse-progress-bg {
  width: 100%;
  height: 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
  overflow:hidden;
}

.defuse-progress-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #ffd800, #ffea5c);
  transition: width 40ms linear;
}

.defuse-time { width: 64px; text-align:right; color: #ffd800; font-weight:700; }

/* Status */
.status-line { margin-top:6px; color: rgba(255,255,255,0.75); font-size: 13px; min-height:18px; }

/* final messages */
.vs-final-msg { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; pointer-events:none; }
.vs-defused { color: #ffd800; font-size: 36px; font-weight:800; text-shadow: 0 0 12px rgba(255,216,0,0.8); }
.vs-exploded { color: #ff4655; font-size: 36px; font-weight:800; text-shadow: 0 0 12px rgba(255,70,85,0.8); }
.vs-ended { color:#ece8e1; font-size: 28px; font-weight:700; }

/* Explode visuals */
.vs-explode-shake {
  animation: vs-page-shake 650ms ease-in-out;
}
@keyframes vs-page-shake {
  0% { transform: translateY(0) }
  30% { transform: translateY(-8px) }
  60% { transform: translateY(6px) }
  100% { transform: translateY(0) }
}

/* explode flash on overlay */
.vs-spike-overlay.explode::before {
  content: "";
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,90,100,0.95), rgba(255,255,255,0.0) 40%);
  mix-blend-mode: screen;
  opacity: 1;
  animation: vs-flash 900ms ease-out forwards;
}
@keyframes vs-flash {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.02); }
}

/* planting class */
.vs-spike-overlay.planting .spike-core { fill: #ff9aa0; }
.vs-spike-overlay.planting .spike-glow { r: 10; opacity: 1; }

/* defused */
.vs-spike-overlay.defused .spike-core { fill: #ffd800; }
.vs-spike-overlay.defused .spike-glow { fill: #ffd800; opacity: 0.9; }

/* small enter animation */
.vs-spike-overlay.enter .vs-spike-box { transform: translateY(8px); opacity: 1; transition: transform 260ms ease, opacity 260ms ease; }
`;

  document.head.appendChild(style);

  // Done: expose a reset helper if you want to forcibly clear
  (window as any).plant_spike_reset = () => {
    cleanReset();
  };
})();
