/**
 * Zenith Web Browser & Stealth Launcher
 */

import { cloaker } from './cloaker.js';

const BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator' },
  { name: 'Scratch', url: 'https://scratch.mit.edu' },
  { name: 'Archive.org', url: 'https://archive.org' }
];

export function createBrowserApp(containerEl, winState) {
  let currentUrl = 'https://en.m.wikipedia.org';

  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      
      <!-- Browser Navigation Bar -->
      <div class="h-10 bg-slate-900 border-b border-white/10 px-3 flex items-center gap-2 shrink-0">
        <button id="wb-back" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <button id="wb-forward" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button id="wb-reload" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <i class="fa-solid fa-rotate-right"></i>
        </button>

        <!-- Address Bar -->
        <div class="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus-within:border-accent">
          <i class="fa-solid fa-lock text-[10px] text-emerald-400 mr-2 opacity-70"></i>
          <input type="text" id="wb-url-input" value="${currentUrl}" class="w-full bg-transparent text-white focus:outline-none text-xs" />
        </div>

        <button id="wb-go" class="px-3 py-1 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors">
          Go
        </button>

        <button id="wb-blank-btn" class="p-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5" title="Open in About:Blank Cloak">
          <i class="fa-solid fa-up-right-from-square text-accent"></i> Cloak
        </button>
      </div>

      <!-- Quick Bookmarks Bar -->
      <div class="h-7 bg-slate-900/60 border-b border-white/5 px-3 flex items-center gap-2 text-[11px] shrink-0 overflow-x-auto">
        <span class="text-slate-500 font-semibold text-[10px] uppercase">Bookmarks:</span>
        ${BOOKMARKS.map(bm => `
          <button class="wb-bm-btn px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors" data-url="${bm.url}">
            ${bm.name}
          </button>
        `).join('')}
      </div>

      <!-- Browser Viewport -->
      <div class="flex-1 relative bg-white">
        <iframe id="wb-frame" class="w-full h-full border-none" src="${currentUrl}" allowfullscreen="true" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
      </div>

    </div>
  `;

  const urlInput = containerEl.querySelector('#wb-url-input');
  const frame = containerEl.querySelector('#wb-frame');
  const goBtn = containerEl.querySelector('#wb-go');
  const reloadBtn = containerEl.querySelector('#wb-reload');
  const blankBtn = containerEl.querySelector('#wb-blank-btn');

  function navigateTo(url) {
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    currentUrl = target;
    urlInput.value = target;
    frame.src = target;
  }

  goBtn.addEventListener('click', () => navigateTo(urlInput.value));
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateTo(urlInput.value);
  });

  reloadBtn.addEventListener('click', () => {
    frame.src = currentUrl;
  });

  blankBtn.addEventListener('click', () => {
    cloaker.openInAboutBlank(currentUrl, 'Google Drive');
  });

  containerEl.querySelectorAll('.wb-bm-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.url));
  });
}
