(window as any).butterfly = (() => {
    let enabled = false;
    let butterflyInterval: number | null = null;

    // Create a butterfly element
    const createButterfly = () => {
        const butterfly = document.createElement('div');
        butterfly.className = 'butterfly-float';
        butterfly.textContent = '🦋';

        // Random starting position at the top
        butterfly.style.left = Math.random() * 100 + 'vw';
        butterfly.style.top = '-50px';

        // Random animation duration between 8-15s
        const duration = 8 + Math.random() * 7;
        butterfly.style.animationDuration = `${duration}s`;

        document.body.appendChild(butterfly);

        // Remove after animation
        setTimeout(() => butterfly.remove(), duration * 1000);
    };

    const startButterflies = () => {
        if (butterflyInterval) return;
        butterflyInterval = window.setInterval(createButterfly, 800);
    };

    const stopButterflies = () => {
        if (butterflyInterval) {
            clearInterval(butterflyInterval);
            butterflyInterval = null;
        }
    };

    return () => {
        enabled = !enabled;

        if (enabled) {
            console.log(
                `%c🦋 BUTTERFLY MODE ACTIVATED 🦋`,
                'color: #00aaff; font-size: 16px; font-weight: bold;'
            );

            startButterflies();
        } else {
            console.log(
                `%c🦋 Butterfly mode ended.`,
                'color: #888; font-size: 14px; font-weight: bold;'
            );

            stopButterflies();
        }
    };
})();

const butterflyStyle = document.createElement('style');
butterflyStyle.textContent = `
.butterfly-float {
  position: fixed;
  font-size: 2rem;
  pointer-events: none;
  z-index: 9999;
  animation: butterfly-float linear forwards;
}

@keyframes butterfly-float {
  0% {
    transform: translate(0, 0) rotate (0deg);
    opacity: 0;
  }
  10% {opacity: 1;}
  90% {opacity: 1;}
  100% {
    transform: translate(
      calc(var(--butterfly-x, 0) * 1vw),
      110vh
    ) rotate (360deg);
    opacity: 0;
  }
}
.butterfly-float:nth-child(odd) { --butterfly-x: 20; }
.butterfly-float:nth-child(even) { --butterfly-x: -20; }
`;
document.head.append(butterflyStyle);