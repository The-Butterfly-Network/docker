// sudo_run.ts - System administration parody easter egg
(() => {
  let activeOverlay: HTMLDivElement | null = null;
  let activeAnimation: number | null = null;

  // Command registry with all the fun responses
  const commands: { [key: string]: () => void } = {
    // System Maintenance Parodies
    update: () => {
      showTerminal([
        'sudo_run(update)',
        'Updating packages and firmware...',
        '[████████████████████] 100%',
        '',
        'Done. Nothing actually changed, but we all feel better now.',
        'Installed: 0 packages',
        'Updated: 0 packages',
        'Improved: Your confidence'
      ], 'success');
    },

    clean: () => {
      showTerminal([
        'sudo_run(clean)',
        'Performing system cleanup...',
        'Scanning for unnecessary files...',
        '',
        'Found 2.3 TB of existential dread.',
        'Removing... Failed.',
        '',
        'Error: Existential dread is marked as essential system file.',
        'Cannot remove without breaking everything.'
      ], 'error');
    },

    defrag: () => {
      const lines = [
        'sudo_run(defrag)',
        'Defragmenting the website...',
        'Rearranging pixels alphabetically...',
        ''
      ];
      
      showProgressTerminal(lines, [
        'Processing A pixels... [██░░░░░░░░] 20%',
        'Processing M pixels... [████░░░░░░] 40%',
        'Processing P pixels... [██████░░░░] 60%',
        'Processing T pixels... [████████░░] 80%',
        'Processing Z pixels... [██████████] 100%',
        '',
        'Defragmentation complete!',
        'Website is now 0.001% more organized.'
      ]);
    },

    optimize: () => {
      showTerminal([
        'sudo_run(optimize)',
        'Running optimization algorithms...',
        'Compressing inefficiencies...',
        'Streamlining workflows...',
        'Removing redundant redundancies...',
        '',
        '✓ Optimization complete!',
        '',
        'You are now 3% more efficient. Probably.',
        '(Results may vary. No refunds.)'
      ], 'success');
    },

    reboot: () => {
      showFakeReboot();
    },

    // Developer Humor
    debug: () => {
      showTerminal([
        'sudo_run(debug)',
        'Enabling debug mode...',
        '',
        '⚠️  WARNING: You will now see how messy things truly are.',
        '',
        'stack_overflow_errors: 47',
        'todo_comments: 128',
        'console_logs_left_in_prod: 89',
        'copy_pasted_code: Yes',
        'understanding_of_code: Questionable',
        '',
        'Debug mode: ENABLED',
        'Your sanity: ENDANGERED'
      ], 'warning');
    },

    commit: () => {
      showTerminal([
        'sudo_run(commit)',
        '',
        'Please enter commit message:',
        '> Fixed stuff.',
        '',
        'Commit message accepted.',
        '',
        '[main 3a7f891] Fixed stuff.',
        ' 247 files changed, 18924 insertions(+), 3 deletions(-)',
        '',
        '"Fixed stuff" - The most honest commit message ever written.'
      ], 'success');
    },

    push: () => {
      showDangerousOperation('push');
    },

    stackoverflow: () => {
      showTerminal([
        'sudo_run(stackoverflow)',
        'Searching StackOverflow for solutions...',
        '',
        'Found: "How to fix everything" [CLOSED AS DUPLICATE]',
        'Redirecting to: "How to fix anything" [ALSO CLOSED]',
        '',
        '...Found working solution from 2009.',
        'Copying... Pasting... Testing...',
        '',
        '✓ It works!',
        'Taking all the credit...',
        '',
        'Remember: You are a 10x developer now.'
      ], 'success');
    },

    format: () => {
      showFakeFormat();
    },

    // Sysadmin / Linux Jokes
    chown_me: () => {
      showTerminal([
        'sudo_run(chown_me)',
        'Taking ownership of the situation...',
        '',
        'chown: changing ownership of \'life\'',
        'chown: changing ownership of \'responsibilities\'',
        'chown: changing ownership of \'consequences\'',
        '',
        '✓ You now own this.',
        '',
        'With great power comes great... oh no.',
        'What have you done?'
      ], 'success');
    },

    apt_get_coffee: () => {
      showTerminal([
        'sudo_run(apt_get_coffee)',
        'Reading package lists... Done',
        'Building dependency tree... Done',
        'The following NEW packages will be installed:',
        '  coffee caffeine energy motivation',
        '',
        'Fetching coffee from repository...',
        '',
        'ERROR 418: I\'m a teapot.',
        '',
        'The requested entity body is short and stout.',
        'Tip me over and pour me out.'
      ], 'error', '☕');
    },

    rm_rf: () => {
      showDangerousOperation('rm_rf');
    },

    killall: () => {
      showTerminal([
        'Terminating all processes...',
        '',
        'Killed: bad-vibes-daemon',
        'Killed: negativity-service',
        'Killed: self-doubt-process',
        'Killed: imposter-syndrome',
        'Killed: monday-morning-feeling',
        '',
        '✓ All bad vibes terminated.',
        '',
        'You feel lighter somehow.',
        'Today might actually be a good day.'
      ], 'success');
    },

    top: () => {
      showFakeTop();
    },

    // User-Focused Goofs
    eval_me: () => {
      showTerminal([
        'Evaluating user...',
        '',
        'Running diagnostics...',
        'Analyzing vibe... ✓',
        'Checking coolness factor... ✓',
        'Measuring awesomeness... ✓',
        '',
        '═══════════════════════════',
        '     EVALUATION COMPLETE',
        '═══════════════════════════',
        '',
        'Overall Score: 10/10',
        '',
        'You are doing great.',
        'Seriously. Keep it up. 💖'
      ], 'success');
    },

    motivate: () => {
      const motivations = [
        'You got this! 💪',
        'Believe in yourself! ✨',
        'Today is your day! 🌟',
        'You\'re crushing it! 🎯',
        'Keep being awesome! 🚀',
        'You\'re doing amazing! 🌈',
        'Nothing can stop you! ⚡',
        'You\'re unstoppable! 🔥'
      ];
      
      const motivation = motivations[Math.floor(Math.random() * motivations.length)];
      
      showTerminal([
        'sudo_run(motivate)',
        'Generating motivation...',
        '',
        '╔════════════════════════════╗',
        `  ${motivation}`,
        '╚════════════════════════════╝',
        '',
        'Motivation level: MAXIMUM',
        'Confidence boost: APPLIED',
        '',
        'Now go forth and conquer!'
      ], 'success');
    },

    password_reset: () => {
      showTerminal([
        'sudo_run(password_reset)',
        'Resetting password...',
        '',
        'Generating secure password...',
        'Applying industry-standard encryption...',
        'Verifying password strength...',
        '',
        '✓ Password successfully reset!',
        '',
        'New password: *******',
        '(It\'s hunter2, but you can only see *******)',
        '',
        'Please write this down somewhere secure.',
        'Like a sticky note on your monitor.'
      ], 'success');
    },

    // Fake Danger, Zero Real Danger
    overclock: () => {
      showOverclock();
    },

    launch_missiles: () => {
      showTerminal([
        'Connecting to missile control...',
        '',
        'ERROR: Unable to contact missile control.',
        'ERROR: Missiles not found.',
        'ERROR: This is a website, not a military installation.',
        '',
        'SUGGESTION: Maybe take a walk instead?',
        'Fresh air is nice. Birds are cool.',
        'Highly recommend touching grass.',
        '',
        'Launch sequence: ABORTED',
        'World peace: MAINTAINED'
      ], 'error', '🚀');
    },

    format_internet: () => {
      showTerminal([
        '',
        '⚠️  WARNING: You are about to format the ENTIRE INTERNET',
        '',
        'This will delete:',
        '  - All websites (including this one)',
        '  - All cat videos',
        '  - All memes',
        '  - Stack Overflow (the horror!)',
        '  - Your browser history (actually, that might be good)',
        '',
        'Estimated time: Several eternities',
        'Chance of success: 0%',
        'Reason to do this: None',
        '',
        'Operation cancelled for your own good.',
        'The internet thanks you.'
      ], 'error');
    }
  };

  // Terminal display function
  function showTerminal(lines: string[], type: 'success' | 'error' | 'warning' = 'success', icon?: string) {
    clearActive();
    
    const overlay = createOverlay();
    const terminal = document.createElement('div');
    terminal.className = 'sudo-terminal';
    
    const typeClass = `sudo-terminal-${type}`;
    terminal.classList.add(typeClass);
    
    if (icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'sudo-terminal-icon';
      iconEl.textContent = icon;
      terminal.appendChild(iconEl);
    }
    
    const content = document.createElement('div');
    content.className = 'sudo-terminal-content';
    
    lines.forEach((line, index) => {
      setTimeout(() => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        content.appendChild(lineEl);
        content.scrollTop = content.scrollHeight;
      }, index * 100);
    });
    
    terminal.appendChild(content);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sudo-terminal-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => clearActive();
    terminal.appendChild(closeBtn);
    
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  // Progress terminal for animated commands
  function showProgressTerminal(initialLines: string[], progressLines: string[]) {
    clearActive();
    
    const overlay = createOverlay();
    const terminal = document.createElement('div');
    terminal.className = 'sudo-terminal sudo-terminal-success';
    
    const content = document.createElement('div');
    content.className = 'sudo-terminal-content';
    
    initialLines.forEach(line => {
      const lineEl = document.createElement('div');
      lineEl.textContent = line;
      content.appendChild(lineEl);
    });
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'sudo-progress-container';
    content.appendChild(progressContainer);
    
    terminal.appendChild(content);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sudo-terminal-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => clearActive();
    terminal.appendChild(closeBtn);
    
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
    
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < progressLines.length) {
        if (progressContainer.children.length > 0) {
          progressContainer.removeChild(progressContainer.lastChild!);
        }
        const lineEl = document.createElement('div');
        lineEl.textContent = progressLines[lineIndex];
        progressContainer.appendChild(lineEl);
        lineIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  }

  // Fake reboot animation
  function showFakeReboot() {
    clearActive();
    
    const overlay = createOverlay();
    overlay.style.background = '#000';
    
    const rebootText = document.createElement('div');
    rebootText.className = 'sudo-reboot-text';
    rebootText.innerHTML = `
      <div>Rebooting system...</div>
      <div class="sudo-dots">...</div>
    `;
    
    overlay.appendChild(rebootText);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
    
    setTimeout(() => {
      rebootText.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">😏</div>
        <div>jk, I would never.</div>
        <div style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.7;">
          Did you really think I'd reboot your session?
        </div>
      `;
      
      setTimeout(() => clearActive(), 3000);
    }, 2000);
  }

  // Fake format warning
  function showFakeFormat() {
    clearActive();
    
    const overlay = createOverlay();
    const terminal = document.createElement('div');
    terminal.className = 'sudo-terminal sudo-terminal-error sudo-terminal-shake';
    
    terminal.innerHTML = `
      <div class="sudo-terminal-content">
        <div>sudo_run(format)</div>
        <div></div>
        <div>⚠️  CRITICAL WARNING ⚠️</div>
        <div></div>
        <div>Formatting drive C:\...</div>
        <div>This will delete EVERYTHING.</div>
        <div></div>
        <div>Just kidding.</div>
        <div>Please don't leave. 🥺</div>
        <div></div>
        <div>I promise I'll be good.</div>
      </div>
      <button class="sudo-terminal-close">✕</button>
    `;
    
    terminal.querySelector('.sudo-terminal-close')!.addEventListener('click', () => clearActive());
    
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  // Dangerous operation warnings
  function showDangerousOperation(type: string) {
    const messages = {
      push: {
        title: 'sudo_run(push)',
        lines: [
          'Pushing to production...',
          '',
          'Wait...',
          'Oh no...',
          'Did you mean to do that?',
          '',
          '⚠️  Changes deployed to production!',
          '',
          'Just kidding. Nothing happened.',
          'But imagine if it did.',
          '',
          'Always double-check before pushing. 😅'
        ]
      },
      rm_rf: {
        title: 'sudo_run(rm_rf)',
        lines: [
          'Attempting recursive deletion...',
          '',
          'rm -rf /*',
          '',
          'Deleting /',
          'Deleting /home',
          'Deleting /var',
          'Deleting /usr',
          '',
          '...Site sprints away in terror.',
          '',
          'ERROR: Permission denied.',
          'Site escaped safely.',
          '',
          'Please use your power responsibly.'
        ]
      }
    };
    
    const msg = messages[type as keyof typeof messages];
    if (msg) {
      showTerminal([msg.title, '', ...msg.lines], 'error');
    }
  }

  // Fake top command
  function showFakeTop() {
    clearActive();
    
    const overlay = createOverlay();
    const terminal = document.createElement('div');
    terminal.className = 'sudo-terminal sudo-terminal-success sudo-top-display';
    
    const processes = [
      { name: 'procrastinationd', cpu: '89.2', mem: '47.3' },
      { name: 'cat-videos', cpu: '76.8', mem: '23.1' },
      { name: 'coffee-daemon', cpu: '12.4', mem: '8.9' },
      { name: 'existential-dread', cpu: '45.6', mem: '67.2' },
      { name: 'tab-hoarder', cpu: '98.1', mem: '91.4' },
      { name: 'todo-list-ignorer', cpu: '34.2', mem: '12.7' },
      { name: 'deadline-approaching', cpu: '100.0', mem: '100.0' },
      { name: 'stackoverflow-crawler', cpu: '23.5', mem: '15.8' }
    ];
    
    terminal.innerHTML = `
      <div class="sudo-terminal-content">
        <div>sudo_run(top)</div>
        <div></div>
        <div>PID  COMMAND              %CPU  %MEM</div>
        <div>───────────────────────────────────</div>
        ${processes.map((p, i) => 
          `<div>${String(1000 + i).padEnd(5)}${p.name.padEnd(20)}${p.cpu.padEnd(6)}${p.mem}</div>`
        ).join('')}
        <div></div>
        <div>Press 'q' to quit (or just close this)</div>
      </div>
      <button class="sudo-terminal-close">✕</button>
    `;
    
    terminal.querySelector('.sudo-terminal-close')!.addEventListener('click', () => clearActive());
    
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  // Overclock animation
  function showOverclock() {
    clearActive();
    
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="sudo-overclock">
        <div class="sudo-overclock-text">OVERCLOCKING...</div>
        <div class="sudo-overclock-speed">LUDICROUS SPEED</div>
        <div class="sudo-stars"></div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.classList.add('sudo-overclocked');
    activeOverlay = overlay;
    
    setTimeout(() => {
      clearActive();
      document.body.classList.remove('sudo-overclocked');
    }, 3000);
  }

  // Helper functions
  function createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'sudo-overlay';
    overlay.onclick = (e) => {
      if (e.target === overlay) clearActive();
    };
    return overlay;
  }

  function clearActive() {
    if (activeOverlay) {
      activeOverlay.remove();
      activeOverlay = null;
    }
    if (activeAnimation) {
      cancelAnimationFrame(activeAnimation);
      activeAnimation = null;
    }
  }

  // Main sudo_run function
  (window as any).sudo_run = (command?: string) => {
    if (!command || typeof command !== 'string') {
      console.log(`%c
┌─────────────────────────────────────────────┐
│   sudo_run() - System Administration Tool   │
└─────────────────────────────────────────────┘

Usage: sudo_run('command')  ← Note the quotes!

Available commands:

📦 System Maintenance:
  'update', 'clean', 'defrag', 'optimize', 'reboot'

💻 Developer Tools:
  'debug', 'commit', 'push', 'stackoverflow', 'format'

🔧 Sysadmin:
  'chown_me', 'apt_get_coffee', 'rm_rf', 'killall', 'top'

😊 User Tools:
  'eval_me', 'motivate', 'password_reset'

⚠️  Dangerous (but safe):
  'overclock', 'launch_missiles', 'format_internet'

Examples:
  sudo_run('motivate')
  sudo_run('debug')
  sudo_run('overclock')
`, 'color: #0f0; font-family: monospace;');
      return;
    }

    const cmd = command.toLowerCase().replace(/-/g, '_');
    
    if (commands[cmd]) {
      console.log(`%cExecuting: sudo_run('${command}')`, 'color: #0f0; font-weight: bold;');
      commands[cmd]();
    } else {
      console.log(`%c
Command not found: "${command}"

Did you mean one of these?
  ${Object.keys(commands).slice(0, 5).map(c => `'${c}'`).join(', ')}...

Type sudo_run() to see all available commands.

Remember to use quotes: sudo_run('command')
`, 'color: #f00; font-family: monospace;');
    }
  };

  // CSS Styles
  const sudoStyle = document.createElement('style');
  sudoStyle.textContent = `
    .sudo-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
      z-index: 999999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: sudo-fade-in 0.2s ease;
    }

    @keyframes sudo-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sudo-terminal {
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      font-family: 'Courier New', monospace;
      color: #0f0;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
      animation: sudo-terminal-appear 0.3s ease;
    }

    @keyframes sudo-terminal-appear {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .sudo-terminal-success {
      border-color: #0f0;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }

    .sudo-terminal-error {
      border-color: #f00;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
      color: #f00;
    }

    .sudo-terminal-warning {
      border-color: #ff0;
      box-shadow: 0 0 20px rgba(255, 255, 0, 0.3);
      color: #ff0;
    }

    .sudo-terminal-shake {
      animation: sudo-shake 0.5s infinite;
    }

    @keyframes sudo-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .sudo-terminal-content {
      max-height: 60vh;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .sudo-terminal-content > div {
      margin: 4px 0;
    }

    .sudo-terminal-icon {
      text-align: center;
      font-size: 48px;
      margin-bottom: 16px;
    }

    .sudo-terminal-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #333;
      border: 1px solid #555;
      color: #fff;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sudo-terminal-close:hover {
      background: #555;
      transform: rotate(90deg);
    }

    .sudo-progress-container {
      margin-top: 10px;
    }

    .sudo-reboot-text {
      text-align: center;
      color: #0f0;
      font-family: monospace;
      font-size: 24px;
      animation: sudo-pulse 1.5s infinite;
    }

    @keyframes sudo-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .sudo-dots {
      display: inline-block;
      animation: sudo-dots 1.5s infinite;
    }

    @keyframes sudo-dots {
      0% { content: ''; }
      25% { content: '.'; }
      50% { content: '..'; }
      75% { content: '...'; }
    }

    .sudo-top-display .sudo-terminal-content {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .sudo-overclock {
      text-align: center;
      color: #fff;
      font-family: monospace;
    }

    .sudo-overclock-text {
      font-size: 48px;
      font-weight: bold;
      animation: sudo-glitch 0.3s infinite;
    }

    .sudo-overclock-speed {
      font-size: 72px;
      font-weight: bold;
      margin: 20px 0;
      background: linear-gradient(45deg, #f0f, #0ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: sudo-rainbow 1s linear infinite;
    }

    @keyframes sudo-glitch {
      0%, 100% { transform: translate(0); }
      25% { transform: translate(-2px, 2px); }
      50% { transform: translate(2px, -2px); }
      75% { transform: translate(-2px, -2px); }
    }

    @keyframes sudo-rainbow {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }

    .sudo-stars {
      position: fixed;
      inset: 0;
      background: transparent;
      pointer-events: none;
    }

    body.sudo-overclocked {
      animation: sudo-speed 0.1s infinite;
    }

    @keyframes sudo-speed {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(2px); }
    }

    /* Scrollbar styling for terminal */
    .sudo-terminal-content::-webkit-scrollbar {
      width: 8px;
    }

    .sudo-terminal-content::-webkit-scrollbar-track {
      background: #1a1a1a;
    }

    .sudo-terminal-content::-webkit-scrollbar-thumb {
      background: #0f0;
      border-radius: 4px;
    }

    .sudo-terminal-error .sudo-terminal-content::-webkit-scrollbar-thumb {
      background: #f00;
    }

    .sudo-terminal-warning .sudo-terminal-content::-webkit-scrollbar-thumb {
      background: #ff0;
    }
  `;
  document.head.appendChild(sudoStyle);
})();