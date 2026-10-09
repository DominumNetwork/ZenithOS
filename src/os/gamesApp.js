/**
 * ZenithOS Games Hub
 * Native multi-provider unblocked gaming suite
 * Ported from games.html with zero ads and zero premium locks.
 */

import { cloaker } from './cloaker.js';

export function createGamesApp(containerEl, winState) {
  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950/80 text-slate-100 select-none overflow-hidden">
      
      <!-- Top Control Bar -->
      <div id="games-controls" class="flex flex-wrap items-center gap-2 p-2.5 bg-slate-900/90 border-b border-white/10 z-10 shrink-0 text-xs">
        
        <!-- Provider Select -->
        <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
          <i class="fa-solid fa-server text-accent"></i>
          <select id="games-provider" class="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs">
            <option value="gn-math" class="bg-slate-900">GN-Math</option>
            <option value="truffled" class="bg-slate-900">Truffled.lol</option>
            <option value="petezah" class="bg-slate-900">PeteZah</option>
            <option value="elite" class="bg-slate-900">Elite Gamez</option>
            <option value="sea-bean" class="bg-slate-900">Sea Bean</option>
            <option value="ugs" class="bg-slate-900">UGS</option>
            <option value="seraph" class="bg-slate-900">Seraph</option>
          </select>
        </div>

        <!-- Truffled Proxy Select (conditional) -->
        <div id="truffled-proxy-wrap" class="hidden flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
          <i class="fa-solid fa-network-wired text-sky-400"></i>
          <select id="truffled-proxy" class="bg-transparent text-white focus:outline-none cursor-pointer text-xs">
            <option value="https://truffled.lol" class="bg-slate-900">truffled.lol (Default)</option>
            <option value="https://classlink.com.de" class="bg-slate-900">classlink.com.de</option>
            <option value="https://pamson.pl.sophiemaslowski.com" class="bg-slate-900">pamson.pl.sophiemaslowski.com</option>
            <option value="https://lightspeed-sucks.9ibee.com" class="bg-slate-900">lightspeed-sucks.9ibee.com</option>
          </select>
        </div>

        <!-- Category Select (conditional for PeteZah) -->
        <div id="category-wrap" class="hidden flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
          <i class="fa-solid fa-shapes text-indigo-400"></i>
          <select id="category-select" class="bg-transparent text-white focus:outline-none cursor-pointer text-xs">
            <option value="" class="bg-slate-900">All Categories</option>
            <option value="action" class="bg-slate-900">Action</option>
            <option value="racing" class="bg-slate-900">Racing</option>
            <option value="strategy" class="bg-slate-900">Strategy</option>
            <option value="sports" class="bg-slate-900">Sports</option>
            <option value="skill" class="bg-slate-900">Skill</option>
            <option value="shooting" class="bg-slate-900">Shooting</option>
            <option value="2 player" class="bg-slate-900">2 Player</option>
            <option value="io" class="bg-slate-900">Io</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="flex-1 min-w-[160px] flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus-within:border-accent">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input type="text" id="games-search" placeholder="Search games..." class="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-xs" />
        </div>

        <!-- Sort Select -->
        <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
          <i class="fa-solid fa-arrow-down-a-z text-slate-400"></i>
          <select id="games-sort" class="bg-transparent text-white focus:outline-none cursor-pointer text-xs">
            <option value="a-z" class="bg-slate-900">A-Z</option>
            <option value="z-a" class="bg-slate-900">Z-A</option>
            <option value="latest" class="bg-slate-900">Latest</option>
            <option value="oldest" class="bg-slate-900">Oldest</option>
          </select>
        </div>

        <!-- Reload Library Button -->
        <button id="games-refresh" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Reload Games">
          <i class="fa-solid fa-rotate"></i>
        </button>
      </div>

      <!-- Main Content Area: Gallery or Player -->
      <div id="games-viewport" class="flex-1 relative overflow-hidden">
        
        <!-- Gallery Grid View -->
        <div id="games-gallery-view" class="h-full w-full overflow-y-auto p-4">
          <div id="games-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            <!-- Populated via JS -->
          </div>
        </div>

        <!-- In-Window Player View (Zero ads, responsive player) -->
        <div id="games-player-view" class="hidden absolute inset-0 flex flex-col bg-black z-20">
          <div class="h-10 bg-slate-900/95 border-b border-white/10 flex items-center justify-between px-3 text-xs shrink-0 select-none">
            <div class="flex items-center gap-2">
              <button id="player-back-btn" class="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors">
                <i class="fa-solid fa-arrow-left"></i> Gallery
              </button>
              <span id="player-game-title" class="font-semibold text-slate-100 truncate max-w-xs md:max-w-md ml-1">Game</span>
            </div>

            <div class="flex items-center gap-1.5">
              <button id="player-reload-btn" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Reload Game">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
              <button id="player-blank-btn" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Open in About:Blank Cloak">
                <i class="fa-solid fa-up-right-from-square"></i>
              </button>
              <button id="player-download-btn" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Download Game HTML">
                <i class="fa-solid fa-download"></i>
              </button>
              <button id="player-fullscreen-btn" class="p-1.5 px-2 rounded bg-accent/80 hover:bg-accent text-white font-medium transition-colors" title="Fullscreen">
                <i class="fa-solid fa-expand"></i>
              </button>
            </div>
          </div>
          
          <div class="flex-1 w-full h-full relative bg-black">
            <iframe id="game-frame" class="w-full h-full border-none" allow="autoplay; fullscreen; gamepad; focus-without-user-activation *" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"></iframe>
          </div>
        </div>

      </div>
    </div>
  `;

  const providerSelect = containerEl.querySelector('#games-provider');
  const truffledProxyWrap = containerEl.querySelector('#truffled-proxy-wrap');
  const truffledProxySelect = containerEl.querySelector('#truffled-proxy');
  const categoryWrap = containerEl.querySelector('#category-wrap');
  const categorySelect = containerEl.querySelector('#category-select');
  const searchInput = containerEl.querySelector('#games-search');
  const sortSelect = containerEl.querySelector('#games-sort');
  const refreshBtn = containerEl.querySelector('#games-refresh');
  const gridContainer = containerEl.querySelector('#games-grid');

  const galleryView = containerEl.querySelector('#games-gallery-view');
  const playerView = containerEl.querySelector('#games-player-view');
  const playerGameTitle = containerEl.querySelector('#player-game-title');
  const playerBackBtn = containerEl.querySelector('#player-back-btn');
  const playerBlankBtn = containerEl.querySelector('#player-blank-btn');
  const playerDownloadBtn = containerEl.querySelector('#player-download-btn');
  const playerFullscreenBtn = containerEl.querySelector('#player-fullscreen-btn');
  const playerReloadBtn = containerEl.querySelector('#player-reload-btn');
  const gameFrame = containerEl.querySelector('#game-frame');

  let allGames = [];
  let currentGame = null;

  function getFallbackImage(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=7c5cff&size=256&font-size=0.33&bold=true`;
  }

  function resolveGameUrl(url, provider) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanPath = url.replace(/^\//, '');
    if (provider === 'seraph') {
      return "https://cdn.jsdelivr.net/gh/a456pur/seraph@main/" + cleanPath;
    }
    return "https://cdn.jsdelivr.net/gh/tharun9772/tharun9772.github.io@main/" + cleanPath;
  }

  function handleProviderChange() {
    const provider = providerSelect.value;
    
    // Toggle conditional controls
    if (provider === 'truffled') {
      truffledProxyWrap.classList.remove('hidden');
    } else {
      truffledProxyWrap.classList.add('hidden');
    }

    if (provider === 'petezah') {
      categoryWrap.classList.remove('hidden');
    } else {
      categoryWrap.classList.add('hidden');
      categorySelect.value = '';
    }

    loadGames();
  }

  async function loadGames() {
    gridContainer.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
        <i class="fa-solid fa-circle-notch fa-spin text-2xl text-accent"></i>
        <span class="text-xs">Fetching games catalog...</span>
      </div>
    `;

    allGames = [];
    const provider = providerSelect.value;

    try {
      if (provider === 'gn-math') {
        const response = await fetch("https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json");
        const rawZones = await response.json();
        
        allGames = rawZones.filter(g => g.id !== -1 && !g.name.startsWith("[!]")).map((z, index) => {
          let coverUrl = (z.cover || "").replace('{COVER_URL}', '');
          if (coverUrl.startsWith('/')) coverUrl = coverUrl.substring(1);

          return {
            provider: 'gn-math',
            name: z.name,
            cover: 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main/' + coverUrl,
            url: z.url,
            isAbsolute: z.url.startsWith('http'),
            addedOrder: index
          };
        });

      } else if (provider === 'elite') {
        const response = await fetch("https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json");
        const data = await response.json();

        allGames = data.map((g, index) => {
          let gameTitle = g.title || g.name || "Unknown Game";
          let gameUrl = g.url;
          if (!gameUrl.startsWith('http')) {
            gameUrl = "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/" + gameUrl;
          }

          return {
            provider: 'elite',
            name: gameTitle,
            cover: g.image ? ('https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/' + g.image) : getFallbackImage(gameTitle),
            url: gameUrl,
            isAbsolute: true,
            addedOrder: index
          };
        });

      } else if (provider === 'sea-bean') {
        const response = await fetch("https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json");
        const data = await response.json();

        allGames = data.map((g, index) => {
          let gameTitle = g.name || g.id || "Unknown Game";
          let htmlUrl = g.html || g.url || "";
          
          if (htmlUrl.includes("{HTML_URL}")) {
            htmlUrl = htmlUrl.replace("{HTML_URL}", "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/games/");
          } else {
            htmlUrl = resolveGameUrl(htmlUrl);
          }

          let cover = (g.cover || g.img || "").replace("{COVER_URL}/", "");
          let finalCover = cover.startsWith("http") 
              ? cover 
              : (cover ? 'https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/' + cover : getFallbackImage(gameTitle));

          return {
            provider: 'sea-bean',
            name: gameTitle,
            cover: finalCover,
            url: htmlUrl,
            isAbsolute: true,
            addedOrder: index
          };
        });

      } else if (provider === 'ugs') {
        const repos = ["tharun9772/ugs-1", "tharun9772/ugs-2", "tharun9772/ugs-3"];
        let games = [];
        let globalIndex = 0;

        for (const repo of repos) {
          try {
            const r = await fetch(`https://api.github.com/repos/${repo}/contents/`);
            if (r.ok) {
              const d = await r.json();
              d.forEach(f => {
                if (f.type === "file" && f.name.startsWith("cl") && f.name.endsWith(".html")) {
                  let cleanName = f.name.replace(/^cl/, "").replace(".html", "");
                  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
                  
                  games.push({
                    provider: 'ugs',
                    name: cleanName,
                    cover: "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png",
                    url: `https://cdn.jsdelivr.net/gh/${repo}@main/${f.name}`,
                    isAbsolute: true,
                    addedOrder: globalIndex++
                  });
                }
              });
            }
          } catch (e) {
            console.warn("UGS fetch error:", repo);
          }
        }
        allGames = games;

      } else if (provider === 'truffled') {
        const proxyBase = truffledProxySelect.value.replace(/\/$/, "");
        const response = await fetch("https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/js/json/g.json");
        const data = await response.json();
        
        allGames = (data.games || []).map((g, index) => {
          let rawUrl = g.url;
          let gameUrl = g.url;
          let thumb = g.thumbnail;
          
          if (!gameUrl.startsWith('http')) {
            gameUrl = proxyBase + (gameUrl.startsWith('/') ? '' : '/') + gameUrl;
          }
          if (!thumb.startsWith('http')) {
            thumb = proxyBase + (thumb.startsWith('/') ? '' : '/') + thumb;
          }

          return {
            provider: 'truffled',
            name: g.name,
            cover: thumb,
            url: gameUrl,
            rawUrl: rawUrl,
            isAbsolute: g.url.startsWith('http'),
            frameType: g.frameType || 'iframe',
            addedOrder: index
          };
        });

      } else if (provider === 'seraph') {
        const response = await fetch('https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json');
        const data = await response.json();

        allGames = data.map((g, index) => {
          const gamePath = g.url.endsWith('index.html') ? g.url : g.url.replace(/\/?$/, '/index.html');
          return {
            provider: 'seraph',
            name: g.name,
            cover: g.img ? g.img : getFallbackImage(g.name),
            url: resolveGameUrl(gamePath, 'seraph'),
            isAbsolute: true,
            addedOrder: index
          };
        });

      } else if (provider === 'petezah') {
        const response = await fetch("https://cdn.jsdelivr.net/gh/PeteZah-G/singlefile-json@main/search.json");
        const data = await response.json();

        allGames = (data.games || []).map((g, index) => {
          let finalUrl = g.url;
          if (finalUrl && !finalUrl.endsWith('index.html') && !finalUrl.match(/\.\w+$/)) {
            finalUrl = finalUrl.replace(/\/$/, '') + '/index.html';
          }

          return {
            provider: 'petezah',
            name: g.label,
            cover: g.imageUrl || getFallbackImage(g.label),
            url: finalUrl,
            isAbsolute: finalUrl.startsWith('http'),
            addedOrder: index,
            categories: g.categories || []
          };
        });
      }

      applyFilters();

    } catch (err) {
      console.error('Failed to fetch provider games:', err);
      gridContainer.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-center px-4">
          <i class="fa-solid fa-triangle-exclamation text-amber-400 text-3xl mb-2"></i>
          <p class="text-sm font-semibold text-slate-200">Unable to reach ${provider.toUpperCase()}</p>
          <p class="text-xs text-slate-400 mt-1 max-w-sm">Network restriction or CORS prevented loading. Please choose another provider from the dropdown.</p>
        </div>
      `;
    }
  }

  function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const sortMethod = sortSelect.value;
    const categoryFilter = categorySelect.value.toLowerCase();

    let filtered = allGames.filter(g => {
      const matchesQuery = g.name.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || (g.categories && g.categories.includes(categoryFilter));
      return matchesQuery && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortMethod === 'a-z') return a.name.localeCompare(b.name);
      if (sortMethod === 'z-a') return b.name.localeCompare(a.name);
      if (sortMethod === 'latest') return (b.addedOrder || 0) - (a.addedOrder || 0);
      if (sortMethod === 'oldest') return (a.addedOrder || 0) - (b.addedOrder || 0);
      return 0;
    });

    renderGames(filtered);
  }

  function renderGames(games) {
    gridContainer.innerHTML = '';

    if (games.length === 0) {
      gridContainer.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 text-xs">
          No games match your search query.
        </div>
      `;
      return;
    }

    games.forEach((game) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      
      card.innerHTML = `
        <div class="game-card-img-wrap">
          <img data-src="${game.cover}" alt="${game.name}" loading="lazy" class="opacity-0 transition-opacity duration-300" />
        </div>
        <div class="game-card-title">${game.name}</div>
      `;

      const img = card.querySelector('img');
      img.onerror = () => {
        img.src = getFallbackImage(game.name);
        img.classList.remove('opacity-0');
      };
      img.onload = () => {
        img.classList.remove('opacity-0');
      };

      card.addEventListener('click', () => openGame(game));
      gridContainer.appendChild(card);
    });

    // Intersection observer for lazy image loading
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '120px' });

    gridContainer.querySelectorAll('img[data-src]').forEach(i => observer.observe(i));
  }

  async function openGame(game) {
    currentGame = game;
    playerGameTitle.textContent = game.name;
    galleryView.classList.add('hidden');
    playerView.classList.remove('hidden');

    let fullUrl = game.url;
    if (game.provider === 'gn-math' && !game.isAbsolute) {
      fullUrl = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main/' + game.url.replace('{HTML_URL}', '');
    }

    const needsBlobFix = ['elite', 'sea-bean', 'ugs', 'gn-math', 'seraph', 'petezah'];

    if (needsBlobFix.includes(game.provider)) {
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Fetch failed: " + response.status);
        let htmlContent = await response.text();

        if (game.provider === 'petezah') {
          const baseUrl = fullUrl.replace(/\/[^\/]*$/, '/');
          if (!htmlContent.match(/<head[^>]*>/i)) {
            htmlContent = htmlContent.replace(/<html[^>]*>/i, '$&<head><base href="' + baseUrl + '"></head>');
          } else {
            htmlContent = htmlContent.replace(/<head[^>]*>/i, '$&<base href="' + baseUrl + '">');
          }
        }

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        gameFrame.src = blobUrl;
      } catch (err) {
        console.warn('Direct blob injection fallback to url:', err);
        gameFrame.src = fullUrl;
      }
      return;
    }

    if (game.provider === 'truffled') {
      if (game.frameType === 'unity') {
        const proxyBase = truffledProxySelect.value.replace(/\/$/, "");
        gameFrame.src = `${proxyBase}/unityframe.html?url=${encodeURIComponent(game.rawUrl)}`;
      } else {
        gameFrame.src = game.url;
      }
      return;
    }

    gameFrame.src = fullUrl;
  }

  function closeGamePlayer() {
    playerView.classList.add('hidden');
    galleryView.classList.remove('hidden');
    gameFrame.src = 'about:blank';
    currentGame = null;
  }

  // Player controls
  playerBackBtn.addEventListener('click', closeGamePlayer);

  playerReloadBtn.addEventListener('click', () => {
    if (currentGame) openGame(currentGame);
  });

  playerFullscreenBtn.addEventListener('click', () => {
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen();
    }
  });

  playerBlankBtn.addEventListener('click', () => {
    if (!currentGame) return;
    let url = currentGame.url;
    if (currentGame.provider === 'gn-math' && !url.startsWith('http')) {
      url = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main/' + currentGame.url.replace('{HTML_URL}', '');
    }
    cloaker.openInAboutBlank(url, currentGame.name);
  });

  playerDownloadBtn.addEventListener('click', async () => {
    if (!currentGame) return;
    let fullUrl = currentGame.url;
    if (currentGame.provider === 'gn-math' && !currentGame.isAbsolute) {
      fullUrl = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main/' + currentGame.url.replace('{HTML_URL}', '');
    }

    try {
      const response = await fetch(fullUrl);
      const fileContent = await response.text();
      const blob = new Blob([fileContent], { type: 'text/html' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${currentGame.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      alert('Direct download blocked by cross-origin rules for this host.');
    }
  });

  // Filter & Provider event listeners
  providerSelect.addEventListener('change', handleProviderChange);
  truffledProxySelect.addEventListener('change', loadGames);
  categorySelect.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
  refreshBtn.addEventListener('click', loadGames);

  // Initial load
  handleProviderChange();
}
