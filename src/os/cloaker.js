/**
 * ZenithOS Tab Cloaker & Privacy Stealth Suite
 */
import { state } from './state.js';

export const CLOAK_PRESETS = {
  none: {
    id: 'none',
    name: 'Default (ZenithOS)',
    title: 'ZenithOS',
    icon: 'https://cdn.jsdelivr.net/gh/DominumNetwork/Dominum@main/src/assets/images/transparent-dominum.png'
  },
  classroom: {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  drive: {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png'
  },
  docs: {
    id: 'docs',
    name: 'Google Docs',
    title: 'Google Docs',
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  canvas: {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
  },
  desmos: {
    id: 'desmos',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    icon: 'https://www.desmos.com/favicon.ico'
  },
  edpuzzle: {
    id: 'edpuzzle',
    name: 'Edpuzzle',
    title: 'Edpuzzle',
    icon: 'https://edpuzzle.imgix.net/favicons/favicon-32.png'
  },
  khan: {
    id: 'khan',
    name: 'Khan Academy',
    title: 'Dashboard | Khan Academy',
    icon: 'https://www.khanacademy.org/favicon.ico'
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    title: 'Wikipedia, the free encyclopedia',
    icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  }
};

export class Cloaker {
  constructor() {
    this.escapePressCount = 0;
    this.lastEscapeTime = 0;
    this.init();
  }

  init() {
    const currentPreset = state.get('activeCloak') || 'none';
    this.applyPreset(currentPreset);

    // Listen for state changes
    state.subscribe((event, s) => {
      if (event === 'state') {
        const cloak = s.get('activeCloak') || 'none';
        this.applyPreset(cloak);
      }
    });

    // Panic key detector
    window.addEventListener('keydown', (e) => {
      const panicKey = state.get('panicKey') || 'Escape';
      
      if (e.key === panicKey) {
        const now = Date.now();
        if (now - this.lastEscapeTime < 700) {
          this.escapePressCount++;
        } else {
          this.escapePressCount = 1;
        }
        this.lastEscapeTime = now;

        // Triple tap panic key triggers immediate disguise or panic redirection
        if (this.escapePressCount >= 3) {
          this.escapePressCount = 0;
          this.triggerPanic();
        }
      }
    });
  }

  applyPreset(presetId) {
    const preset = CLOAK_PRESETS[presetId] || CLOAK_PRESETS.none;
    document.title = preset.title;

    let favicon = document.getElementById('app-favicon');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'app-favicon';
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = preset.icon;

    // Update Control Center indicator if present
    const statusText = document.getElementById('cloak-status-text');
    if (statusText) {
      statusText.textContent = presetId === 'none' ? 'Disabled' : preset.name;
    }
  }

  setCustomCloak(title, iconUrl) {
    if (title) document.title = title;
    let favicon = document.getElementById('app-favicon');
    if (favicon && iconUrl) favicon.href = iconUrl;
    state.set('activeCloak', 'custom');
  }

  triggerPanic() {
    const panicUrl = state.get('panicUrl') || 'https://classroom.google.com';
    // If not currently cloaked, toggle to classroom cloak, or redirect
    const current = state.get('activeCloak');
    if (current === 'none') {
      state.set('activeCloak', 'classroom');
    } else {
      // Immediate emergency redirect
      window.location.replace(panicUrl);
    }
  }

  /**
   * Opens any URL inside an unblockable about:blank popup tab
   */
  openInAboutBlank(url, title = 'Google Drive') {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      console.warn('Pop-up was blocked by browser.');
      return false;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <link rel="icon" href="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png">
          <style>
            body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
            iframe { width:100%; height:100%; border:none; display:block; }
          </style>
        </head>
        <body>
          <iframe id="stealth-frame" src="${url}" allowfullscreen="true"></iframe>
        </body>
      </html>
    `);
    win.document.close();
    return true;
  }
}

export const cloaker = new Cloaker();
