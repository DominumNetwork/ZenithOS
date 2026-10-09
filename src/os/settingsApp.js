/**
 * ZenithOS System Settings
 * Desktop customisation, wallpapers, privacy cloaking, storage & system.
 * Zero ads and zero premium locks.
 */

import { state, THEMES, WALLPAPERS } from './state.js';
import { cloaker, CLOAK_PRESETS } from './cloaker.js';

export function createSettingsApp(containerEl, winState) {
  let activeTab = 'desktop';

  containerEl.innerHTML = `
    <div class="h-full w-full flex bg-slate-950/80 text-slate-100 select-none overflow-hidden text-xs">
      
      <!-- Settings Sidebar -->
      <div class="w-48 bg-slate-900/70 border-r border-white/10 p-2.5 flex flex-col gap-1 shrink-0">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">Preferences</div>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors active" data-tab="desktop">
          <i class="fa-solid fa-desktop text-accent w-4"></i> Desktop
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10" data-tab="wallpaper">
          <i class="fa-solid fa-image text-rose-400 w-4"></i> Wallpaper
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10" data-tab="privacy">
          <i class="fa-solid fa-shield-halved text-emerald-400 w-4"></i> Privacy &amp; Cloak
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10" data-tab="storage">
          <i class="fa-solid fa-hard-drive text-amber-400 w-4"></i> Storage
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10" data-tab="about">
          <i class="fa-solid fa-circle-info text-sky-400 w-4"></i> About
        </button>
      </div>

      <!-- Settings Content Panels -->
      <div id="settings-content" class="flex-1 p-5 overflow-y-auto">
        <!-- Injected via renderTabContent -->
      </div>

    </div>
  `;

  const navBtns = containerEl.querySelectorAll('.settings-nav-btn');
  const contentEl = containerEl.querySelector('#settings-content');

  function renderTabContent() {
    navBtns.forEach(btn => {
      if (btn.dataset.tab === activeTab) {
        btn.classList.add('bg-white/15', 'text-white', 'font-semibold');
        btn.classList.remove('text-slate-300');
      } else {
        btn.classList.remove('bg-white/15', 'text-white', 'font-semibold');
        btn.classList.add('text-slate-300');
      }
    });

    if (activeTab === 'desktop') {
      const curTheme = state.get('theme') || 'zenith';
      const showClock = state.get('showDesktopClock');
      const clock24h = state.get('clockFormat24h');
      const clockSecs = state.get('clockShowSeconds');
      const clockGreet = state.get('clockGreeting');
      const dockMag = state.get('dockMagnification');
      const dockSize = state.get('dockSize') || 48;

      contentEl.innerHTML = `
        <div class="space-y-5 max-w-xl">
          <div>
            <h3 class="text-sm font-bold text-white mb-1">Color Theme</h3>
            <p class="text-slate-400 text-[11px] mb-3">Choose the system accent and glass glow palette.</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${Object.entries(THEMES).map(([k, t]) => `
                <button class="theme-select-btn p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${k === curTheme ? 'border-accent bg-white/15 shadow-sm' : 'border-white/10 bg-white/5 hover:bg-white/10'}" data-theme="${k}">
                  <span class="w-4 h-4 rounded-full" style="background-color: ${t.accent}; box-shadow: 0 0 8px ${t.accentGlow};"></span>
                  <span class="text-xs text-slate-200 font-medium">${t.name.split(' ')[0]}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Desktop Clock</h3>
            <p class="text-slate-400 text-[11px] mb-3">Customize the large time widget on the workspace background.</p>
            
            <div class="space-y-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
              <label class="flex items-center justify-between cursor-pointer">
                <span>Display Clock Widget</span>
                <input type="checkbox" id="setting-clock-show" class="toggle-checkbox w-4 h-4 accent-accent rounded" ${showClock ? 'checked' : ''} />
              </label>

              <label class="flex items-center justify-between cursor-pointer">
                <span>24-Hour Military Format</span>
                <input type="checkbox" id="setting-clock-24h" class="toggle-checkbox w-4 h-4 accent-accent rounded" ${clock24h ? 'checked' : ''} />
              </label>

              <label class="flex items-center justify-between cursor-pointer">
                <span>Show Seconds</span>
                <input type="checkbox" id="setting-clock-secs" class="toggle-checkbox w-4 h-4 accent-accent rounded" ${clockSecs ? 'checked' : ''} />
              </label>

              <label class="flex items-center justify-between cursor-pointer">
                <span>Greeting Caption</span>
                <input type="checkbox" id="setting-clock-greet" class="toggle-checkbox w-4 h-4 accent-accent rounded" ${clockGreet ? 'checked' : ''} />
              </label>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Dock Physics</h3>
            <p class="text-slate-400 text-[11px] mb-3">Control dock size and hover magnification curve.</p>
            
            <div class="space-y-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <label class="flex items-center justify-between cursor-pointer">
                <span>Magnification on Hover</span>
                <input type="checkbox" id="setting-dock-mag" class="toggle-checkbox w-4 h-4 accent-accent rounded" ${dockMag ? 'checked' : ''} />
              </label>

              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Dock Icon Size</span>
                  <span id="dock-size-val">${dockSize}px</span>
                </div>
                <input type="range" id="setting-dock-size" min="36" max="64" value="${dockSize}" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" />
              </div>
            </div>
          </div>
        </div>
      `;

      // Event listeners for desktop settings
      contentEl.querySelectorAll('.theme-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('theme', btn.dataset.theme);
          renderTabContent();
        });
      });

      contentEl.querySelector('#setting-clock-show').addEventListener('change', (e) => state.set('showDesktopClock', e.target.checked));
      contentEl.querySelector('#setting-clock-24h').addEventListener('change', (e) => state.set('clockFormat24h', e.target.checked));
      contentEl.querySelector('#setting-clock-secs').addEventListener('change', (e) => state.set('clockShowSeconds', e.target.checked));
      contentEl.querySelector('#setting-clock-greet').addEventListener('change', (e) => state.set('clockGreeting', e.target.checked));
      contentEl.querySelector('#setting-dock-mag').addEventListener('change', (e) => state.set('dockMagnification', e.target.checked));

      const dockSlider = contentEl.querySelector('#setting-dock-size');
      dockSlider.addEventListener('input', (e) => {
        const sz = e.target.value;
        contentEl.querySelector('#dock-size-val').textContent = `${sz}px`;
        state.set('dockSize', parseInt(sz, 10));
      });
    }

    else if (activeTab === 'wallpaper') {
      const curWp = state.get('wallpaperUrl');
      const curBlur = state.get('wallpaperBlur') ?? 16;
      const curDim = state.get('wallpaperDim') ?? 25;
      const liveWp = state.get('liveWallpaper') || 'stars';

      contentEl.innerHTML = `
        <div class="space-y-5 max-w-xl">
          <div>
            <h3 class="text-sm font-bold text-white mb-1">Curated Wallpapers</h3>
            <p class="text-slate-400 text-[11px] mb-3">High-resolution desktop backgrounds.</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${WALLPAPERS.map(wp => `
                <div class="wp-card relative rounded-xl overflow-hidden border cursor-pointer aspect-video group transition-all ${wp.url === curWp ? 'border-accent ring-2 ring-accent' : 'border-white/10 hover:border-white/30'}" data-url="${wp.url}">
                  <img src="${wp.thumb}" alt="${wp.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span class="text-[10px] text-white font-medium truncate">${wp.title}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Live Animated Background</h3>
            <p class="text-slate-400 text-[11px] mb-3">Optional dynamic canvas particles over wallpaper.</p>
            <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="live-wp" value="stars" class="accent-accent" ${liveWp === 'stars' ? 'checked' : ''} />
                <span>Cosmic Starfield Particles</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer ml-4">
                <input type="radio" name="live-wp" value="none" class="accent-accent" ${liveWp === 'none' ? 'checked' : ''} />
                <span>Static Only</span>
              </label>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Glass Blur &amp; Dim</h3>
            <p class="text-slate-400 text-[11px] mb-3">Adjust backdrop depth for window readability.</p>
            
            <div class="space-y-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Glass Blur</span>
                  <span id="wp-blur-val">${curBlur}px</span>
                </div>
                <input type="range" id="setting-wp-blur" min="0" max="32" value="${curBlur}" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" />
              </div>

              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Wallpaper Dimming</span>
                  <span id="wp-dim-val">${curDim}%</span>
                </div>
                <input type="range" id="setting-wp-dim" min="0" max="85" value="${curDim}" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" />
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Custom Wallpaper URL</h3>
            <div class="flex gap-2">
              <input type="text" id="custom-wp-url" placeholder="https://example.com/wallpaper.jpg" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent" />
              <button id="apply-custom-wp" class="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors">Apply</button>
            </div>
          </div>
        </div>
      `;

      contentEl.querySelectorAll('.wp-card').forEach(c => {
        c.addEventListener('click', () => {
          state.set('wallpaperUrl', c.dataset.url);
          renderTabContent();
        });
      });

      contentEl.querySelectorAll('input[name="live-wp"]').forEach(radio => {
        radio.addEventListener('change', (e) => state.set('liveWallpaper', e.target.value));
      });

      const blurSlider = contentEl.querySelector('#setting-wp-blur');
      blurSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        contentEl.querySelector('#wp-blur-val').textContent = `${val}px`;
        state.set('wallpaperBlur', parseInt(val, 10));
      });

      const dimSlider = contentEl.querySelector('#setting-wp-dim');
      dimSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        contentEl.querySelector('#wp-dim-val').textContent = `${val}%`;
        state.set('wallpaperDim', parseInt(val, 10));
      });

      contentEl.querySelector('#apply-custom-wp').addEventListener('click', () => {
        const url = contentEl.querySelector('#custom-wp-url').value.trim();
        if (url) {
          state.set('wallpaperUrl', url);
          renderTabContent();
        }
      });
    }

    else if (activeTab === 'privacy') {
      const curCloak = state.get('activeCloak') || 'none';
      const panicKey = state.get('panicKey') || 'Escape';
      const panicUrl = state.get('panicUrl') || 'https://classroom.google.com';

      contentEl.innerHTML = `
        <div class="space-y-5 max-w-xl">
          <div>
            <h3 class="text-sm font-bold text-white mb-1">Tab Cloak Disguise</h3>
            <p class="text-slate-400 text-[11px] mb-3">Instantly morphs browser title and tab favicon to a school or productivity tool.</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              ${Object.values(CLOAK_PRESETS).map(cp => `
                <button class="cloak-select-btn p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${cp.id === curCloak ? 'border-accent bg-white/15 ring-1 ring-accent' : 'border-white/10 bg-white/5 hover:bg-white/10'}" data-cloak="${cp.id}">
                  <img src="${cp.icon}" alt="${cp.name}" class="w-5 h-5 rounded object-contain shrink-0" onerror="this.style.display='none'" />
                  <span class="text-xs text-slate-200 font-medium truncate text-left">${cp.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-white mb-1">Panic Button</h3>
            <p class="text-slate-400 text-[11px] mb-3">Triple-tapping the panic key activates the emergency cloaking or redirects away.</p>
            
            <div class="space-y-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <div class="flex items-center justify-between">
                <span>Panic Trigger Key</span>
                <select id="setting-panic-key" class="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs">
                  <option value="Escape" ${panicKey === 'Escape' ? 'selected' : ''}>Escape (Triple Tap)</option>
                  <option value="\\" ${panicKey === '\\' ? 'selected' : ''}>Backslash (\\)</option>
                  <option value="\`" ${panicKey === '\`' ? 'selected' : ''}>Backtick (\`)</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] text-slate-300 mb-1">Emergency Redirect URL</label>
                <input type="text" id="setting-panic-url" value="${panicUrl}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent" />
              </div>
            </div>
          </div>
        </div>
      `;

      contentEl.querySelectorAll('.cloak-select-btn').forEach(b => {
        b.addEventListener('click', () => {
          state.set('activeCloak', b.dataset.cloak);
          renderTabContent();
        });
      });

      contentEl.querySelector('#setting-panic-key').addEventListener('change', (e) => state.set('panicKey', e.target.value));
      contentEl.querySelector('#setting-panic-url').addEventListener('change', (e) => state.set('panicUrl', e.target.value.trim()));
    }

    else if (activeTab === 'storage') {
      const fsJson = JSON.stringify(state.fs);
      const fsKb = (fsJson.length / 1024).toFixed(1);

      contentEl.innerHTML = `
        <div class="space-y-5 max-w-xl">
          <div>
            <h3 class="text-sm font-bold text-white mb-1">Virtual Storage Usage</h3>
            <p class="text-slate-400 text-[11px] mb-3">LocalStorage persistent filesystem memory.</p>
            
            <div class="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
              <div class="flex justify-between text-xs">
                <span>Used Virtual Disk</span>
                <span class="font-bold text-accent">${fsKb} KB / 5.0 MB</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-accent rounded-full" style="width: ${Math.max(2, (fsJson.length / (5 * 1024 * 1024)) * 100)}%;"></div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10 space-y-3">
            <h3 class="text-sm font-bold text-white">Backup &amp; Restore</h3>
            <div class="flex gap-2">
              <button id="export-backup-btn" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 transition-colors">
                <i class="fa-solid fa-download text-accent"></i> Export Backup JSON
              </button>
              <label class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 transition-colors cursor-pointer">
                <i class="fa-solid fa-upload text-sky-400"></i> Restore Backup
                <input type="file" id="import-backup-file" class="hidden" accept=".json" />
              </label>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <h3 class="text-sm font-bold text-red-400 mb-1">Factory Reset</h3>
            <p class="text-slate-400 text-[11px] mb-3">Clear all cached files, custom themes and revert to default setup.</p>
            <button id="factory-reset-btn" class="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium flex items-center gap-2 transition-colors">
              <i class="fa-solid fa-triangle-exclamation"></i> Reset to Defaults
            </button>
          </div>
        </div>
      `;

      contentEl.querySelector('#export-backup-btn').addEventListener('click', () => {
        const payload = {
          settings: state.data,
          fs: state.fs,
          version: 'ZenithOS-2.0',
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `zenith_backup_${Date.now()}.json`;
        a.click();
      });

      contentEl.querySelector('#import-backup-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            if (data.settings) state.data = { ...state.data, ...data.settings };
            if (data.fs) state.fs = data.fs;
            state.saveState();
            state.saveFileSystem();
            alert('Backup successfully restored!');
            renderTabContent();
          } catch (err) {
            alert('Invalid backup file.');
          }
        };
        reader.readAsText(file);
      });

      contentEl.querySelector('#factory-reset-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings and virtual files?')) {
          state.resetToDefaults();
          alert('System reset to defaults.');
          renderTabContent();
        }
      });
    }

    else if (activeTab === 'about') {
      contentEl.innerHTML = `
        <div class="space-y-4 max-w-xl text-slate-300">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-2xl">
              <i class="fa-solid fa-atom"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">ZenithOS 2.0</h2>
              <div class="text-[11px] text-slate-400">Modern WebOS Desktop Environment</div>
            </div>
          </div>

          <p class="leading-relaxed text-xs">
            ZenithOS is an ultra-fast, original web operating system built from scratch with pure Vanilla JavaScript and 60FPS hardware-accelerated frosted glass interfaces.
          </p>

          <div class="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Architecture</span>
              <span class="font-semibold text-white">Zero React / Zero TypeScript / Pure JS</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Monetization &amp; Ads</span>
              <span class="font-semibold text-emerald-400">100% Free &amp; Ad-Free</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Gaming Engine</span>
              <span class="font-semibold text-white">7 Integrated Game Providers</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Multi-Window Manager</span>
              <span class="font-semibold text-white">Physics-driven Acrylic Engine</span>
            </div>
          </div>

          <div class="pt-2">
            <h4 class="text-xs font-bold text-white mb-2">Keyboard Shortcuts</h4>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="bg-white/5 p-2 rounded-lg"><kbd class="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">⌘K</kbd> Open Spotlight Search</div>
              <div class="bg-white/5 p-2 rounded-lg"><kbd class="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Esc x3</kbd> Instant Tab Cloak</div>
              <div class="bg-white/5 p-2 rounded-lg"><kbd class="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Dbl Click</kbd> Maximize Window</div>
              <div class="bg-white/5 p-2 rounded-lg"><kbd class="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Right Click</kbd> Desktop Context Menu</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      renderTabContent();
    });
  });

  renderTabContent();
}
