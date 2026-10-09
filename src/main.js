import './index.css';
import { state, THEMES, STILL_WALLPAPERS, LIVE_WALLPAPERS } from './os/state.js';
import { windowManager } from './os/windowManager.js';
import { cloaker } from './os/cloaker.js';
import { spotlight } from './os/spotlight.js';

class ZenithOS {
  constructor() {
    this.wallpaperImg = null;
    this.wallpaperVideo = null;
    this.wallpaperOverlay = null;
    this.wallpaperVignette = null;
    this.wallpaperCanvas = null;
    this.canvasCtx = null;
    this.stars = [];
    this.activeMenu = null;
    this.selectedIcon = null;
  }

  boot() {
    windowManager.init();
    spotlight.init();

    this.wallpaperImg = document.getElementById('wallpaper-image');
    this.wallpaperVideo = document.getElementById('wallpaper-video');
    this.wallpaperOverlay = document.getElementById('wallpaper-overlay');
    this.wallpaperVignette = document.getElementById('wallpaper-vignette');
    this.wallpaperCanvas = document.getElementById('wallpaper-canvas');
    if (this.wallpaperCanvas) {
      this.canvasCtx = this.wallpaperCanvas.getContext('2d');
    }

    this.applyTheme(state.get('theme'));
    this.applyWallpaper();
    this.initCanvasStars();

    this.initClock();
    this.initTopBar();
    this.initDock();
    this.initDesktopIcons();
    this.initControlCenter();
    this.initContextMenu();
    this.initLockScreen();
    this.initKeyboardShortcuts();
    this.initParallax();

    state.subscribe((event) => {
      if (event === 'state') {
        this.applyTheme(state.get('theme'));
        this.applyWallpaper();
        this.updateClockUI();
        this.updateDesktopLayout();
      }
    });

    setTimeout(() => {
      this.launchApp('games');
      setTimeout(() => {
        this.launchApp('terminal');
      }, 250);
    }, 150);
  }

  applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.midnight;
    const accentColor = state.get('customAccent') || theme.accent;
    const transparency = state.get('glassTransparency') ?? 15;
    const accentTint = state.get('glassAccentTint');
    const root = document.documentElement;

    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-hover', accentColor);
    root.style.setProperty('--accent-glow', `${accentColor}66`);

    const alpha = (100 - transparency) / 100;
    const bgBase = accentTint ? accentColor : '#0a1020';
    root.style.setProperty('--glass-bg', `rgba(10, 16, 32, ${Math.max(0.4, alpha)})`);
    root.style.setProperty('--glass-header', `rgba(8, 14, 28, ${Math.max(0.6, alpha + 0.1)})`);

