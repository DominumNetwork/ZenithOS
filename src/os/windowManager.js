/**
 * ZenithOS Multi-Window Manager
 */

export class WindowManager {
  constructor() {
    this.windows = new Map(); // id -> window state
    this.container = null;
    this.highestZIndex = 100;
    this.activeWindowId = null;
    this.windowCount = 0;
  }

  init() {
    this.container = document.getElementById('windows-container');
    
    // Global listener to prevent mouse capture issues over iframes during drag/resize
    window.addEventListener('blur', () => this.endGlobalInteractions());
  }

  createWindow(options) {
    const {
      id = `win_${++this.windowCount}`,
      title = 'Application',
      icon = 'fa-solid fa-window-maximize',
      width = 860,
      height = 560,
      minWidth = 380,
      minHeight = 280,
      content = '',
      onInit = null,
      onClose = null,
      isSingleInstance = true
    } = options;

    // If single instance and already open, focus or unminimize it
    if (isSingleInstance && this.windows.has(id)) {
      const existing = this.windows.get(id);
      if (existing.minimized) {
        this.restoreWindow(id);
      } else {
        this.bringToFront(id);
      }
      return existing;
    }

    // Calculate initial centered position with slight offset
    const workspace = document.getElementById('workspace') || document.body;
    const wsRect = workspace.getBoundingClientRect();
    const offset = (this.windows.size * 28) % 140;

    let initialW = Math.min(width, wsRect.width - 40);
    let initialH = Math.min(height, wsRect.height - 80);
    let initialX = Math.max(20, Math.floor((wsRect.width - initialW) / 2) + offset);
    let initialY = Math.max(10, Math.floor((wsRect.height - initialH) / 2) - 20 + offset);

    // Build DOM structure
    const winEl = document.createElement('div');
    winEl.id = `window-${id}`;
    winEl.className = 'zenith-window active';
    winEl.style.width = `${initialW}px`;
    winEl.style.height = `${initialH}px`;
    winEl.style.left = `${initialX}px`;
    winEl.style.top = `${initialY}px`;
    winEl.style.zIndex = ++this.highestZIndex;

    winEl.innerHTML = `
      <div class="window-titlebar">
        <div class="traffic-lights">
          <button class="traffic-light traffic-close" title="Close"><i class="fa-solid fa-xmark"></i></button>
          <button class="traffic-light traffic-minimize" title="Minimize"><i class="fa-solid fa-minus"></i></button>
          <button class="traffic-light traffic-maximize" title="Maximize"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>
        </div>
        <div class="window-title">
          <i class="${icon} text-accent text-xs"></i>
          <span>${title}</span>
        </div>
        <div class="window-actions"></div>
      </div>
      <div class="window-body"></div>
      <div class="window-resizer resizer-r"></div>
      <div class="window-resizer resizer-b"></div>
      <div class="window-resizer resizer-rb"></div>
    `;

    const bodyEl = winEl.querySelector('.window-body');
    if (typeof content === 'string') {
      bodyEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      bodyEl.appendChild(content);
    }

    this.container.appendChild(winEl);

    const winState = {
      id,
      title,
      icon,
      element: winEl,
      body: bodyEl,
      x: initialX,
      y: initialY,
      width: initialW,
      height: initialH,
      minWidth,
      minHeight,
      maximized: false,
      minimized: false,
      restoreRect: { x: initialX, y: initialY, w: initialW, h: initialH },
      onInit,
      onClose
    };

    this.windows.set(id, winState);
    this.activeWindowId = id;
    this.updateActiveClasses();
    this.updateDockIndicators();

    // Setup interactive handlers (Drag, Resize, Traffic lights)
    this.setupWindowInteractions(winState);

    // Run onInit
    if (typeof onInit === 'function') {
      try {
        onInit(bodyEl, winEl, winState);
      } catch (err) {
        console.error(`Error initializing window ${id}:`, err);
      }
    }

    return winState;
  }

