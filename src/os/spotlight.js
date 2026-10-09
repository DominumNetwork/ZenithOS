import { windowManager } from './windowManager.js';
import { state, THEMES } from './state.js';

export class Spotlight {
  constructor() {
    this.modal = null;
    this.input = null;
    this.resultsContainer = null;
    this.selectedIndex = 0;
    this.items = [];
  }

  init() {
    this.modal = document.getElementById('spotlight-modal');
    this.input = document.getElementById('spotlight-input');
    this.resultsContainer = document.getElementById('spotlight-results');

    if (!this.modal || !this.input) return;

    // Global keyboard shortcut: Cmd+K or Ctrl+K or Cmd+Space
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.input.addEventListener('input', () => this.search(this.input.value));

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.items.length > 0) {
          this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
          this.renderItems();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.items.length > 0) {
          this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
          this.renderItems();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.items[this.selectedIndex]) {
          this.items[this.selectedIndex].action();
          this.close();
        }
      }
    });
  }

  toggle() {
    if (this.modal.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.modal.classList.remove('hidden');
    this.input.value = '';
    this.selectedIndex = 0;
    this.search('');
    setTimeout(() => this.input.focus(), 50);
  }

  close() {
    this.modal.classList.add('hidden');
    this.input.blur();
  }

  search(query) {
    const q = query.trim().toLowerCase();
    this.items = [];

    // Check for math calculation
    if (/^[\d\s\+\-\*\/\(\)\.\%\^]+$/.test(q) && /[0-9]/.test(q) && /[\+\-\*\/\%]/.test(q)) {
      try {
        const val = Function(`'use strict'; return (${q})`)();
        this.items.push({
          type: 'calc',
          title: `= ${val}`,
          subtitle: `Math calculation result for "${query}"`,
          icon: 'fa-solid fa-calculator text-emerald-400',
          action: () => {
            navigator.clipboard?.writeText(String(val));
          }
        });
      } catch (err) {}
    }

    // Apps catalog
    const APPS = [
      {
        title: 'Games Hub',
        subtitle: 'Unblocked games catalog (7 providers, zero ads)',
        icon: 'fa-solid fa-gamepad text-purple-400',
        action: () => window.zenithOS?.launchApp('games')
      },
      {
        title: 'Terminal',
        subtitle: 'Virtual shell with interactive commands & matrix rain',
        icon: 'fa-solid fa-terminal text-emerald-400',
        action: () => window.zenithOS?.launchApp('terminal')
      },
      {
        title: 'Files',
        subtitle: 'Virtual File Explorer & persistent storage',
        icon: 'fa-solid fa-folder-closed text-amber-400',
        action: () => window.zenithOS?.launchApp('files')
      },
      {
        title: 'Zenith Code',
        subtitle: 'Script editor with live preview execution',
        icon: 'fa-solid fa-code text-cyan-400',
        action: () => window.zenithOS?.launchApp('code')
      },
      {
        title: 'Web Browser',
        subtitle: 'Stealth web launcher with unblocked bookmarks',
        icon: 'fa-solid fa-globe text-sky-400',
        action: () => window.zenithOS?.launchApp('browser')
      },
      {
        title: 'Audio Lounge',
        subtitle: 'Chill lofi synthesizers & waveform visualizer',
        icon: 'fa-solid fa-music text-rose-400',
        action: () => window.zenithOS?.launchApp('music')
      },
      {
        title: 'System Settings',
        subtitle: 'Wallpapers, themes, tab cloaking & dock physics',
        icon: 'fa-solid fa-sliders text-slate-300',
        action: () => window.zenithOS?.launchApp('settings')
      }
    ];

    APPS.forEach(app => {
      if (!q || app.title.toLowerCase().includes(q) || app.subtitle.toLowerCase().includes(q)) {
        this.items.push(app);
      }
    });

    // Search virtual files
    Object.entries(state.fs).forEach(([folderName, folder]) => {
      if (folder.children) {
        Object.entries(folder.children).forEach(([fileName, file]) => {
          if (!q || fileName.toLowerCase().includes(q)) {
            this.items.push({
              title: fileName,
              subtitle: `File in /${folderName}`,
              icon: 'fa-solid fa-file-lines text-indigo-400',
              action: () => {
                window.zenithOS?.launchApp('code', { filename: fileName, content: file.content, folder: folderName });
              }
            });
          }
        });
      }
    });

    this.selectedIndex = 0;
    this.renderItems();
  }

  renderItems() {
    this.resultsContainer.innerHTML = '';

    if (this.items.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-xs">
          No matches found for your query.
        </div>
      `;
      return;
    }

    this.items.forEach((item, idx) => {
      const isSel = idx === this.selectedIndex;
      const el = document.createElement('div');
      el.className = `flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
        isSel ? 'bg-white/15 text-white' : 'hover:bg-white/10 text-slate-200'
      }`;

      el.innerHTML = `
        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm shrink-0">
          <i class="${item.icon}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-xs truncate">${item.title}</div>
          <div class="text-[11px] text-slate-400 truncate">${item.subtitle}</div>
        </div>
        ${isSel ? '<span class="text-[10px] text-slate-400">⏎</span>' : ''}
      `;

      el.addEventListener('click', () => {
        item.action();
        this.close();
      });

      this.resultsContainer.appendChild(el);
    });
  }
}

export const spotlight = new Spotlight();
