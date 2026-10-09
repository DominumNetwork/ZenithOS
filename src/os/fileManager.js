/**
 * ZenithOS Virtual File Explorer
 */

import { state } from './state.js';
import { windowManager } from './windowManager.js';

export function createFileManagerApp(containerEl, winState) {
  let currentFolder = 'Desktop';
  let history = ['Desktop'];
  let historyIdx = 0;
  let selectedItem = null;

  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950/80 text-slate-100 select-none overflow-hidden text-xs">
      
      <!-- Top Explorer Toolbar -->
      <div class="h-11 bg-slate-900/90 border-b border-white/10 px-3 flex items-center justify-between gap-3 shrink-0">
        <!-- Navigation Buttons -->
        <div class="flex items-center gap-1">
          <button id="fm-back" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Back">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <button id="fm-forward" class="p-1.5 px-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Forward">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          
          <!-- Breadcrumb Path -->
          <div id="fm-breadcrumb" class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 ml-2">
            <i class="fa-solid fa-house text-accent text-[11px]"></i>
            <span>/</span>
            <span id="fm-current-dir" class="font-semibold text-white">Desktop</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5">
          <button id="fm-new-file" class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5" title="New Text File">
            <i class="fa-solid fa-file-circle-plus text-accent"></i> New File
          </button>
          <button id="fm-new-folder" class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5" title="New Folder">
            <i class="fa-solid fa-folder-plus text-amber-400"></i> New Folder
          </button>
          <label class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer" title="Upload Local File">
            <i class="fa-solid fa-upload text-sky-400"></i> Upload
            <input type="file" id="fm-upload-input" class="hidden" />
          </label>
        </div>
      </div>

      <!-- Main Explorer Body: Sidebar + File Grid -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Sidebar Navigation -->
        <div class="w-44 bg-slate-900/60 border-r border-white/10 p-2 space-y-1 shrink-0">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Quick Access</div>
          <button class="fm-nav-btn w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-left transition-colors" data-path="Desktop">
            <i class="fa-solid fa-desktop text-accent w-4"></i> Desktop
          </button>
          <button class="fm-nav-btn w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-left transition-colors" data-path="Documents">
            <i class="fa-solid fa-file-lines text-indigo-400 w-4"></i> Documents
          </button>
          <button class="fm-nav-btn w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-left transition-colors" data-path="Downloads">
            <i class="fa-solid fa-download text-emerald-400 w-4"></i> Downloads
          </button>
          <button class="fm-nav-btn w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-left transition-colors" data-path="Pictures">
            <i class="fa-solid fa-image text-rose-400 w-4"></i> Pictures
          </button>
          <button class="fm-nav-btn w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-left transition-colors" data-path="Scripts">
            <i class="fa-solid fa-code text-amber-400 w-4"></i> Scripts
          </button>
        </div>

        <!-- Files Content Area -->
        <div id="fm-content" class="flex-1 p-4 overflow-y-auto">
          <div id="fm-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <!-- Populated via JS -->
          </div>
        </div>

      </div>

      <!-- Bottom Status Bar -->
      <div id="fm-status" class="h-6 bg-slate-900/90 border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span id="fm-item-count">0 items</span>
        <span id="fm-selected-info">No item selected</span>
      </div>
    </div>
  `;

  const gridEl = containerEl.querySelector('#fm-grid');
  const currentDirEl = containerEl.querySelector('#fm-current-dir');
  const itemCountEl = containerEl.querySelector('#fm-item-count');
  const selectedInfoEl = containerEl.querySelector('#fm-selected-info');
  const backBtn = containerEl.querySelector('#fm-back');
  const forwardBtn = containerEl.querySelector('#fm-forward');
  const newFileBtn = containerEl.querySelector('#fm-new-file');
  const newFolderBtn = containerEl.querySelector('#fm-new-folder');
  const uploadInput = containerEl.querySelector('#fm-upload-input');

  function renderDirectory() {
    currentDirEl.textContent = currentFolder;
    gridEl.innerHTML = '';
    selectedItem = null;
    selectedInfoEl.textContent = 'No item selected';

    // Highlight active sidebar item
    containerEl.querySelectorAll('.fm-nav-btn').forEach(btn => {
      if (btn.dataset.path === currentFolder) {
        btn.classList.add('bg-white/15', 'text-white', 'font-semibold');
      } else {
        btn.classList.remove('bg-white/15', 'text-white', 'font-semibold');
      }
    });

    const folderData = state.fs[currentFolder];
    if (!folderData || folderData.type !== 'folder') {
      gridEl.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400">Folder not found.</div>`;
      itemCountEl.textContent = '0 items';
      return;
    }

    const items = Object.entries(folderData.children || {});
    itemCountEl.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;

    if (items.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <i class="fa-regular fa-folder-open text-3xl opacity-40"></i>
          <span>This folder is empty.</span>
        </div>
      `;
      return;
    }

    items.forEach(([name, item]) => {
      const isFolder = item.type === 'folder';
      const itemEl = document.createElement('div');
      itemEl.className = 'flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 cursor-pointer transition-all duration-150 text-center group';
      
      let iconHtml = `<i class="fa-solid fa-folder text-3xl text-amber-400 mb-2"></i>`;
      if (!isFolder) {
        if (name.endsWith('.js') || name.endsWith('.ts')) {
          iconHtml = `<i class="fa-brands fa-js text-3xl text-yellow-400 mb-2"></i>`;
        } else if (name.endsWith('.html')) {
          iconHtml = `<i class="fa-brands fa-html5 text-3xl text-orange-400 mb-2"></i>`;
        } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp')) {
          iconHtml = `<i class="fa-solid fa-file-image text-3xl text-rose-400 mb-2"></i>`;
        } else {
          iconHtml = `<i class="fa-solid fa-file-lines text-3xl text-slate-300 mb-2"></i>`;
        }
      }

      itemEl.innerHTML = `
        ${iconHtml}
        <span class="text-xs text-slate-200 truncate w-full font-medium group-hover:text-white">${name}</span>
      `;

      itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        containerEl.querySelectorAll('#fm-grid > div').forEach(el => el.classList.remove('ring-2', 'ring-accent', 'bg-white/15'));
        itemEl.classList.add('ring-2', 'ring-accent', 'bg-white/15');
        selectedItem = { name, item };
        const size = isFolder ? `${Object.keys(item.children || {}).length} items` : `${(item.content || '').length} bytes`;
        selectedInfoEl.textContent = `${name} (${size})`;
      });

      itemEl.addEventListener('dblclick', () => {
        if (isFolder) {
          navigateTo(name);
        } else {
          openFile(name, item);
        }
      });

      gridEl.appendChild(itemEl);
    });
  }

  function navigateTo(folderName) {
    if (state.fs[folderName]) {
      currentFolder = folderName;
      history = history.slice(0, historyIdx + 1);
      history.push(folderName);
      historyIdx++;
      renderDirectory();
    }
  }

  function openFile(name, file) {
    // Open in Zenith Code editor
    windowManager.createWindow({
      id: 'code',
      title: `Zenith Code - ${name}`,
      icon: 'fa-solid fa-code',
      width: 900,
      height: 580,
      onInit: (bodyEl, winEl, ws) => {
        import('./codeStudio.js').then(m => {
          m.createCodeStudioApp(bodyEl, ws, { filename: name, content: file.content, folder: currentFolder });
        });
      }
    });
  }

  // Sidebar navigation
  containerEl.querySelectorAll('.fm-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const path = btn.dataset.path;
      if (path) navigateTo(path);
    });
  });

  // History buttons
  backBtn.addEventListener('click', () => {
    if (historyIdx > 0) {
      historyIdx--;
      currentFolder = history[historyIdx];
      renderDirectory();
    }
  });

  forwardBtn.addEventListener('click', () => {
    if (historyIdx < history.length - 1) {
      historyIdx++;
      currentFolder = history[historyIdx];
      renderDirectory();
    }
  });

  // New File button
  newFileBtn.addEventListener('click', () => {
    const filename = prompt('Enter filename (e.g. notes.txt or script.js):', 'untitled.txt');
    if (!filename) return;

    const folder = state.fs[currentFolder];
    if (folder) {
      folder.children = folder.children || {};
      folder.children[filename] = {
        type: 'file',
        content: `// Created on ${new Date().toLocaleString()}\n`,
        modified: new Date().toISOString()
      };
      state.saveFileSystem();
      renderDirectory();
    }
  });

  // New Folder button
  newFolderBtn.addEventListener('click', () => {
    const foldername = prompt('Enter folder name:', 'NewFolder');
    if (!foldername) return;

    if (!state.fs[foldername]) {
      state.fs[foldername] = { type: 'folder', children: {} };
      state.saveFileSystem();
      renderDirectory();
    } else {
      alert('A folder with that name already exists!');
    }
  });

  // Upload local file into virtual file system
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const folder = state.fs[currentFolder];
      if (folder) {
        folder.children = folder.children || {};
        folder.children[file.name] = {
          type: 'file',
          content: evt.target.result,
          modified: new Date().toISOString()
        };
        state.saveFileSystem();
        renderDirectory();
      }
    };
    reader.readAsText(file);
  });

  // Deselect on blank click
  gridEl.addEventListener('click', () => {
    containerEl.querySelectorAll('#fm-grid > div').forEach(el => el.classList.remove('ring-2', 'ring-accent', 'bg-white/15'));
    selectedItem = null;
    selectedInfoEl.textContent = 'No item selected';
  });

  // Listen for external file system updates
  state.subscribe((evt) => {
    if (evt === 'fs') renderDirectory();
  });

  renderDirectory();
}
