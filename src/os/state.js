/**
 * ZenithOS Reactive State & Virtual Storage Engine
 */

export const THEMES = {
  zenith: {
    name: 'Zenith Violet',
    accent: '#7c5cff',
    accentHover: '#6a48f5',
    accentGlow: 'rgba(124, 92, 255, 0.4)',
    glassBg: 'rgba(15, 23, 42, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHeader: 'rgba(15, 23, 42, 0.88)',
  },
  cyber: {
    name: 'Cyber Neon',
    accent: '#10b981',
    accentHover: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    glassBg: 'rgba(6, 20, 20, 0.78)',
    glassBorder: 'rgba(16, 185, 129, 0.25)',
    glassHeader: 'rgba(4, 18, 18, 0.9)',
  },
  sunset: {
    name: 'Sunset Amber',
    accent: '#f59e0b',
    accentHover: '#d97706',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    glassBg: 'rgba(28, 18, 12, 0.78)',
    glassBorder: 'rgba(245, 158, 11, 0.2)',
    glassHeader: 'rgba(24, 14, 8, 0.9)',
  },
  crimson: {
    name: 'Crimson Night',
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    glassBg: 'rgba(24, 10, 14, 0.8)',
    glassBorder: 'rgba(239, 68, 68, 0.2)',
    glassHeader: 'rgba(20, 8, 12, 0.92)',
  },
  midnight: {
    name: 'Midnight Deep',
    accent: '#38bdf8',
    accentHover: '#0284c7',
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    glassBg: 'rgba(10, 18, 36, 0.8)',
    glassBorder: 'rgba(56, 189, 248, 0.2)',
    glassHeader: 'rgba(8, 14, 30, 0.92)',
  },
  matrix: {
    name: 'Matrix Code',
    accent: '#22c55e',
    accentHover: '#16a34a',
    accentGlow: 'rgba(34, 197, 94, 0.4)',
    glassBg: 'rgba(4, 16, 8, 0.82)',
    glassBorder: 'rgba(34, 197, 94, 0.25)',
    glassHeader: 'rgba(3, 14, 7, 0.92)',
  },
  slate: {
    name: 'Pure Slate',
    accent: '#e2e8f0',
    accentHover: '#cbd5e1',
    accentGlow: 'rgba(226, 232, 240, 0.3)',
    glassBg: 'rgba(18, 22, 28, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassHeader: 'rgba(14, 18, 24, 0.92)',
  }
};

export const WALLPAPERS = [
  {
    id: 'anime_cafe',
    title: 'Night Cafe Coziness',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  },
  {
    id: 'cyber_city',
    title: 'Neon Cyberpunk Metropolis',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  },
  {
    id: 'cosmic_nebula',
    title: 'Deep Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  },
  {
    id: 'starry_mountain',
    title: 'Midnight Alpine Lake',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  },
  {
    id: 'purple_galaxy',
    title: 'Vibrant Galaxy Horizon',
    url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  },
  {
    id: 'sunset_synth',
    title: 'Synthwave Neon Grid',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=80',
    thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=70',
    type: 'image'
  }
];

// Initial Virtual File System
const DEFAULT_FILESYSTEM = {
  'Desktop': {
    type: 'folder',
    children: {
      'welcome.txt': {
        type: 'file',
        content: `Welcome to ZenithOS!\n\nZenithOS is an ultra-fast, original WebOS desktop environment featuring:\n• Multi-window workspace with drag, resize, maximize, minimize\n• Complete Unblocked Games Hub with 7 major providers\n• Zero ads, zero premium locks, zero telemetry\n• Virtual Unix Terminal with script executor and matrix rain\n• Virtual File Manager with local persistence\n• Zenith Code Studio with live HTML/JS runner\n• Tab Cloaking (Classroom, Drive, Canvas, Desmos presets)\n• Audio Lounge with chill beats and spectrum visualizer\n\nEnjoy your stay!`,
        modified: new Date().toISOString()
      },
      'quick_shortcuts.txt': {
        type: 'file',
        content: `ZenithOS Key Commands:\n• ⌘K or Ctrl+K : Open Spotlight Search\n• Escape (3x)   : Instant Tab Cloak\n• Double click titlebar: Maximize / Restore window\n• Right click desktop: Quick context menu`,
        modified: new Date().toISOString()
      }
    }
  },
  'Documents': {
    type: 'folder',
    children: {
      'notes.txt': {
        type: 'file',
        content: 'ZenithOS Personal Scratchpad.\n\nTodo:\n- Try out GN-Math & Truffled in Games Hub\n- Write a mini canvas game in Zenith Code\n- Customise accent color and wallpaper in Settings',
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
        content: `// Zenith Script: Matrix Rain Generator
console.log("Initializing digital cascade...");
for (let i = 0; i < 8; i++) {
  const line = Array.from({length: 30}, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join('');
  console.log(line);
}
console.log("System stream synchronized.");`,
        modified: new Date().toISOString()
      },
      'system_check.js': {
        type: 'file',
        content: `// Zenith Diagnostics
console.log("Architecture: Vanilla JS 60FPS Engine");
console.log("Status: Optimal (0 ads, 0 telemetry)");
console.log("Memory: Virtual FS Mounted");`,
        modified: new Date().toISOString()
      }
    }
  }
};

const DEFAULT_STATE = {
  theme: 'zenith',
  customAccent: '#7c5cff',
  wallpaperUrl: WALLPAPERS[0].url,
  wallpaperBlur: 16,
  wallpaperDim: 25,
  liveWallpaper: 'stars', // 'stars', 'none'
  showDesktopClock: true,
  clockFormat24h: false,
  clockShowSeconds: false,
  clockGreeting: true,
  dockMagnification: true,
  dockSize: 48,
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
      console.warn('Failed to parse saved state:', e);
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    try {
      localStorage.setItem('zenith_os_settings', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
    this.notify();
  }

  loadFileSystem() {
    try {
      const saved = localStorage.getItem('zenith_os_fs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse file system:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_FILESYSTEM));
  }

  saveFileSystem() {
    try {
      localStorage.setItem('zenith_os_fs', JSON.stringify(this.fs));
    } catch (e) {
      console.warn('Failed to save file system:', e);
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
}

export const state = new OSState();
