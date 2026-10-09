export const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    accent: '#38bdf8',
    accentHover: '#0ea5e9',
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    glassBg: 'rgba(10, 16, 32, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHeader: 'rgba(8, 14, 28, 0.92)'
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith',
    accent: '#7c5cff',
    accentHover: '#6a48f5',
    accentGlow: 'rgba(124, 92, 255, 0.4)',
    glassBg: 'rgba(15, 23, 42, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHeader: 'rgba(13, 20, 38, 0.92)'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    accent: '#10b981',
    accentHover: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    glassBg: 'rgba(6, 20, 20, 0.85)',
    glassBorder: 'rgba(16, 185, 129, 0.25)',
    glassHeader: 'rgba(4, 18, 18, 0.92)'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber',
    accent: '#f59e0b',
    accentHover: '#d97706',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    glassBg: 'rgba(28, 18, 12, 0.85)',
    glassBorder: 'rgba(245, 158, 11, 0.2)',
    glassHeader: 'rgba(24, 14, 8, 0.92)'
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    glassBg: 'rgba(24, 10, 14, 0.85)',
    glassBorder: 'rgba(239, 68, 68, 0.2)',
    glassHeader: 'rgba(20, 8, 12, 0.92)'
  },
  slate: {
    id: 'slate',
    name: 'Pure Slate',
    accent: '#e2e8f0',
    accentHover: '#cbd5e1',
    accentGlow: 'rgba(226, 232, 240, 0.3)',
    glassBg: 'rgba(18, 22, 28, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassHeader: 'rgba(14, 18, 24, 0.92)'
  }
};

export const ACCENT_SWATCHES = [
  '#38bdf8', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#ffffff'
];

export const LIVE_WALLPAPERS = [
  {
    id: 'night_coffee',
    title: 'Night Coffee Break 4k',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=70',
    stillUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-hills-41159-large.mp4'
  },
  {
    id: 'winter_mountain',
    title: 'Winter Mountain Sunset',
    preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=70',
    stillUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4'
  },
  {
    id: 'ancient_tree',
    title: 'Ancient Green Tree',
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=70',
    stillUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4'
  },
  {
    id: 'cyber_drift',
    title: 'Neon Cyberpunk Metropolis',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=70',
    stillUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-graphs-and-numbers-31934-large.mp4'
  },
  {
    id: 'cosmic_aurora',
    title: 'Dreamlike River Twin Moon',
    preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=70',
    stillUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-hills-41159-large.mp4'
  }
];

export const STILL_WALLPAPERS = [
  { id: 'default', title: 'Default', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80' },
  { id: 'midnight', title: 'Midnight', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=80' },
  { id: 'ocean', title: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=80' },
  { id: 'forest', title: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=80' },
  { id: 'ember', title: 'Ember', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=80' },
  { id: 'aurora', title: 'Aurora', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=2560&q=80' }
];

export const WALLPAPERS = STILL_WALLPAPERS;

const DEFAULT_FILESYSTEM = {
  'Desktop': {
    type: 'folder',
    children: {
      'welcome.txt': {
        type: 'file',
        content: `Welcome to ZenithOS!\n\nA complete unblocked web operating system environment.\n- Games Hub with 7 unblocked libraries\n- Unix Terminal with script executor\n- File Explorer with persistent storage\n- Code Studio with live sandbox preview\n- Tab Cloaking & Privacy Suite\n- Ambient Audio Lounge`,
        modified: new Date().toISOString()
      },
      'shortcuts.txt': {
        type: 'file',
        content: `Key Bindings:\n- Cmd/Ctrl + K: Spotlight Search\n- Ctrl + Shift + D: Toggle Desktop Icons\n- Ctrl + Shift + Z: Toggle Zen Mode\n- Escape (x3): Emergency Tab Cloak`,
        modified: new Date().toISOString()
      }
    }
  },
  'Documents': {
    type: 'folder',
    children: {
      'notes.txt': {
        type: 'file',
        content: 'Zenith Scratchpad Notes.',
        modified: new Date().toISOString()
      }
    }
  },
  'Downloads': {
    type: 'folder',
    children: {}
  },
  'Pictures': {
    type: 'folder',
    children: {}
  },
  'Scripts': {
    type: 'folder',
    children: {
      'matrix.js': {
        type: 'file',
        content: `console.log("Cascade stream initializing...");\nfor (let i = 0; i < 6; i++) {\n  console.log(Array.from({length: 32}, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join(''));\n}`,
        modified: new Date().toISOString()
      }
    }
  }
};

const DEFAULT_STATE = {
  theme: 'midnight',
  customAccent: '#38bdf8',
  showDesktopIcons: true,
  iconSize: 100,
  zenMode: false,

  clockMode: 'large',
  clockPosition: 'centre',
  clockHeight: 'centre',
  clockFont: 'System default',
  clockShowSeconds: false,
  clockGreeting: false,

  dockSize: 90,
  dockMagnification: true,
  dockAutoHide: false,

  menubarAutoHide: false,
  menubar24h: false,
  menubarShowSeconds: false,
  menubarShowDate: true,
  menubarBatteryPct: true,
  menubarLiveWpControl: true,

  glassTransparency: 15,
  glassAccentTint: false,

  wallpaperType: 'still',
  activeLiveWallpaper: 'night_coffee',
  wallpaperUrl: STILL_WALLPAPERS[0].url,
  wallpaperBlur: 0,
  wallpaperDim: 15,
  wallpaperSaturation: 100,
  wallpaperVignette: false,
  wallpaperParallax: false,
  shuffleAuto: false,
  shuffleEvery: 10,
  playbackSpeed: 1.0,
  pauseInBackground: true,
  pauseBehindWindows: true,
  liveWallpaper: 'stars',

  activeCloak: 'none',
  panicKey: 'Escape',
  panicUrl: 'https://classroom.google.com',
  isLocked: false,
  soundMuted: false
};

class OSState {
  constructor() {
    this.listeners = new Set();
    this.data = this.loadState();
    this.fs = this.loadFileSystem();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('zenith_os_settings');
      if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch (e) {
      console.warn(e);
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    try {
      localStorage.setItem('zenith_os_settings', JSON.stringify(this.data));
    } catch (e) {
      console.warn(e);
    }
    this.notify();
  }

  loadFileSystem() {
    try {
      const saved = localStorage.getItem('zenith_os_fs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_FILESYSTEM));
  }

  saveFileSystem() {
    try {
      localStorage.setItem('zenith_os_fs', JSON.stringify(this.fs));
    } catch (e) {
      console.warn(e);
    }
    this.notify('fs');
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.saveState();
  }

  update(patch) {
    Object.assign(this.data, patch);
    this.saveState();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(event = 'state') {
    this.listeners.forEach(fn => fn(event, this));
  }

  resetToDefaults() {
    this.data = { ...DEFAULT_STATE };
    this.fs = JSON.parse(JSON.stringify(DEFAULT_FILESYSTEM));
    this.saveState();
    this.saveFileSystem();
  }

  wipeDisk() {
    this.fs = JSON.parse(JSON.stringify(DEFAULT_FILESYSTEM));
    this.saveFileSystem();
  }
}

export const state = new OSState();