    const themeText = document.getElementById('theme-status-text');
    if (themeText) themeText.textContent = theme.name;
  }

  applyWallpaper() {
    const wpType = state.get('wallpaperType') || 'still';
    const blur = state.get('wallpaperBlur') ?? 0;
    const dim = state.get('wallpaperDim') ?? 15;
    const sat = state.get('wallpaperSaturation') ?? 100;
    const isVignette = state.get('wallpaperVignette');

    if (this.wallpaperVignette) {
      if (isVignette) this.wallpaperVignette.classList.add('active');
      else this.wallpaperVignette.classList.remove('active');
    }

    if (this.wallpaperOverlay) {
      this.wallpaperOverlay.style.backgroundColor = `rgba(0, 0, 0, ${dim / 100})`;
    }

    if (wpType === 'live') {
      const activeLiveId = state.get('activeLiveWallpaper') || 'night_coffee';
      const liveObj = LIVE_WALLPAPERS.find(l => l.id === activeLiveId) || LIVE_WALLPAPERS[0];

      if (this.wallpaperImg) {
        this.wallpaperImg.style.backgroundImage = `url("${liveObj.stillUrl}")`;
        this.wallpaperImg.style.filter = `blur(${blur}px) saturate(${sat}%)`;
      }

      if (this.wallpaperVideo) {
        this.wallpaperVideo.classList.remove('hidden');
        if (this.wallpaperVideo.src !== liveObj.videoUrl) {
          this.wallpaperVideo.src = liveObj.videoUrl;
        }
        this.wallpaperVideo.playbackRate = state.get('playbackSpeed') || 1.0;
        this.wallpaperVideo.style.filter = `blur(${blur}px) saturate(${sat}%)`;
        this.wallpaperVideo.play().catch(() => {});
      }

      const topLive = document.getElementById('topbar-live-wp');
      const topTitle = document.getElementById('topbar-live-title');
      if (topLive && state.get('menubarLiveWpControl')) {
        topLive.classList.remove('hidden');
        topLive.classList.add('flex');
        if (topTitle) topTitle.textContent = liveObj.title;
      }
    } else {
      if (this.wallpaperVideo) {
        this.wallpaperVideo.classList.add('hidden');
        this.wallpaperVideo.pause();
      }

      const stillUrl = state.get('wallpaperUrl') || STILL_WALLPAPERS[0].url;
      if (this.wallpaperImg) {
        this.wallpaperImg.style.backgroundImage = `url("${stillUrl}")`;
        this.wallpaperImg.style.filter = `blur(${blur}px) saturate(${sat}%)`;
      }

      const topLive = document.getElementById('topbar-live-wp');
      if (topLive) {
        topLive.classList.add('hidden');
        topLive.classList.remove('flex');
      }
    }

    const blurText = document.getElementById('blur-val-text');
    if (blurText) blurText.textContent = `${blur}px`;
    const dimText = document.getElementById('dim-val-text');
    if (dimText) dimText.textContent = `${dim}%`;

    const quickBlur = document.getElementById('quick-blur-slider');
    if (quickBlur) quickBlur.value = blur;
    const quickDim = document.getElementById('quick-dim-slider');
    if (quickDim) quickDim.value = dim;
  }

  initCanvasStars() {
    if (!this.wallpaperCanvas || !this.canvasCtx) return;

    const resize = () => {
      this.wallpaperCanvas.width = window.innerWidth;
      this.wallpaperCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.3 + 0.1
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

  initParallax() {
    window.addEventListener('mousemove', (e) => {
      if (!state.get('wallpaperParallax')) return;
      const xOffset = (e.clientX / window.innerWidth - 0.5) * -16;
      const yOffset = (e.clientY / window.innerHeight - 0.5) * -16;
      if (this.wallpaperImg) {
        this.wallpaperImg.style.transform = `scale(1.08) translate(${xOffset}px, ${yOffset}px)`;
      }
      if (this.wallpaperVideo) {
        this.wallpaperVideo.style.transform = `scale(1.08) translate(${xOffset}px, ${yOffset}px)`;
      }
    });
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      const is24h = state.get('menubar24h');
      const showSecs = state.get('menubarShowSeconds');
      const showDate = state.get('menubarShowDate');

      const topDate = document.getElementById('topbar-date');
      const topTime = document.getElementById('topbar-time');

      if (topDate) {
        topDate.style.display = showDate ? 'inline' : 'none';
        topDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      if (topTime) {
        topTime.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: showSecs ? '2-digit' : undefined,
          hour12: !is24h
        });
      }

      const clockWidget = document.getElementById('desktop-clock-widget');
      const centerTime = document.getElementById('desktop-clock-time');
      const centerDate = document.getElementById('desktop-clock-date');
      const greetingEl = document.getElementById('clock-greeting');

      if (centerTime) {
        const deskSecs = state.get('clockShowSeconds');
        let h = now.getHours();
        let m = String(now.getMinutes()).padStart(2, '0');
        let s = String(now.getSeconds()).padStart(2, '0');
        let ampm = '';

        if (!is24h) {
          ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
        }
        let formattedH = String(h).padStart(2, '0');
        centerTime.innerHTML = `${formattedH}:${m}${deskSecs ? `:${s}` : ''} <span class="text-2xl md:text-3xl font-medium opacity-80">${ampm}</span>`;
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
        if (hour >= 0 && hour < 5) greet = 'Still up?';
        greetingEl.textContent = greet;
      }

      const lockTime = document.getElementById('lock-time');
      const lockDate = document.getElementById('lock-date');
      if (lockTime) lockTime.textContent = topTime ? topTime.textContent : '';
      if (lockDate) lockDate.textContent = topDate ? topDate.textContent : '';
    };

    updateTime();
    setInterval(updateTime, 1000);

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
    const clockWidget = document.getElementById('desktop-clock-widget');
    if (!clockWidget) return;

    const mode = state.get('clockMode') || 'large';
    const pos = state.get('clockPosition') || 'centre';
    const hgt = state.get('clockHeight') || 'centre';
    const font = state.get('clockFont') || 'System default';
    const showGreeting = state.get('clockGreeting');

    clockWidget.className = `absolute inset-0 flex flex-col pointer-events-none z-0 select-none transition-opacity duration-300 clock-${mode} pos-${pos} height-${hgt}`;

    if (font !== 'System default') {
      clockWidget.style.fontFamily = `"${font}", sans-serif`;
    } else {
      clockWidget.style.fontFamily = '';
    }

    const greetingEl = document.getElementById('clock-greeting');
    if (greetingEl) {
      greetingEl.style.display = showGreeting ? 'block' : 'none';
    }

    const batEl = document.getElementById('battery-indicator');
    if (batEl) {
      batEl.style.display = state.get('menubarBatteryPct') ? 'flex' : 'none';
    }
  }

  updateDesktopLayout() {
    const zen = state.get('zenMode');
    const dockContainer = document.getElementById('dock-container');
    const topbar = document.getElementById('topbar');

    if (zen) {
      dockContainer?.classList.add('hidden-dock');
      topbar?.classList.add('hidden-bar');
    } else {
      dockContainer?.classList.remove('hidden-dock');
      topbar?.classList.remove('hidden-bar');
    }

    const showIcons = state.get('showDesktopIcons');
    const iconsLayer = document.getElementById('desktop-icons-layer');
    if (iconsLayer) {
      if (showIcons && !zen) iconsLayer.classList.remove('hidden-icons');
      else iconsLayer.classList.add('hidden-icons');
    }

    const dockSizePct = state.get('dockSize') || 90;
    const computedSize = Math.round(52 * (dockSizePct / 100));
    document.documentElement.style.setProperty('--dock-size', `${computedSize}px`);

    this.updateClockUI();
  }

  initDesktopIcons() {
    const layer = document.getElementById('desktop-icons-layer');
    if (!layer) return;

    const ICONS = [
      { id: 'files', title: 'Files', icon: 'fa-solid fa-folder-closed', color: 'from-amber-400 to-amber-600' },
      { id: 'games', title: 'Games Hub', icon: 'fa-solid fa-gamepad', color: 'from-purple-500 to-indigo-700' },
      { id: 'terminal', title: 'Terminal', icon: 'fa-solid fa-terminal', color: 'from-slate-800 to-slate-950 border border-white/10' },
      { id: 'browser', title: 'Browser', icon: 'fa-solid fa-globe', color: 'from-sky-400 to-blue-600' },
      { id: 'code', title: 'Zenith Code', icon: 'fa-solid fa-code', color: 'from-cyan-500 to-teal-700' },
      { id: 'music', title: 'Audio Lounge', icon: 'fa-solid fa-music', color: 'from-rose-500 to-pink-600' },
      { id: 'settings', title: 'Settings', icon: 'fa-solid fa-sliders', color: 'from-zinc-600 to-zinc-800 border border-white/10' }
    ];

    layer.innerHTML = '';
    ICONS.forEach(item => {
      const el = document.createElement('div');
      el.className = 'desktop-icon-item';
      el.innerHTML = `
        <div class="desktop-icon-img bg-gradient-to-br ${item.color}">
          <i class="${item.icon}"></i>
        </div>
        <div class="desktop-icon-label">${item.title}</div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.querySelectorAll('.desktop-icon-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedIcon = item.id;
      });

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.launchApp(item.id);
      });

      layer.appendChild(el);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-icon-item')) {
        layer.querySelectorAll('.desktop-icon-item').forEach(i => i.classList.remove('selected'));
        this.selectedIcon = null;
      }
    });

    this.updateDesktopLayout();
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        state.set('showDesktopIcons', !state.get('showDesktopIcons'));
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Z' || e.key === 'z')) {
        e.preventDefault();
        state.set('zenMode', !state.get('zenMode'));
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.get('zenMode')) return;
      const topbar = document.getElementById('topbar');
      const dockContainer = document.getElementById('dock-container');

      if (e.clientY < 36) {
        topbar?.classList.remove('hidden-bar');
      } else {
        topbar?.classList.add('hidden-bar');
      }

      if (e.clientY > window.innerHeight - 60) {
        dockContainer?.classList.remove('hidden-dock');
      } else {
        dockContainer?.classList.add('hidden-dock');
      }
    });
  }

  initTopBar() {
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

    document.addEventListener('click', () => {
      this.closeAllMenus();
    });

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleSystemAction(action);
        this.closeAllMenus();
      });
    });

    document.getElementById('topbar-audio-btn')?.addEventListener('click', () => this.launchApp('music'));

    document.getElementById('topbar-live-toggle')?.addEventListener('click', () => {
      if (this.wallpaperVideo) {
        if (this.wallpaperVideo.paused) {
          this.wallpaperVideo.play();
          document.getElementById('topbar-live-toggle').innerHTML = '<i class="fa-solid fa-pause text-[10px]"></i>';
        } else {
          this.wallpaperVideo.pause();
          document.getElementById('topbar-live-toggle').innerHTML = '<i class="fa-solid fa-play text-[10px]"></i>';
        }
      }
    });
  }

  closeAllMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.add('hidden'));
    this.activeMenu = null;
  }

  handleSystemAction(action) {
    switch (action) {
      case 'about':
      case 'settings':
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
      case 'toggle-icons':
        state.set('showDesktopIcons', !state.get('showDesktopIcons'));
        break;
      case 'toggle-clock':
        state.set('clockMode', state.get('clockMode') === 'off' ? 'large' : 'off');
        break;
      case 'cycle-wallpaper': {
        const curWp = state.get('wallpaperUrl');
        const idx = STILL_WALLPAPERS.findIndex(w => w.url === curWp);
        const next = STILL_WALLPAPERS[(idx + 1) % STILL_WALLPAPERS.length];
        state.set('wallpaperUrl', next.url);
        break;
      }
      case 'toggle-zen':
        state.set('zenMode', !state.get('zenMode'));
        break;
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
          item.style.transform = `scale(${factor}) translateY(-${(factor - 1) * 20}px)`;
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
          title: 'Settings',
          icon: 'fa-solid fa-sliders',
          width: 820,
          height: 580,
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

    const blurSlider = document.getElementById('quick-blur-slider');
    blurSlider?.addEventListener('input', (e) => {
      state.set('wallpaperBlur', parseInt(e.target.value, 10));
    });

    const dimSlider = document.getElementById('quick-dim-slider');
    dimSlider?.addEventListener('input', (e) => {
      state.set('wallpaperDim', parseInt(e.target.value, 10));
    });

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
      const cur = state.get('wallpaperType');
      const next = cur === 'live' ? 'still' : 'live';
      state.set('wallpaperType', next);
      const text = document.getElementById('live-wp-status-text');
      if (text) text.textContent = next === 'live' ? 'Live' : 'Still';
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

const os = new ZenithOS();
window.addEventListener('DOMContentLoaded', () => {
  os.boot();
});
