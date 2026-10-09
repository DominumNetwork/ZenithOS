/**
 * ZenithOS Core Bootloader & Desktop Conductor
 * Pure Vanilla JavaScript Architecture - Zero React, Zero TypeScript
 */

import { state, THEMES, WALLPAPERS } from './os/state.js';
import { windowManager } from './os/windowManager.js';
import { cloaker } from './os/cloaker.js';
import { spotlight } from './os/spotlight.js';

class ZenithOS {
  constructor() {
    this.wallpaperImg = null;
    this.wallpaperOverlay = null;
    this.wallpaperCanvas = null;
    this.canvasCtx = null;
    this.stars = [];
    this.activeMenu = null;
  }

  boot() {
    // 1. Initialize Window Manager & Global Subsystems
    windowManager.init();
    spotlight.init();

    // 2. DOM element references
    this.wallpaperImg = document.getElementById('wallpaper-image');
    this.wallpaperOverlay = document.getElementById('wallpaper-overlay');
    this.wallpaperCanvas = document.getElementById('wallpaper-canvas');
    if (this.wallpaperCanvas) {
      this.canvasCtx = this.wallpaperCanvas.getContext('2d');
    }

    // 3. Apply initial theme and wallpapers
    this.applyTheme(state.get('theme'));
    this.applyWallpaper();
    this.initCanvasStars();

    // 4. Initialize desktop subsystems
    this.initClock();
    this.initTopBar();
    this.initDock();
    this.initControlCenter();
    this.initContextMenu();
    this.initLockScreen();

    // 5. Subscribe to reactive state updates
    state.subscribe((event) => {
      if (event === 'state') {
        this.applyTheme(state.get('theme'));
        this.applyWallpaper();
        this.updateClockUI();
      }
    });

    // 6. Launch default startup windows (Games Hub & Terminal)
    setTimeout(() => {
      this.launchApp('games');
      setTimeout(() => {
        this.launchApp('terminal');
      }, 250);
    }, 150);
  }

  applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.zenith;
    const root = document.documentElement;

    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--accent-glow', theme.accentGlow);
    root.style.setProperty('--glass-bg', theme.glassBg);
    root.style.setProperty('--glass-border', theme.glassBorder);
    root.style.setProperty('--glass-header', theme.glassHeader);

