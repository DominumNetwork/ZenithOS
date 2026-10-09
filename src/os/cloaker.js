import { state } from './state.js';

export const CLOAK_PRESETS = {
  none: {
    id: 'none',
    name: 'Default',
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

    state.subscribe((event, s) => {
      if (event === 'state') {
        const cloak = s.get('activeCloak') || 'none';
        this.applyPreset(cloak);
      }
    });

    window.addEventListener('keydown', (e) => {
      const panicKey = state.get('panicKey') || 'Escape';
      if (e.key === panicKey) {
        const now = Date.now();
        if (now - this.lastEscapeTime < 600) {
          this.escapePressCount++;
        } else {
          this.escapePressCount = 1;
        }
        this.lastEscapeTime = now;

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

    const statusText = document.getElementById('cloak-status-text');
    if (statusText) {
      statusText.textContent = presetId === 'none' ? 'Disabled' : preset.name;
    }
  }

  triggerPanic() {
    const panicUrl = state.get('panicUrl') || 'https://classroom.google.com';
    window.location.replace(panicUrl);
  }

  openInAboutBlank(url, title = 'Google Drive') {
    const win = window.open('about:blank', '_blank');
    if (!win) return false;

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
          <iframe src="${url}" allowfullscreen="true"></iframe>
        </body>
      </html>
    `);
    win.document.close();
    return true;
  }

  launchAboutBlankCloak() {
    this.openInAboutBlank(window.location.href, 'My Drive - Google Drive');
  }

  launchBlobCloak() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Docs</title>
          <link rel="icon" href="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico">
          <style>
            body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
            iframe { width:100%; height:100%; border:none; }
          </style>
        </head>
        <body><iframe src="${window.location.href}" allowfullscreen="true"></iframe></body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  downloadHtmlCloak() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Classroom</title>
          <link rel="icon" href="https://ssl.gstatic.com/classroom/favicon.png">
          <style>
            body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
            iframe { width:100%; height:100%; border:none; }
          </style>
        </head>
        <body><iframe src="${window.location.href}" allowfullscreen="true"></iframe></body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'classroom_launcher.html';
    a.click();
  }

  launchBase64Cloak() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Classes</title>
          <link rel="icon" href="https://ssl.gstatic.com/classroom/favicon.png">
          <style>
            body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
            iframe { width:100%; height:100%; border:none; }
          </style>
        </head>
        <body><iframe src="${window.location.href}" allowfullscreen="true"></iframe></body>
      </html>
    `;
    const b64 = btoa(unescape(encodeURIComponent(html)));
    window.open(`data:text/html;base64,${b64}`, '_blank');
  }
}

export const cloaker = new Cloaker();
