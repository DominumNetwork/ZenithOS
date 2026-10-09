/**
 * Zenith Code Studio
 * In-browser code editor with live execution sandbox and file system integration.
 */

import { state } from './state.js';

const TEMPLATES = {
  particles: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: #0a0f1d; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({length: 60}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      color: ['#7c5cff', '#38bdf8', '#10b981'][Math.floor(Math.random() * 3)]
    }));

    function loop() {
      ctx.fillStyle = 'rgba(10, 15, 29, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,

  snake: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #0b0f19; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #fff; font-family: sans-serif; }
    canvas { border: 2px solid #7c5cff; border-radius: 8px; background: #000; }
    #score { margin-bottom: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div id="score">Score: 0 (Use Arrow Keys)</div>
  <canvas id="gc" width="300" height="300"></canvas>
  <script>
    const canvas = document.getElementById('gc');
    const ctx = canvas.getContext('2d');
    let px=10, py=10, gs=15, tc=20, ax=15, ay=15, xv=0, yv=0, trail=[], tail=5, score=0;

    window.addEventListener('keydown', e => {
      if(e.key === 'ArrowLeft' && xv!==1) { xv=-1; yv=0; }
      if(e.key === 'ArrowUp' && yv!==1) { xv=0; yv=-1; }
      if(e.key === 'ArrowRight' && xv!==-1) { xv=1; yv=0; }
      if(e.key === 'ArrowDown' && yv!==-1) { xv=0; yv=1; }
    });

    setInterval(() => {
      px+=xv; py+=yv;
      if(px<0) px=tc-1; if(px>tc-1) px=0;
      if(py<0) py=tc-1; if(py>tc-1) py=0;

      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#10b981';
      for(let i=0; i<trail.length; i++) {
        ctx.fillRect(trail[i].x*gs, trail[i].y*gs, gs-2, gs-2);
        if(trail[i].x===px && trail[i].y===py && (xv!==0||yv!==0)) tail=5;
      }
      trail.push({x:px, y:py});
      while(trail.length>tail) trail.shift();

      if(ax===px && ay===py) {
        tail++; score++;
        document.getElementById('score').innerText = 'Score: ' + score;
        ax=Math.floor(Math.random()*tc); ay=Math.floor(Math.random()*tc);
      }
      ctx.fillStyle='#ef4444';
      ctx.fillRect(ax*gs, ay*gs, gs-2, gs-2);
    }, 100);
  </script>
</body>
</html>`
};

export function createCodeStudioApp(containerEl, winState, initialFile = null) {
  let activeFilename = initialFile?.filename || 'scratchpad.html';
  let activeFolder = initialFile?.folder || 'Scripts';
  let initialCode = initialFile?.content || TEMPLATES.particles;

  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950 font-mono text-xs text-slate-100 select-none overflow-hidden">
      
      <!-- Top Action Toolbar -->
      <div class="h-10 bg-slate-900 border-b border-white/10 px-3 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-accent font-bold"><i class="fa-solid fa-code mr-1"></i>Zenith Code</span>
          <span class="text-slate-500">|</span>
          <span id="code-file-label" class="text-slate-300 font-sans">${activeFilename}</span>
        </div>

        <div class="flex items-center gap-2">
          <select id="code-template-select" class="bg-slate-800 text-slate-200 border border-white/10 rounded-lg px-2 py-1 text-[11px] focus:outline-none">
            <option value="">Templates...</option>
            <option value="particles">Canvas Particle Swarm</option>
            <option value="snake">Retro Snake Game</option>
          </select>

          <button id="code-save-btn" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5" title="Save to Files">
            <i class="fa-solid fa-floppy-disk text-amber-400"></i> Save
          </button>

          <button id="code-run-btn" class="px-3 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm" title="Run / Execute">
            <i class="fa-solid fa-play text-[10px]"></i> Run Code
          </button>
        </div>
      </div>

      <!-- Split Editor & Live Preview -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Code Editor Area -->
        <div class="flex-1 flex flex-col border-r border-white/10 relative">
          <textarea id="code-editor" class="flex-1 w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none leading-relaxed" spellcheck="false">${initialCode}</textarea>
        </div>

        <!-- Live Preview Sandbox -->
        <div class="flex-1 flex flex-col bg-slate-900">
          <div class="h-6 bg-slate-900/90 border-b border-white/10 px-3 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span>LIVE PREVIEW SANDBOX</span>
            <span id="preview-status" class="text-emerald-400">Ready</span>
          </div>
          <iframe id="code-preview-frame" class="flex-1 w-full h-full border-none bg-black"></iframe>
        </div>

      </div>
    </div>
  `;

  const editor = containerEl.querySelector('#code-editor');
  const previewFrame = containerEl.querySelector('#code-preview-frame');
  const runBtn = containerEl.querySelector('#code-run-btn');
  const saveBtn = containerEl.querySelector('#code-save-btn');
  const templateSelect = containerEl.querySelector('#code-template-select');
  const fileLabel = containerEl.querySelector('#code-file-label');

  function runCode() {
    const code = editor.value;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    previewFrame.src = url;
  }

  runBtn.addEventListener('click', runCode);

  templateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (TEMPLATES[val]) {
      editor.value = TEMPLATES[val];
      activeFilename = `${val}_demo.html`;
      fileLabel.textContent = activeFilename;
      runCode();
    }
  });

  saveBtn.addEventListener('click', () => {
    const targetFolder = state.fs[activeFolder] ? activeFolder : 'Scripts';
    const folderObj = state.fs[targetFolder];
    if (folderObj) {
      folderObj.children = folderObj.children || {};
      folderObj.children[activeFilename] = {
        type: 'file',
        content: editor.value,
        modified: new Date().toISOString()
      };
      state.saveFileSystem();
      alert(`Saved '${activeFilename}' to /${targetFolder}`);
    }
  });

  // Run initial preview
  setTimeout(runCode, 200);
}