    const themeText = document.getElementById('theme-status-text');
    if (themeText) themeText.textContent = theme.name.split(' ')[0];
  }

  applyWallpaper() {
    const url = state.get('wallpaperUrl') || WALLPAPERS[0].url;
    const blur = state.get('wallpaperBlur') ?? 16;
    const dim = state.get('wallpaperDim') ?? 25;

    if (this.wallpaperImg) {
      this.wallpaperImg.style.backgroundImage = `url("${url}")`;
      this.wallpaperImg.style.filter = `blur(${blur}px)`;
    }

    if (this.wallpaperOverlay) {
      this.wallpaperOverlay.style.backgroundColor = `rgba(0, 0, 0, ${dim / 100})`;
    }

    const blurText = document.getElementById('blur-val-text');
    if (blurText) blurText.textContent = `${blur}px`;
    const dimText = document.getElementById('dim-val-text');
    if (dimText) dimText.textContent = `${dim}%`;

    const quickBlurSlider = document.getElementById('quick-blur-slider');
    if (quickBlurSlider) quickBlurSlider.value = blur;
    const quickDimSlider = document.getElementById('quick-dim-slider');
    if (quickDimSlider) quickDimSlider.value = dim;
  }

  initCanvasStars() {
    if (!this.wallpaperCanvas || !this.canvasCtx) return;

    const resize = () => {
      this.wallpaperCanvas.width = window.innerWidth;
      this.wallpaperCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    this.stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.4 + 0.1
    }));

    const animate = () => {
      const mode = state.get('liveWallpaper');
      if (mode === 'stars') {
        this.canvasCtx.clearRect(0, 0, this.wallpaperCanvas.width, this.wallpaperCanvas.height);
        this.canvasCtx.fillStyle = '#ffffff';

        this.stars.forEach(s => {
          s.y -= s.speed;
          if (s.y < 0) {
            s.y = this.wallpaperCanvas.height;
            s.x = Math.random() * this.wallpaperCanvas.width;
          }

          this.canvasCtx.globalAlpha = s.alpha * (Math.sin(Date.now() * 0.002 + s.x) * 0.3 + 0.7);
          this.canvasCtx.beginPath();
          this.canvasCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          this.canvasCtx.fill();
        });
      } else {
        this.canvasCtx.clearRect(0, 0, this.wallpaperCanvas.width, this.wallpaperCanvas.height);
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      const is24h = state.get('clockFormat24h');
      const showSecs = state.get('clockShowSeconds');

      // Topbar clock
      const topDate = document.getElementById('topbar-date');
      const topTime = document.getElementById('topbar-time');

      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      let timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: showSecs ? '2-digit' : undefined,
        hour12: !is24h
      });

      if (topDate) topDate.textContent = dateStr;
      if (topTime) topTime.textContent = timeStr;

      // Desktop Center Clock
      const centerTime = document.getElementById('desktop-clock-time');
      const centerDate = document.getElementById('desktop-clock-date');
      const greetingEl = document.getElementById('clock-greeting');

      if (centerTime) {
        let h = now.getHours();
        let m = String(now.getMinutes()).padStart(2, '0');
        let s = String(now.getSeconds()).padStart(2, '0');
        let ampm = '';

        if (!is24h) {
          ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
        }
        let formattedH = String(h).padStart(2, '0');

        centerTime.innerHTML = `${formattedH}:${m}${showSecs ? `:${s}` : ''} <span class="text-2xl md:text-3xl font-medium opacity-80">${ampm}</span>`;
      }

      if (centerDate) {
        centerDate.textContent = now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }

      if (greetingEl) {
        const hour = now.getHours();
        let greet = 'Good evening';
        if (hour < 12) greet = 'Good morning';
        else if (hour < 18) greet = 'Good afternoon';
        greetingEl.textContent = `${greet}, User`;
      }

      // Lock Screen time
      const lockTime = document.getElementById('lock-time');
      const lockDate = document.getElementById('lock-date');
      if (lockTime) lockTime.textContent = timeStr;
      if (lockDate) lockDate.textContent = dateStr;
    };

    updateTime();
    setInterval(updateTime, 1000);

    // Battery API check
    if (navigator.getBattery) {
      navigator.getBattery().then(bat => {
        const updateBat = () => {
          const pct = Math.round(bat.level * 100);
          const el = document.getElementById('battery-pct');
          if (el) el.textContent = `${pct}%`;
        };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
      }).catch(() => {});
    }
  }

  updateClockUI() {
    const showClock = state.get('showDesktopClock');
    const clockWidget = document.getElementById('desktop-clock-widget');
    if (clockWidget) {
      clockWidget.style.display = showClock ? 'flex' : 'none';
    }
    const greetingEl = document.getElementById('clock-greeting');
    if (greetingEl) {
      greetingEl.style.display = state.get('clockGreeting') ? 'block' : 'none';
    }
  }

  initTopBar() {
    // Menu Dropdown handling
    document.querySelectorAll('.menu-dropdown-container').forEach(container => {
      const btn = container.querySelector('button');
      const dropdown = container.querySelector('.menu-dropdown');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dropdown.classList.contains('hidden');
        this.closeAllMenus();
        if (isHidden) {
          dropdown.classList.remove('hidden');
          this.activeMenu = dropdown;
        }
      });
    });

    // Close menus when clicking outside
    document.addEventListener('click', () => {
      this.closeAllMenus();
    });

    // Menu Item Actions
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleSystemAction(action);
        this.closeAllMenus();
      });
    });

    // Topbar Audio button opens Audio Lounge
    const audioBtn = document.getElementById('topbar-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.launchApp('music'));
    }
  }

  closeAllMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.add('hidden'));
    this.activeMenu = null;
  }

  handleSystemAction(action) {
    switch (action) {
      case 'about':
        this.launchApp('settings');
        break;
      case 'settings':
        this.launchApp('settings');
        break;
      case 'cloaker':
        this.launchApp('settings');
        break;
      case 'spotlight':
        spotlight.open();
        break;
      case 'open-files':
        this.launchApp('files');
        break;
      case 'open-terminal':
        this.launchApp('terminal');
        break;
      case 'open-code':
        this.launchApp('code');
        break;
      case 'open-games':
        this.launchApp('games');
        break;
      case 'open-browser':
        this.launchApp('browser');
        break;
      case 'open-music':
        this.launchApp('music');
        break;
      case 'close-active-window':
        if (windowManager.activeWindowId) {
          windowManager.closeWindow(windowManager.activeWindowId);
        }
        break;
      case 'toggle-clock':
        state.set('showDesktopClock', !state.get('showDesktopClock'));
        break;
      case 'cycle-wallpaper': {
        const curWp = state.get('wallpaperUrl');
        const idx = WALLPAPERS.findIndex(w => w.url === curWp);
        const next = WALLPAPERS[(idx + 1) % WALLPAPERS.length];
        state.set('wallpaperUrl', next.url);
        break;
      }
      case 'toggle-wallpaper-blur': {
        const cur = state.get('wallpaperBlur');
        state.set('wallpaperBlur', cur === 0 ? 16 : 0);
        break;
      }
      case 'minimize-all':
        windowManager.minimizeAll();
        break;
      case 'restore-all':
        windowManager.restoreAll();
        break;
      case 'cascade-windows':
        windowManager.cascadeWindows();
        break;
      case 'close-all':
        windowManager.closeAll();
        break;
      case 'toggle-fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
      case 'lock':
        document.getElementById('lock-screen')?.classList.remove('hidden');
        break;
      case 'restart':
        window.location.reload();
        break;
    }
  }

  initDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;

    // Magnification Physics on mouse movement
    dock.addEventListener('mousemove', (e) => {
      if (!state.get('dockMagnification')) return;
      const items = dock.querySelectorAll('.dock-item');
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - itemCenter);
        const maxDist = 120;
        if (dist < maxDist) {
          const factor = 1 + (1 - dist / maxDist) * 0.32;
          item.style.transform = `scale(${factor}) translateY(-${(factor - 1) * 22}px)`;
        } else {
          item.style.transform = 'scale(1) translateY(0)';
        }
      });
    });

    dock.addEventListener('mouseleave', () => {
      dock.querySelectorAll('.dock-item').forEach(item => {
        item.style.transform = 'scale(1) translateY(0)';
      });
    });

    // Dock click handlers
    dock.querySelectorAll('.dock-item').forEach(item => {
      item.addEventListener('click', () => {
        const app = item.dataset.app;
        if (app === 'spotlight') {
          spotlight.toggle();
        } else if (app) {
          this.launchApp(app);
        }
      });
    });
  }

  launchApp(appName) {
    const existing = windowManager.windows.get(appName);
    if (existing) {
      if (existing.minimized) {
        windowManager.restoreWindow(appName);
      } else {
        windowManager.bringToFront(appName);
      }
      return;
    }

    switch (appName) {
      case 'games':
        windowManager.createWindow({
          id: 'games',
          title: 'Games Hub',
          icon: 'fa-solid fa-gamepad',
          width: 980,
          height: 620,
          onInit: (b, w, ws) => import('./os/gamesApp.js').then(m => m.createGamesApp(b, ws))
        });
        break;

      case 'terminal':
        windowManager.createWindow({
          id: 'terminal',
          title: 'Zenith Terminal',
          icon: 'fa-solid fa-terminal',
          width: 760,
          height: 460,
          onInit: (b, w, ws) => import('./os/terminal.js').then(m => m.createTerminalApp(b, ws))
        });
        break;

      case 'files':
        windowManager.createWindow({
          id: 'files',
          title: 'File Explorer',
          icon: 'fa-solid fa-folder-closed',
          width: 840,
          height: 520,
          onInit: (b, w, ws) => import('./os/fileManager.js').then(m => m.createFileManagerApp(b, ws))
        });
        break;

      case 'code':
        windowManager.createWindow({
          id: 'code',
          title: 'Zenith Code',
          icon: 'fa-solid fa-code',
          width: 900,
          height: 580,
          onInit: (b, w, ws) => import('./os/codeStudio.js').then(m => m.createCodeStudioApp(b, ws))
        });
        break;

      case 'browser':
        windowManager.createWindow({
          id: 'browser',
          title: 'Web Browser',
          icon: 'fa-solid fa-globe',
          width: 920,
          height: 580,
          onInit: (b, w, ws) => import('./os/browserApp.js').then(m => m.createBrowserApp(b, ws))
        });
        break;

      case 'music':
        windowManager.createWindow({
          id: 'music',
          title: 'Audio Lounge',
          icon: 'fa-solid fa-music',
          width: 680,
          height: 480,
          onInit: (b, w, ws) => import('./os/musicPlayer.js').then(m => m.createMusicPlayerApp(b, ws))
        });
        break;

      case 'settings':
        windowManager.createWindow({
          id: 'settings',
          title: 'System Settings',
          icon: 'fa-solid fa-sliders',
          width: 780,
          height: 540,
          onInit: (b, w, ws) => import('./os/settingsApp.js').then(m => m.createSettingsApp(b, ws))
        });
        break;
    }
  }

  initControlCenter() {
    const cc = document.getElementById('control-center');
    const toggleBtn = document.getElementById('control-center-toggle');
    const closeBtn = document.getElementById('close-control-center');

    if (!cc || !toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cc.classList.toggle('hidden');
    });

    closeBtn?.addEventListener('click', () => cc.classList.add('hidden'));

    document.addEventListener('click', (e) => {
      if (!cc.contains(e.target) && e.target !== toggleBtn) {
        cc.classList.add('hidden');
      }
    });

    // Control center sliders
    const blurSlider = document.getElementById('quick-blur-slider');
    blurSlider?.addEventListener('input', (e) => {
      state.set('wallpaperBlur', parseInt(e.target.value, 10));
    });

    const dimSlider = document.getElementById('quick-dim-slider');
    dimSlider?.addEventListener('input', (e) => {
      state.set('wallpaperDim', parseInt(e.target.value, 10));
    });

    // Control center quick toggles
    document.getElementById('toggle-cloak-btn')?.addEventListener('click', () => {
      const cur = state.get('activeCloak');
      state.set('activeCloak', cur === 'none' ? 'classroom' : 'none');
    });

    document.getElementById('toggle-theme-btn')?.addEventListener('click', () => {
      const themes = Object.keys(THEMES);
      const curIdx = themes.indexOf(state.get('theme'));
      const next = themes[(curIdx + 1) % themes.length];
      state.set('theme', next);
    });

    document.getElementById('toggle-mute-btn')?.addEventListener('click', () => {
      const cur = state.get('soundMuted');
      state.set('soundMuted', !cur);
      const text = document.getElementById('audio-status-text');
      if (text) text.textContent = !cur ? 'Muted' : 'Active';
    });

    document.getElementById('toggle-live-wp-btn')?.addEventListener('click', () => {
      const cur = state.get('liveWallpaper');
      const next = cur === 'stars' ? 'none' : 'stars';
      state.set('liveWallpaper', next);
      const text = document.getElementById('live-wp-status-text');
      if (text) text.textContent = next === 'stars' ? 'On' : 'Off';
    });

    document.getElementById('quick-open-settings')?.addEventListener('click', () => {
      cc.classList.add('hidden');
      this.launchApp('settings');
    });
  }

  initContextMenu() {
    const cm = document.getElementById('context-menu');
    const workspace = document.getElementById('workspace');

    if (!cm || !workspace) return;

    workspace.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.zenith-window') || e.target.closest('#dock-container')) return;
      e.preventDefault();

      let x = e.clientX;
      let y = e.clientY;

      if (x + 220 > window.innerWidth) x = window.innerWidth - 225;
      if (y + 240 > window.innerHeight) y = window.innerHeight - 245;

      cm.style.left = `${x}px`;
      cm.style.top = `${y}px`;
      cm.classList.remove('hidden');
    });

    document.addEventListener('click', () => {
      cm.classList.add('hidden');
    });

    cm.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', () => {
        this.handleSystemAction(item.dataset.action);
        cm.classList.add('hidden');
      });
    });
  }

  initLockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    const unlockBtn = document.getElementById('unlock-btn');

    unlockBtn?.addEventListener('click', () => {
      lockScreen?.classList.add('hidden');
    });
  }
}

// Instantiate and boot ZenithOS
const os = new ZenithOS();
window.addEventListener('DOMContentLoaded', () => {
  os.boot();
});