  setupWindowInteractions(win) {
    const { element, id } = win;
    const titlebar = element.querySelector('.window-titlebar');
    const closeBtn = element.querySelector('.traffic-close');
    const minBtn = element.querySelector('.traffic-minimize');
    const maxBtn = element.querySelector('.traffic-maximize');
    const resizerRB = element.querySelector('.resizer-rb');
    const resizerR = element.querySelector('.resizer-r');
    const resizerB = element.querySelector('.resizer-b');

    // Click to focus
    element.addEventListener('pointerdown', () => {
      this.bringToFront(id);
    });

    // Traffic light buttons
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    // Double-click titlebar to maximize / restore
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.traffic-lights')) return;
      this.toggleMaximize(id);
    });

    // Window Dragging
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const onPointerDown = (e) => {
      if (e.target.closest('.traffic-lights') || e.target.closest('button') || e.target.closest('input')) return;
      if (win.maximized) return; // Cannot drag while maximized

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = win.x;
      initialTop = win.y;

      this.disableIframeEvents(true);
      this.bringToFront(id);

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const ws = document.getElementById('workspace') || document.body;
      const wsRect = ws.getBoundingClientRect();

      let newX = initialLeft + dx;
      let newY = initialTop + dy;

      // Keep titlebar within workspace bounds
      newY = Math.max(0, Math.min(newY, wsRect.height - 40));
      newX = Math.max(-win.width + 100, Math.min(newX, wsRect.width - 100));

      win.x = newX;
      win.y = newY;
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      this.disableIframeEvents(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    titlebar.addEventListener('pointerdown', onPointerDown);

    // Window Resizing
    this.setupResizer(win, resizerRB, true, true);
    this.setupResizer(win, resizerR, true, false);
    this.setupResizer(win, resizerB, false, true);
  }

  setupResizer(win, handle, resizeX, resizeY) {
    if (!handle) return;
    let isResizing = false;
    let startX = 0, startY = 0;
    let initialW = 0, initialH = 0;

    const onPointerDown = (e) => {
      e.stopPropagation();
      if (win.maximized) return;

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      initialW = win.width;
      initialH = win.height;

      this.disableIframeEvents(true);
      this.bringToFront(win.id);

      const onPointerMove = (moveEvt) => {
        if (!isResizing) return;
        if (resizeX) {
          const newW = Math.max(win.minWidth, initialW + (moveEvt.clientX - startX));
          win.width = newW;
          win.element.style.width = `${newW}px`;
        }
        if (resizeY) {
          const newH = Math.max(win.minHeight, initialH + (moveEvt.clientY - startY));
          win.height = newH;
          win.element.style.height = `${newH}px`;
        }
      };

      const onPointerUp = () => {
        isResizing = false;
        this.disableIframeEvents(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    handle.addEventListener('pointerdown', onPointerDown);
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win) return;

    this.highestZIndex++;
    win.element.style.zIndex = this.highestZIndex;
    this.activeWindowId = id;
    this.updateActiveClasses();
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.minimized = true;
    win.element.classList.add('minimized');
    
    // If active, pick next top window
    if (this.activeWindowId === id) {
      this.pickNextActiveWindow();
    }
    this.updateDockIndicators();
  }

  restoreWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.minimized = false;
    win.element.classList.remove('minimized');
    this.bringToFront(id);
    this.updateDockIndicators();
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.maximized = !win.maximized;

    if (win.maximized) {
      // Save current rect
      win.restoreRect = { x: win.x, y: win.y, w: win.width, h: win.height };
      win.element.classList.add('maximized');
    } else {
      win.element.classList.remove('maximized');
      win.x = win.restoreRect.x;
      win.y = win.restoreRect.y;
      win.width = win.restoreRect.w;
      win.height = win.restoreRect.h;
      win.element.style.left = `${win.x}px`;
      win.element.style.top = `${win.y}px`;
      win.element.style.width = `${win.width}px`;
      win.element.style.height = `${win.height}px`;
    }
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.element.style.opacity = '0';
    win.element.style.transform = 'scale(0.9)';

    setTimeout(() => {
      if (typeof win.onClose === 'function') {
        try {
          win.onClose(win);
        } catch (e) {
          console.error(`Error in onClose for window ${id}:`, e);
        }
      }

      win.element.remove();
      this.windows.delete(id);

      if (this.activeWindowId === id) {
        this.pickNextActiveWindow();
      }
      this.updateDockIndicators();
    }, 180);
  }

  pickNextActiveWindow() {
    let topWin = null;
    let maxZ = -1;

    for (const [_, w] of this.windows.entries()) {
      if (!w.minimized) {
        const z = parseInt(w.element.style.zIndex || '0', 10);
        if (z > maxZ) {
          maxZ = z;
          topWin = w;
        }
      }
    }

    this.activeWindowId = topWin ? topWin.id : null;
    this.updateActiveClasses();
  }

  updateActiveClasses() {
    for (const [id, w] of this.windows.entries()) {
      if (id === this.activeWindowId) {
        w.element.classList.add('active');
      } else {
        w.element.classList.remove('active');
      }
    }
    this.updateDockIndicators();
  }

  updateDockIndicators() {
    document.querySelectorAll('.dock-item').forEach(item => {
      const app = item.dataset.app;
      if (!app) return;

      const isOpen = this.windows.has(app);
      const isMin = isOpen && this.windows.get(app).minimized;
      const isActive = isOpen && this.activeWindowId === app && !isMin;

      if (isOpen) {
        item.classList.add('running');
      } else {
        item.classList.remove('running');
      }

      if (isActive) {
        item.classList.add('active-app');
      } else {
        item.classList.remove('active-app');
      }
    });
  }

  disableIframeEvents(disable) {
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.style.pointerEvents = disable ? 'none' : 'auto';
    });
  }

  endGlobalInteractions() {
    this.disableIframeEvents(false);
  }

  cascadeWindows() {
    let offset = 40;
    for (const [_, win] of this.windows.entries()) {
      if (win.minimized) continue;
      if (win.maximized) this.toggleMaximize(win.id);

      win.x = offset;
      win.y = offset;
      win.element.style.left = `${offset}px`;
      win.element.style.top = `${offset}px`;
      this.bringToFront(win.id);
      offset += 32;
    }
  }

  minimizeAll() {
    for (const [id, _] of this.windows.entries()) {
      this.minimizeWindow(id);
    }
  }

  restoreAll() {
    for (const [id, _] of this.windows.entries()) {
      this.restoreWindow(id);
    }
  }

  closeAll() {
    const ids = Array.from(this.windows.keys());
    ids.forEach(id => this.closeWindow(id));
  }
}

export const windowManager = new WindowManager();
