import { state, THEMES, ACCENT_SWATCHES, LIVE_WALLPAPERS, STILL_WALLPAPERS } from './state.js';
import { cloaker, CLOAK_PRESETS } from './cloaker.js';

export function createSettingsApp(containerEl, winState) {
  let activeTab = 'desktop';

  containerEl.innerHTML = `
    <div class="h-full w-full flex bg-slate-950/90 text-slate-100 select-none overflow-hidden text-xs">
      
      <!-- Sidebar -->
      <div class="w-52 bg-slate-900/80 border-r border-white/10 p-2.5 flex flex-col gap-1.5 shrink-0">
        <div class="relative mb-2">
          <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-400 text-xs"></i>
          <input type="text" id="settings-search" placeholder="Search" class="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent" />
        </div>

        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors active font-medium" data-tab="desktop">
          <i class="fa-solid fa-desktop text-accent w-4"></i> Desktop
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10 font-medium" data-tab="wallpaper">
          <i class="fa-solid fa-image text-rose-400 w-4"></i> Wallpaper
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10 font-medium" data-tab="privacy">
          <i class="fa-solid fa-shield-halved text-emerald-400 w-4"></i> Privacy
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10 font-medium" data-tab="storage">
          <i class="fa-solid fa-hard-drive text-amber-400 w-4"></i> Storage
        </button>
        <button class="settings-nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-300 hover:bg-white/10 font-medium" data-tab="about">
          <i class="fa-solid fa-circle-info text-sky-400 w-4"></i> About
        </button>
      </div>

      <!-- Main Panels -->
      <div id="settings-panel" class="flex-1 p-6 overflow-y-auto"></div>

    </div>
  `;

  const navBtns = containerEl.querySelectorAll('.settings-nav-btn');
  const panelEl = containerEl.querySelector('#settings-panel');

  function renderPanel() {
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
      const curTheme = state.get('theme') || 'midnight';
      const curAccent = state.get('customAccent') || '#38bdf8';
      const showIcons = state.get('showDesktopIcons');
      const iconSize = state.get('iconSize') || 100;
      const zenMode = state.get('zenMode');

      const clockMode = state.get('clockMode') || 'large';
      const clockPos = state.get('clockPosition') || 'centre';
      const clockHeight = state.get('clockHeight') || 'centre';
      const clockFont = state.get('clockFont') || 'System default';
      const clockSeconds = state.get('clockShowSeconds');
      const clockGreeting = state.get('clockGreeting');

      const dockSize = state.get('dockSize') || 90;
      const dockMag = state.get('dockMagnification');
      const dockHide = state.get('dockAutoHide');

      const barHide = state.get('menubarAutoHide');
      const bar24h = state.get('menubar24h');
      const barSeconds = state.get('menubarShowSeconds');
      const barDate = state.get('menubarShowDate');
      const barBattery = state.get('menubarBatteryPct');
      const barLiveWp = state.get('menubarLiveWpControl');

      const transparency = state.get('glassTransparency') ?? 15;
      const accentTint = state.get('glassAccentTint');

      panelEl.innerHTML = `
        <div class="space-y-6 max-w-2xl text-xs">
          
          <!-- APPEARANCE -->
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Appearance</div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Theme</div>
                  <div class="text-[11px] text-slate-400">Colours used across Zenith's windows and controls.</div>
                </div>
                <select id="set-theme-select" class="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none">
                  ${Object.entries(THEMES).map(([k, t]) => `
                    <option value="${k}" ${k === curTheme ? 'selected' : ''}>${t.name}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <div class="font-semibold text-white mb-0.5">Accent Colour</div>
                <div class="text-[11px] text-slate-400 mb-2">Highlights, switches and selections. Yours to pick — a theme suggests one, it does not own it.</div>
                <div class="flex items-center gap-2 flex-wrap">
                  ${ACCENT_SWATCHES.map(color => `
                    <button class="color-swatch ${color === curAccent ? 'active' : ''}" style="background-color: ${color};" data-color="${color}"></button>
                  `).join('')}
                  <input type="color" id="set-custom-accent" value="${curAccent}" class="w-6 h-6 rounded-full border-0 cursor-pointer bg-transparent p-0 ml-1" />
                  <button id="set-accent-theme-btn" class="ml-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white">Theme</button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <div class="font-semibold text-white">Show Desktop Icons</div>
                  <div class="text-[11px] text-slate-400">Off gives the wallpaper the whole screen. Ctrl+Shift+D toggles it from anywhere.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-show-icons" ${showIcons ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="pt-2">
                <div class="flex justify-between mb-1">
                  <span class="font-semibold text-white">Icon Size</span>
                  <span class="text-slate-400" id="set-icon-size-val">${iconSize}%</span>
                </div>
                <input type="range" id="set-icon-size" min="70" max="140" value="${iconSize}" class="w-full" />
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <div class="font-semibold text-white">Zen Mode</div>
                  <div class="text-[11px] text-slate-400">Icons, dock and menu bar all step aside; each comes back when the pointer reaches its edge. Ctrl+Shift+Z.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-zen-mode" ${zenMode ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- WALLPAPER CLOCK -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Wallpaper Clock</div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Clock</div>
                  <div class="text-[11px] text-slate-400">A clock painted straight onto the wallpaper, under the icons.</div>
                </div>
                <div class="seg-group" id="set-clock-mode-group">
                  <button class="seg-btn ${clockMode === 'off' ? 'active' : ''}" data-val="off">Off</button>
                  <button class="seg-btn ${clockMode === 'small' ? 'active' : ''}" data-val="small">Small</button>
                  <button class="seg-btn ${clockMode === 'large' ? 'active' : ''}" data-val="large">Large</button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Position</div>
                </div>
                <div class="seg-group" id="set-clock-pos-group">
                  <button class="seg-btn ${clockPos === 'left' ? 'active' : ''}" data-val="left">Left</button>
                  <button class="seg-btn ${clockPos === 'centre' ? 'active' : ''}" data-val="centre">Centre</button>
                  <button class="seg-btn ${clockPos === 'right' ? 'active' : ''}" data-val="right">Right</button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Height</div>
                  <div class="text-[11px] text-slate-400">Where down the screen it sits. Centred puts it in the middle of the wallpaper rather than up against the menu bar.</div>
                </div>
                <div class="seg-group" id="set-clock-height-group">
                  <button class="seg-btn ${clockHeight === 'top' ? 'active' : ''}" data-val="top">Top</button>
                  <button class="seg-btn ${clockHeight === 'centre' ? 'active' : ''}" data-val="centre">Centre</button>
                  <button class="seg-btn ${clockHeight === 'bottom' ? 'active' : ''}" data-val="bottom">Bottom</button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Font</div>
                  <div class="text-[11px] text-slate-400">Any family on Google Fonts — type its name, or pick one from the list.</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <select id="set-clock-font" class="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs">
                    <option value="System default" ${clockFont === 'System default' ? 'selected' : ''}>System default</option>
                    <option value="Orbitron" ${clockFont === 'Orbitron' ? 'selected' : ''}>Orbitron</option>
                    <option value="Plus Jakarta Sans" ${clockFont === 'Plus Jakarta Sans' ? 'selected' : ''}>Plus Jakarta Sans</option>
                    <option value="JetBrains Mono" ${clockFont === 'JetBrains Mono' ? 'selected' : ''}>JetBrains Mono</option>
                    <option value="Outfit" ${clockFont === 'Outfit' ? 'selected' : ''}>Outfit</option>
                    <option value="Caveat" ${clockFont === 'Caveat' ? 'selected' : ''}>Caveat</option>
                  </select>
                  <button id="set-clock-font-default" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">Default</button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Show Seconds</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-clock-seconds" ${clockSeconds ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Greeting</div>
                  <div class="text-[11px] text-slate-400">Good morning, good evening, and — after midnight — still up?</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-clock-greeting" ${clockGreeting ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- DOCK -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Dock</div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="font-semibold text-white">Size</span>
                  <span class="text-slate-400" id="set-dock-size-val">${dockSize}%</span>
                </div>
                <input type="range" id="set-dock-size" min="60" max="130" value="${dockSize}" class="w-full" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Magnification</div>
                  <div class="text-[11px] text-slate-400">Icons lift and grow under the pointer.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-dock-mag" ${dockMag ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Automatically Hide</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-dock-hide" ${dockHide ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- MENU BAR -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Menu Bar</div>

            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-white">Automatically Hide</span>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-hide" ${barHide ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-semibold text-white">24-Hour Time</span>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-24h" ${bar24h ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-semibold text-white">Show Seconds</span>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-seconds" ${barSeconds ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-semibold text-white">Show Date</span>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-date" ${barDate ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-semibold text-white">Battery Percentage</span>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-battery" ${barBattery ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Live Wallpaper Control</div>
                  <div class="text-[11px] text-slate-400">Puts the playing clip, and its pause and shuffle commands, in the menu bar.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-bar-livewp" ${barLiveWp ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- GLASS -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Glass</div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <div>
                    <div class="font-semibold text-white">Transparency</div>
                    <div class="text-[11px] text-slate-400">At 0% the menu bar, dock, panels and windows are solid. Raising it thins them out and frosts whatever is behind.</div>
                  </div>
                  <span class="text-slate-400" id="set-transparency-val">${transparency}%</span>
                </div>
                <input type="range" id="set-transparency" min="0" max="60" value="${transparency}" class="w-full" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Accent Tint</div>
                  <div class="text-[11px] text-slate-400">Washes the frosted surfaces with the theme colour.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-accent-tint" ${accentTint ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                  <div class="font-semibold text-white">Reset Desktop Settings</div>
                  <div class="text-[11px] text-slate-400">Puts everything on this page, and the wallpaper options, back to how they shipped.</div>
                </div>
                <button id="set-reset-desktop" class="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">Reset</button>
              </div>
            </div>
          </div>

        </div>
      `;

      // Event handlers for Desktop tab
      panelEl.querySelector('#set-theme-select').addEventListener('change', (e) => {
        state.set('theme', e.target.value);
        state.set('customAccent', THEMES[e.target.value]?.accent || '#38bdf8');
        renderPanel();
      });

      panelEl.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          state.set('customAccent', sw.dataset.color);
          renderPanel();
        });
      });

      panelEl.querySelector('#set-custom-accent').addEventListener('input', (e) => {
        state.set('customAccent', e.target.value);
      });

      panelEl.querySelector('#set-accent-theme-btn').addEventListener('click', () => {
        const theme = state.get('theme');
        state.set('customAccent', THEMES[theme]?.accent || '#38bdf8');
        renderPanel();
      });

      panelEl.querySelector('#set-show-icons').addEventListener('change', (e) => state.set('showDesktopIcons', e.target.checked));
      
      const iconSizeSlider = panelEl.querySelector('#set-icon-size');
      iconSizeSlider.addEventListener('input', (e) => {
        panelEl.querySelector('#set-icon-size-val').textContent = `${e.target.value}%`;
        state.set('iconSize', parseInt(e.target.value, 10));
      });

      panelEl.querySelector('#set-zen-mode').addEventListener('change', (e) => state.set('zenMode', e.target.checked));

      panelEl.querySelectorAll('#set-clock-mode-group .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('clockMode', btn.dataset.val);
          renderPanel();
        });
      });

      panelEl.querySelectorAll('#set-clock-pos-group .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('clockPosition', btn.dataset.val);
          renderPanel();
        });
      });

      panelEl.querySelectorAll('#set-clock-height-group .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('clockHeight', btn.dataset.val);
          renderPanel();
        });
      });

      panelEl.querySelector('#set-clock-font').addEventListener('change', (e) => {
        state.set('clockFont', e.target.value);
      });

      panelEl.querySelector('#set-clock-font-default').addEventListener('click', () => {
        state.set('clockFont', 'System default');
        renderPanel();
      });

      panelEl.querySelector('#set-clock-seconds').addEventListener('change', (e) => state.set('clockShowSeconds', e.target.checked));
      panelEl.querySelector('#set-clock-greeting').addEventListener('change', (e) => state.set('clockGreeting', e.target.checked));

      const dockSlider = panelEl.querySelector('#set-dock-size');
      dockSlider.addEventListener('input', (e) => {
        panelEl.querySelector('#set-dock-size-val').textContent = `${e.target.value}%`;
        state.set('dockSize', parseInt(e.target.value, 10));
      });

      panelEl.querySelector('#set-dock-mag').addEventListener('change', (e) => state.set('dockMagnification', e.target.checked));
      panelEl.querySelector('#set-dock-hide').addEventListener('change', (e) => state.set('dockAutoHide', e.target.checked));

      panelEl.querySelector('#set-bar-hide').addEventListener('change', (e) => state.set('menubarAutoHide', e.target.checked));
      panelEl.querySelector('#set-bar-24h').addEventListener('change', (e) => state.set('menubar24h', e.target.checked));
      panelEl.querySelector('#set-bar-seconds').addEventListener('change', (e) => state.set('menubarShowSeconds', e.target.checked));
      panelEl.querySelector('#set-bar-date').addEventListener('change', (e) => state.set('menubarShowDate', e.target.checked));
      panelEl.querySelector('#set-bar-battery').addEventListener('change', (e) => state.set('menubarBatteryPct', e.target.checked));
      panelEl.querySelector('#set-bar-livewp').addEventListener('change', (e) => state.set('menubarLiveWpControl', e.target.checked));

      const transSlider = panelEl.querySelector('#set-transparency');
      transSlider.addEventListener('input', (e) => {
        panelEl.querySelector('#set-transparency-val').textContent = `${e.target.value}%`;
        state.set('glassTransparency', parseInt(e.target.value, 10));
      });

      panelEl.querySelector('#set-accent-tint').addEventListener('change', (e) => state.set('glassAccentTint', e.target.checked));

      panelEl.querySelector('#set-reset-desktop').addEventListener('click', () => {
        if (confirm('Reset desktop appearance to factory defaults?')) {
          state.resetToDefaults();
          renderPanel();
        }
      });
    }

    else if (activeTab === 'wallpaper') {
      const wpType = state.get('wallpaperType') || 'still';
      const curLive = state.get('activeLiveWallpaper') || 'night_coffee';
      const curStill = state.get('wallpaperUrl');
      const shuffleAuto = state.get('shuffleAuto');
      const shuffleEvery = state.get('shuffleEvery') || 10;
      const speed = state.get('playbackSpeed') || 1.0;
      const blur = state.get('wallpaperBlur') ?? 0;
      const dim = state.get('wallpaperDim') ?? 15;
      const colour = state.get('wallpaperSaturation') ?? 100;
      const vignette = state.get('wallpaperVignette');
      const parallax = state.get('wallpaperParallax');
      const pauseBg = state.get('pauseInBackground');
      const pauseWin = state.get('pauseBehindWindows');

      panelEl.innerHTML = `
        <div class="space-y-6 max-w-2xl text-xs">
          
          <!-- Wallpaper Type Toggle -->
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div class="text-sm font-bold text-white">Wallpaper Type</div>
              <div class="text-[11px] text-slate-400">A still picture, or a video playing behind the whole desktop.</div>
            </div>
            <div class="seg-group" id="set-wp-type-group">
              <button class="seg-btn ${wpType === 'still' ? 'active' : ''}" data-val="still">Still</button>
              <button class="seg-btn ${wpType === 'live' ? 'active' : ''}" data-val="live">Live</button>
            </div>
          </div>

          <!-- LIVE WALLPAPERS SECTION -->
          ${wpType === 'live' ? `
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Live Wallpapers</div>
              <div class="text-[11px] text-slate-400 mb-3">Motion Pictures: Point at a tile to watch it move; click to put it on the desktop.</div>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${LIVE_WALLPAPERS.map(lw => `
                  <div class="live-wp-card relative rounded-xl overflow-hidden border cursor-pointer aspect-video group transition-all ${lw.id === curLive ? 'border-accent ring-2 ring-accent' : 'border-white/10 hover:border-white/30'}" data-id="${lw.id}">
                    <img src="${lw.preview}" alt="${lw.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-2">
                      <span class="text-[10px] text-white font-medium truncate">${lw.title}</span>
                      <i class="fa-solid fa-play text-[10px] text-white/80"></i>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- PLAYBACK -->
              <div class="pt-4 mt-5 border-t border-white/10">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Playback</div>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-white">Shuffle Automatically</div>
                      <div class="text-[11px] text-slate-400">Move to another live wallpaper on a timer.</div>
                    </div>
                    <label class="ui-switch">
                      <input type="checkbox" id="set-shuffle-auto" ${shuffleAuto ? 'checked' : ''} />
                      <span class="ui-switch-slider"></span>
                    </label>
                  </div>

                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="font-semibold text-white">Shuffle Every</span>
                      <span class="text-slate-400" id="set-shuffle-val">${shuffleEvery} min</span>
                    </div>
                    <input type="range" id="set-shuffle-slider" min="1" max="60" value="${shuffleEvery}" class="w-full" />
                  </div>

                  <div>
                    <div class="flex justify-between mb-1">
                      <div>
                        <div class="font-semibold text-white">Playback Speed</div>
                        <div class="text-[11px] text-slate-400">Slowing a clip down is usually what makes it read as a wallpaper rather than a video.</div>
                      </div>
                      <span class="text-slate-400" id="set-speed-val">${speed.toFixed(2)}x</span>
                    </div>
                    <input type="range" id="set-speed-slider" min="25" max="200" value="${Math.round(speed * 100)}" class="w-full" />
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <!-- STILL PICTURES SECTION -->
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Still Pictures</div>
              <div class="text-[11px] text-slate-400 mb-3">Desktop Picture: Pick a wallpaper or upload your own.</div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                ${STILL_WALLPAPERS.map(sw => `
                  <div class="still-wp-card relative rounded-xl overflow-hidden border cursor-pointer aspect-video group transition-all ${sw.url === curStill ? 'border-accent ring-2 ring-accent' : 'border-white/10 hover:border-white/30'}" data-url="${sw.url}">
                    <img src="${sw.url}" alt="${sw.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span class="text-[10px] text-white font-medium truncate">${sw.title}</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div>
                <div class="font-semibold text-white mb-0.5">Custom Picture</div>
                <div class="text-[11px] text-slate-400 mb-2">PNG, JPEG, WebP, GIF or SVG.</div>
                <div class="flex items-center gap-2">
                  <label class="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                    <i class="fa-solid fa-upload text-xs"></i> Choose...
                    <input type="file" id="set-upload-still" class="hidden" accept="image/*" />
                  </label>
                  <button id="set-remove-custom" class="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">Remove</button>
                </div>
              </div>
            </div>
          `}

          <!-- LOOK (Shared) -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Look</div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="font-semibold text-white">Blur</span>
                  <span class="text-slate-400" id="set-blur-val">${blur} px</span>
                </div>
                <input type="range" id="set-blur-slider" min="0" max="32" value="${blur}" class="w-full" />
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <div>
                    <div class="font-semibold text-white">Dim</div>
                    <div class="text-[11px] text-slate-400">Darkens the picture so icons and window text stay readable over it.</div>
                  </div>
                  <span class="text-slate-400" id="set-dim-val">${dim}%</span>
                </div>
                <input type="range" id="set-dim-slider" min="0" max="80" value="${dim}" class="w-full" />
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span class="font-semibold text-white">Colour</span>
                  <span class="text-slate-400" id="set-colour-val">${colour}%</span>
                </div>
                <input type="range" id="set-colour-slider" min="0" max="200" value="${colour}" class="w-full" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Vignette</div>
                  <div class="text-[11px] text-slate-400">Shades the edges instead of the whole picture.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-vignette" ${vignette ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Parallax</div>
                  <div class="text-[11px] text-slate-400">The wallpaper drifts a few pixels against the pointer.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-parallax" ${parallax ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- PERFORMANCE -->
          <div class="pt-4 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Performance</div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Pause in the Background</div>
                  <div class="text-[11px] text-slate-400">Stop decoding while this tab is not the one on screen.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-pause-bg" ${pauseBg ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">Pause Behind Windows</div>
                  <div class="text-[11px] text-slate-400">Stop while a window is open over the desktop. Kindest to the battery.</div>
                </div>
                <label class="ui-switch">
                  <input type="checkbox" id="set-pause-win" ${pauseWin ? 'checked' : ''} />
                  <span class="ui-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

        </div>
      `;

      // Event handlers for Wallpaper tab
      panelEl.querySelectorAll('#set-wp-type-group .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('wallpaperType', btn.dataset.val);
          renderPanel();
        });
      });

      panelEl.querySelectorAll('.live-wp-card').forEach(card => {
        card.addEventListener('click', () => {
          state.set('activeLiveWallpaper', card.dataset.id);
          renderPanel();
        });
      });

      panelEl.querySelectorAll('.still-wp-card').forEach(card => {
        card.addEventListener('click', () => {
          state.set('wallpaperUrl', card.dataset.url);
          renderPanel();
        });
      });

      const uploadStill = panelEl.querySelector('#set-upload-still');
      uploadStill?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          state.set('wallpaperUrl', evt.target.result);
          renderPanel();
        };
        reader.readAsDataURL(file);
      });

      panelEl.querySelector('#set-remove-custom')?.addEventListener('click', () => {
        state.set('wallpaperUrl', STILL_WALLPAPERS[0].url);
        renderPanel();
      });

      panelEl.querySelector('#set-shuffle-auto')?.addEventListener('change', (e) => state.set('shuffleAuto', e.target.checked));
      
      const shuffleSlider = panelEl.querySelector('#set-shuffle-slider');
      shuffleSlider?.addEventListener('input', (e) => {
        panelEl.querySelector('#set-shuffle-val').textContent = `${e.target.value} min`;
        state.set('shuffleEvery', parseInt(e.target.value, 10));
      });

      const speedSlider = panelEl.querySelector('#set-speed-slider');
      speedSlider?.addEventListener('input', (e) => {
        const spd = parseInt(e.target.value, 10) / 100;
        panelEl.querySelector('#set-speed-val').textContent = `${spd.toFixed(2)}x`;
        state.set('playbackSpeed', spd);
      });

      const blurSlider = panelEl.querySelector('#set-blur-slider');
      blurSlider?.addEventListener('input', (e) => {
        panelEl.querySelector('#set-blur-val').textContent = `${e.target.value} px`;
        state.set('wallpaperBlur', parseInt(e.target.value, 10));
      });

      const dimSlider = panelEl.querySelector('#set-dim-slider');
      dimSlider?.addEventListener('input', (e) => {
        panelEl.querySelector('#set-dim-val').textContent = `${e.target.value}%`;
        state.set('wallpaperDim', parseInt(e.target.value, 10));
      });

      const colSlider = panelEl.querySelector('#set-colour-slider');
      colSlider?.addEventListener('input', (e) => {
        panelEl.querySelector('#set-colour-val').textContent = `${e.target.value}%`;
        state.set('wallpaperSaturation', parseInt(e.target.value, 10));
      });

      panelEl.querySelector('#set-vignette')?.addEventListener('change', (e) => state.set('wallpaperVignette', e.target.checked));
      panelEl.querySelector('#set-parallax')?.addEventListener('change', (e) => state.set('wallpaperParallax', e.target.checked));
      panelEl.querySelector('#set-pause-bg')?.addEventListener('change', (e) => state.set('pauseInBackground', e.target.checked));
      panelEl.querySelector('#set-pause-win')?.addEventListener('change', (e) => state.set('pauseBehindWindows', e.target.checked));
    }

    else if (activeTab === 'privacy') {
      const curCloak = state.get('activeCloak') || 'none';

      panelEl.innerHTML = `
        <div class="space-y-6 max-w-2xl text-xs">
          <div>
            <div class="text-sm font-bold text-white mb-1">Privacy</div>
            
            <div class="bg-white/5 p-4 rounded-xl border border-white/10 mt-3 space-y-3">
              <div>
                <div class="font-semibold text-white">Cloaking</div>
                <div class="text-[11px] text-slate-400">Reopen Zenith inside an innocuous page. Pick the method that survives your setup.</div>
              </div>

              <div class="flex gap-2 flex-wrap">
                <button id="cloak-ab-btn" class="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">A:B Cloak</button>
                <button id="cloak-blob-btn" class="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">Blob Cloak</button>
                <button id="cloak-file-btn" class="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">File Cloak</button>
                <button id="cloak-b64-btn" class="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">B64 Cloak</button>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Tab Disguise Presets</div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              ${Object.values(CLOAK_PRESETS).map(cp => `
                <button class="cloak-select-btn p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${cp.id === curCloak ? 'border-accent bg-white/15 ring-1 ring-accent' : 'border-white/10 bg-white/5 hover:bg-white/10'}" data-cloak="${cp.id}">
                  <img src="${cp.icon}" alt="${cp.name}" class="w-5 h-5 rounded object-contain shrink-0" onerror="this.style.display='none'" />
                  <span class="text-xs text-slate-200 font-medium truncate text-left">${cp.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      panelEl.querySelectorAll('.cloak-select-btn').forEach(b => {
        b.addEventListener('click', () => {
          state.set('activeCloak', b.dataset.cloak);
          renderPanel();
        });
      });

      panelEl.querySelector('#cloak-ab-btn')?.addEventListener('click', () => cloaker.launchAboutBlankCloak());
      panelEl.querySelector('#cloak-blob-btn')?.addEventListener('click', () => cloaker.launchBlobCloak());
      panelEl.querySelector('#cloak-file-btn')?.addEventListener('click', () => cloaker.downloadHtmlCloak());
      panelEl.querySelector('#cloak-b64-btn')?.addEventListener('click', () => cloaker.launchBase64Cloak());
    }

    else if (activeTab === 'storage') {
      panelEl.innerHTML = `
        <div class="space-y-6 max-w-2xl text-xs">
          <div class="text-sm font-bold text-white mb-1">Storage</div>

          <div class="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-white">Wipe Disk</div>
                <div class="text-[11px] text-slate-400 max-w-md">Your files and Zenith's own editable copy of the site live in this browser. Wiping puts everything back the way it shipped — your files in Home, and any edits you made to Zenith itself, are gone for good.</div>
              </div>
              <button id="set-wipe-disk-btn" class="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium transition-colors shrink-0">Wipe Disk</button>
            </div>

            <div class="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <div class="font-semibold text-white">Recovery</div>
                <div class="text-[11px] text-slate-400">If an edit ever breaks Zenith outright, reset settings — it always loads.</div>
              </div>
              <button id="set-recovery-btn" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors shrink-0">Reset State</button>
            </div>
          </div>
        </div>
      `;

      panelEl.querySelector('#set-wipe-disk-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe disk? This will delete all saved files.')) {
          state.wipeDisk();
          alert('Disk has been wiped.');
        }
      });

      panelEl.querySelector('#set-recovery-btn')?.addEventListener('click', () => {
        state.resetToDefaults();
        alert('Settings restored to default state.');
        renderPanel();
      });
    }

    else if (activeTab === 'about') {
      panelEl.innerHTML = `
        <div class="space-y-4 max-w-2xl text-xs text-slate-300">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-2xl">
              <i class="fa-solid fa-atom"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">ZenithOS 2.0</h2>
              <div class="text-[11px] text-slate-400">Modern WebOS Desktop Environment</div>
            </div>
          </div>

          <div class="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5">
            <div class="flex justify-between">
              <span class="text-slate-400">Engine</span>
              <span class="font-semibold text-white">Pure Vanilla JavaScript (Zero Frameworks)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ad Policy</span>
              <span class="font-semibold text-emerald-400">100% Free &amp; Ad-Free</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Cloaking</span>
              <span class="font-semibold text-white">A:B, Blob, File, and Base64 Cloakers</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Gaming Catalog</span>
              <span class="font-semibold text-white">GN-Math, Truffled, PeteZah, Elite, Sea Bean, UGS, Seraph</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      renderPanel();
    });
  });

  renderPanel();
}
