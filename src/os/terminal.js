import { state, THEMES, WALLPAPERS } from './state.js';
import { cloaker, CLOAK_PRESETS } from './cloaker.js';
import { windowManager } from './windowManager.js';

export function createTerminalApp(containerEl, winState) {
  let tabs = [{ id: 1, name: 'Terminal 1', history: [], historyIndex: -1, currentPath: 'Desktop' }];
  let activeTabId = 1;

  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950 font-mono text-xs text-slate-100 select-none overflow-hidden">
      <!-- Tabs Bar -->
      <div id="term-tabs-bar" class="flex items-center px-2 pt-1.5 bg-slate-900 border-b border-white/10 gap-1 text-[11px] shrink-0">
        <div id="term-tabs-list" class="flex items-center gap-1">
          <!-- Injected tabs -->
        </div>
        <button id="term-add-tab-btn" class="p-1 px-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="New Terminal Tab">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>

      <!-- Terminal Output Pane -->
      <div id="term-body" class="flex-1 p-3.5 overflow-y-auto font-mono text-xs select-text space-y-1">
        <div class="text-slate-400 mb-2 leading-relaxed">
          <span class="text-accent font-bold">Zenith Terminal v2.4</span> [Vanilla JS Engine]<br>
          Type <span class="text-emerald-400 font-semibold">help</span> for commands, or <span class="text-sky-400 font-semibold">neofetch</span> for system summary.<br>
          Run <span class="text-amber-400 font-semibold">node &lt;file.js&gt;</span> to execute scripts.
        </div>
        <div id="term-history"></div>
        <div class="flex items-center gap-2 pt-1" id="term-prompt-line">
          <span class="text-emerald-400 font-bold" id="term-prompt-label">zenith@user:~/Desktop$</span>
          <div class="flex-1 flex items-center relative">
            <input type="text" id="term-input" class="w-full bg-transparent text-slate-100 focus:outline-none font-mono text-xs caret-emerald-400" autocomplete="off" spellcheck="false" autofocus />
          </div>
        </div>
      </div>
    </div>
  `;

  const tabsList = containerEl.querySelector('#term-tabs-list');
  const addTabBtn = containerEl.querySelector('#term-add-tab-btn');
  const termBody = containerEl.querySelector('#term-body');
  const termHistory = containerEl.querySelector('#term-history');
  const termPromptLabel = containerEl.querySelector('#term-prompt-label');
  const termInput = containerEl.querySelector('#term-input');

  let commandHistory = [];
  let historyPointer = -1;
  let matrixInterval = null;

  function renderTabs() {
    tabsList.innerHTML = '';
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      const isActive = tab.id === activeTabId;
      tabEl.className = `flex items-center gap-2 px-3 py-1 rounded-t border-t border-x cursor-pointer transition-colors ${
        isActive 
          ? 'bg-slate-950 border-white/20 text-white font-medium' 
          : 'bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
      }`;
      tabEl.innerHTML = `
        <span><i class="fa-solid fa-terminal text-[10px] mr-1 ${isActive ? 'text-accent' : 'opacity-50'}"></i>${tab.name}</span>
        ${tabs.length > 1 ? `<button class="hover:text-red-400 text-[10px] ml-1 tab-close"><i class="fa-solid fa-xmark"></i></button>` : ''}
      `;

      tabEl.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) {
          e.stopPropagation();
          closeTab(tab.id);
          return;
        }
        activeTabId = tab.id;
        renderTabs();
        updatePromptLabel();
        termInput.focus();
      });

      tabsList.appendChild(tabEl);
    });
  }

  function addTab() {
    const newId = (tabs[tabs.length - 1]?.id || 0) + 1;
    tabs.push({ id: newId, name: `Terminal ${newId}`, history: [], historyIndex: -1, currentPath: 'Desktop' });
    activeTabId = newId;
    renderTabs();
    printLine(`<span class="text-slate-500">--- Spawned new session [Terminal ${newId}] ---</span>`);
    termInput.focus();
  }

  function closeTab(id) {
    if (tabs.length <= 1) return;
    tabs = tabs.filter(t => t.id !== id);
    if (activeTabId === id) {
      activeTabId = tabs[0].id;
    }
    renderTabs();
    updatePromptLabel();
  }

  function updatePromptLabel() {
    const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    termPromptLabel.textContent = `zenith@user:~/${currentTab.currentPath}$`;
  }

  function printLine(html) {
    const div = document.createElement('div');
    div.className = 'leading-relaxed break-words';
    div.innerHTML = html;
    termHistory.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    commandHistory.push(cmd);
    historyPointer = commandHistory.length;

    const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    printLine(`<span class="text-emerald-400 font-bold">zenith@user:~/${currentTab.currentPath}$</span> <span class="text-white">${escapeHtml(cmd)}</span>`);

    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (mainCmd) {
      case 'help':
        printLine(`
<div class="my-1 border-l-2 border-accent pl-3 space-y-1 text-slate-300">
  <div><span class="text-emerald-400 font-bold">help</span>           - Show this command manual</div>
  <div><span class="text-emerald-400 font-bold">clear</span>          - Clear terminal window</div>
  <div><span class="text-emerald-400 font-bold">neofetch</span>       - Display ZenithOS specifications</div>
  <div><span class="text-emerald-400 font-bold">matrix</span>         - Run digital rain animation</div>
  <div><span class="text-emerald-400 font-bold">ls</span>             - List files in current folder</div>
  <div><span class="text-emerald-400 font-bold">cd &lt;dir&gt;</span>        - Change working directory</div>
  <div><span class="text-emerald-400 font-bold">cat &lt;file&gt;</span>       - Display text file content</div>
  <div><span class="text-emerald-400 font-bold">touch &lt;file&gt;</span>     - Create an empty file</div>
  <div><span class="text-emerald-400 font-bold">mkdir &lt;folder&gt;</span>   - Create a new directory</div>
  <div><span class="text-emerald-400 font-bold">rm &lt;target&gt;</span>      - Delete file or folder</div>
  <div><span class="text-emerald-400 font-bold">echo &lt;text&gt;</span>      - Print arguments</div>
  <div><span class="text-emerald-400 font-bold">date</span>           - Current date and time</div>
  <div><span class="text-emerald-400 font-bold">uptime</span>         - System uptime</div>
  <div><span class="text-emerald-400 font-bold">calc &lt;math&gt;</span>      - Calculate math expression</div>
  <div><span class="text-emerald-400 font-bold">cowsay &lt;msg&gt;</span>     - ASCII cow speech</div>
  <div><span class="text-emerald-400 font-bold">node &lt;file.js&gt;</span>   - Execute JavaScript script from file</div>
  <div><span class="text-emerald-400 font-bold">theme &lt;name&gt;</span>     - Switch theme (zenith, cyber, sunset, crimson, midnight, matrix, slate)</div>
  <div><span class="text-emerald-400 font-bold">cloak &lt;preset&gt;</span>   - Disguise tab (classroom, drive, docs, canvas, desmos, none)</div>
  <div><span class="text-emerald-400 font-bold">open &lt;app&gt;</span>       - Launch app (games, files, code, browser, music, settings)</div>
</div>
        `);
        break;

      case 'clear':
      case 'cls':
        termHistory.innerHTML = '';
        break;

      case 'neofetch':
      case 'sysinfo':
        printLine(`
<div class="flex flex-col md:flex-row gap-4 my-2 text-slate-300">
  <div class="text-accent font-bold whitespace-pre font-mono leading-none select-none">
       ___  ___ _  _ ___ _____ _  _
      |_  /| __| \\| |_ _|_   _| || |
       / / | _|| .\` || |  | | | __ |
      /___||___|_|\\_|___| |_| |_||_|
             [ ZENITH OS 2.0 ]
  </div>
  <div class="space-y-0.5">
    <div><span class="text-accent font-bold">OS:</span> ZenithOS Modern Web Desktop</div>
    <div><span class="text-accent font-bold">Host:</span> Browser Virtual Machine (60fps)</div>
    <div><span class="text-accent font-bold">Engine:</span> Pure Vanilla JavaScript (No React/TS)</div>
    <div><span class="text-accent font-bold">Theme:</span> ${THEMES[state.get('theme')]?.name || 'Zenith'}</div>
    <div><span class="text-accent font-bold">Resolution:</span> ${window.innerWidth}x${window.innerHeight}</div>
    <div><span class="text-accent font-bold">Storage:</span> LocalStorage VirtualFS (Mounted)</div>
    <div><span class="text-accent font-bold">Safety:</span> Ad-Free / Telemetry-Free</div>
    <div class="flex gap-1.5 pt-1">
      <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
      <span class="w-3 h-3 rounded-full bg-purple-500"></span>
      <span class="w-3 h-3 rounded-full bg-sky-500"></span>
      <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
      <span class="w-3 h-3 rounded-full bg-amber-500"></span>
      <span class="w-3 h-3 rounded-full bg-rose-500"></span>
    </div>
  </div>
</div>
        `);
        break;

      case 'ls': {
        const targetPath = args[0] || currentTab.currentPath;
        const dir = state.fs[targetPath];
        if (!dir || dir.type !== 'folder') {
          printLine(`<span class="text-red-400">ls: cannot access '${targetPath}': No such directory</span>`);
          break;
        }

        const entries = Object.entries(dir.children || {});
        if (entries.length === 0) {
          printLine(`<span class="text-slate-500">(empty directory)</span>`);
          break;
        }

        const formatted = entries.map(([name, item]) => {
          if (item.type === 'folder') {
            return `<span class="text-sky-400 font-bold">${name}/</span>`;
          }
          if (name.endsWith('.js')) {
            return `<span class="text-emerald-400 font-bold">${name}*</span>`;
          }
          return `<span class="text-slate-200">${name}</span>`;
        }).join('&nbsp;&nbsp;&nbsp;&nbsp;');

        printLine(formatted);
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~' || target === '/') {
          currentTab.currentPath = 'Desktop';
        } else if (state.fs[target] && state.fs[target].type === 'folder') {
          currentTab.currentPath = target;
        } else {
          printLine(`<span class="text-red-400">cd: ${target}: No such directory</span>`);
        }
        updatePromptLabel();
        break;
      }

      case 'cat': {
        const filename = args[0];
        if (!filename) {
          printLine(`<span class="text-red-400">Usage: cat &lt;filename&gt;</span>`);
          break;
        }
        const dir = state.fs[currentTab.currentPath];
        const file = dir?.children?.[filename];
        if (!file) {
          printLine(`<span class="text-red-400">cat: ${filename}: No such file</span>`);
        } else {
          printLine(`<pre class="whitespace-pre-wrap text-slate-300">${escapeHtml(file.content || '')}</pre>`);
        }
        break;
      }

      case 'touch': {
        const filename = args[0];
        if (!filename) {
          printLine(`<span class="text-red-400">Usage: touch &lt;filename&gt;</span>`);
          break;
        }
        const dir = state.fs[currentTab.currentPath];
        if (dir) {
          dir.children = dir.children || {};
          dir.children[filename] = {
            type: 'file',
            content: '',
            modified: new Date().toISOString()
          };
          state.saveFileSystem();
          printLine(`<span class="text-emerald-400">Created file '${filename}'</span>`);
        }
        break;
      }

      case 'mkdir': {
        const folderName = args[0];
        if (!folderName) {
          printLine(`<span class="text-red-400">Usage: mkdir &lt;folder&gt;</span>`);
          break;
        }
        if (!state.fs[folderName]) {
          state.fs[folderName] = { type: 'folder', children: {} };
          state.saveFileSystem();
          printLine(`<span class="text-emerald-400">Created directory '${folderName}'</span>`);
        } else {
          printLine(`<span class="text-red-400">mkdir: cannot create directory '${folderName}': File exists</span>`);
        }
        break;
      }

      case 'rm': {
        const target = args[0];
        if (!target) {
          printLine(`<span class="text-red-400">Usage: rm &lt;filename&gt;</span>`);
          break;
        }
        const dir = state.fs[currentTab.currentPath];
        if (dir?.children?.[target]) {
          delete dir.children[target];
          state.saveFileSystem();
          printLine(`<span class="text-emerald-400">Removed '${target}'</span>`);
        } else if (state.fs[target]) {
          delete state.fs[target];
          state.saveFileSystem();
          printLine(`<span class="text-emerald-400">Removed directory '${target}'</span>`);
        } else {
          printLine(`<span class="text-red-400">rm: cannot remove '${target}': No such file</span>`);
        }
        break;
      }

      case 'node':
      case 'run': {
        const scriptName = args[0];
        if (!scriptName) {
          printLine(`<span class="text-red-400">Usage: node &lt;script.js&gt;</span>`);
          break;
        }
        const dir = state.fs[currentTab.currentPath];
        const script = dir?.children?.[scriptName] || state.fs['Scripts']?.children?.[scriptName];
        if (!script) {
          printLine(`<span class="text-red-400">node: Cannot find script '${scriptName}'</span>`);
          break;
        }

        printLine(`<span class="text-slate-400">[Running ${scriptName} in isolated runtime...]</span>`);
        try {
          // Intercept console.log during execution
          const logs = [];
          const customConsole = {
            log: (...msgs) => logs.push(msgs.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ')),
            error: (...msgs) => logs.push('<span class="text-red-400">' + msgs.join(' ') + '</span>'),
            warn: (...msgs) => logs.push('<span class="text-amber-400">' + msgs.join(' ') + '</span>')
          };

          const runFn = new Function('console', script.content);
          runFn(customConsole);

          if (logs.length > 0) {
            logs.forEach(l => printLine(l));
          } else {
            printLine(`<span class="text-slate-500">(Script executed with no output)</span>`);
          }
        } catch (err) {
          printLine(`<span class="text-red-400">Runtime Error: ${err.message}</span>`);
        }
        break;
      }

      case 'matrix': {
        printLine(`<span class="text-emerald-400">Entering matrix rain... (Press any key or execute command to stop)</span>`);
        let linesCount = 0;
        matrixInterval = setInterval(() => {
          if (linesCount++ > 35) {
            clearInterval(matrixInterval);
            matrixInterval = null;
            return;
          }
          const chars = "ｦｱｳｴｵｶｷｹｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF";
          let line = '';
          for (let i = 0; i < 48; i++) {
            line += chars[Math.floor(Math.random() * chars.length)];
          }
          printLine(`<span class="text-emerald-500 font-mono tracking-wider opacity-90">${line}</span>`);
        }, 80);
        break;
      }

      case 'cowsay': {
        const text = args.join(' ') || 'ZenithOS rocks!';
        const border = '-'.repeat(text.length + 2);
        printLine(`
<pre class="text-sky-300 font-mono">
  ${border}
< ${text} >
  ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>
        `);
        break;
      }

      case 'calc': {
        const expr = args.join(' ');
        if (!expr) {
          printLine(`<span class="text-red-400">Usage: calc &lt;expression&gt; (e.g. calc 24 * 60)</span>`);
          break;
        }
        try {
          // Safe math evaluator using Function with sanitized input
          if (!/^[\d\s\+\-\*\/\(\)\.\%\^]+$/.test(expr)) {
            throw new Error("Invalid mathematical expression");
          }
          const result = Function(`'use strict'; return (${expr})`)();
          printLine(`<span class="text-emerald-400 font-bold">= ${result}</span>`);
        } catch (e) {
          printLine(`<span class="text-red-400">Calculation error: ${e.message}</span>`);
        }
        break;
      }

      case 'date':
        printLine(new Date().toString());
        break;

      case 'uptime': {
        const mins = Math.floor(performance.now() / 60000);
        const secs = Math.floor((performance.now() % 60000) / 1000);
        printLine(`<span class="text-slate-300">up ${mins}m ${secs}s, load average: 0.05, 0.02, 0.00</span>`);
        break;
      }

      case 'echo':
        printLine(escapeHtml(args.join(' ')));
        break;

      case 'theme': {
        const themeName = (args[0] || '').toLowerCase();
        if (THEMES[themeName]) {
          state.set('theme', themeName);
          printLine(`<span class="text-emerald-400">Theme switched to '${THEMES[themeName].name}'</span>`);
        } else {
          printLine(`<span class="text-red-400">Available themes: ${Object.keys(THEMES).join(', ')}</span>`);
        }
        break;
      }

      case 'cloak': {
        const preset = (args[0] || '').toLowerCase();
        if (CLOAK_PRESETS[preset]) {
          state.set('activeCloak', preset);
          printLine(`<span class="text-emerald-400">Tab disguised as '${CLOAK_PRESETS[preset].name}'</span>`);
        } else {
          printLine(`<span class="text-red-400">Available cloaks: ${Object.keys(CLOAK_PRESETS).join(', ')}</span>`);
        }
        break;
      }

      case 'open': {
        const appName = (args[0] || '').toLowerCase();
        const validApps = ['games', 'files', 'code', 'browser', 'settings', 'music', 'terminal'];
        if (validApps.includes(appName) && window.zenithOS) {
          window.zenithOS.launchApp(appName);
          printLine(`<span class="text-emerald-400">Launched ${appName}</span>`);
        } else {
          printLine(`<span class="text-red-400">Unknown app '${appName}'. Try: games, files, code, browser, music, settings, terminal</span>`);
        }
        break;
      }

      default:
        printLine(`<span class="text-red-400">Command not found: ${escapeHtml(mainCmd)}. Type <span class="text-emerald-400 font-bold">help</span> for commands.</span>`);
        break;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Keyboard navigation & autocomplete
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termInput.value;
      termInput.value = '';
      executeCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyPointer > 0) {
        historyPointer--;
        termInput.value = commandHistory[historyPointer] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer < commandHistory.length - 1) {
        historyPointer++;
        termInput.value = commandHistory[historyPointer] || '';
      } else {
        historyPointer = commandHistory.length;
        termInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = termInput.value.trim();
      const commands = ['help', 'clear', 'neofetch', 'matrix', 'ls', 'cd', 'cat', 'touch', 'mkdir', 'rm', 'echo', 'date', 'uptime', 'calc', 'cowsay', 'node', 'theme', 'cloak', 'open'];
      const match = commands.find(c => c.startsWith(val));
      if (match) {
        termInput.value = match + ' ';
      }
    }
  });

  // Clicking anywhere in terminal body focuses input
  termBody.addEventListener('click', (e) => {
    if (window.getSelection().toString().length === 0) {
      termInput.focus();
    }
  });

  addTabBtn.addEventListener('click', addTab);

  renderTabs();
  updatePromptLabel();
  setTimeout(() => termInput.focus(), 100);
}
