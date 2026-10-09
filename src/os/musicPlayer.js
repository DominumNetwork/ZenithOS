/**
 * Zenith Audio Lounge
 * Synthesized chill lofi chords, ambient pads & frequency spectrum visualizer.
 */

export function createMusicPlayerApp(containerEl, winState) {
  let isPlaying = false;
  let audioCtx = null;
  let currentTrackIdx = 0;
  let animId = null;

  const TRACKS = [
    { title: 'Neon Midnight Drift', mood: 'Synthwave / Relax', tempo: 80 },
    { title: 'Tokyo Rain Coziness', mood: 'Lofi Chords / Ambient', tempo: 72 },
    { title: 'Celestial Horizon', mood: 'Deep Space Chill', tempo: 65 }
  ];

  containerEl.innerHTML = `
    <div class="h-full w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      
      <!-- Top Track Banner -->
      <div class="p-4 bg-gradient-to-b from-purple-950/40 to-slate-950 flex items-center gap-4 border-b border-white/10 shrink-0">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-700 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-900/40">
          <i class="fa-solid fa-music"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div id="player-track-name" class="text-sm font-bold text-white truncate">Neon Midnight Drift</div>
          <div id="player-track-mood" class="text-slate-400 text-[11px]">Synthwave / Relax</div>
          <div class="flex items-center gap-2 mt-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[10px] text-emerald-400 font-mono">WebAudio Synthesizer Engine</span>
          </div>
        </div>
      </div>

      <!-- Canvas Audio Spectrum Visualizer -->
      <div class="flex-1 relative bg-slate-950 flex items-center justify-center p-2">
        <canvas id="music-visualizer" class="w-full h-full rounded-xl"></canvas>
      </div>

      <!-- Playback Controls -->
      <div class="p-4 bg-slate-900/90 border-t border-white/10 flex flex-col gap-3 shrink-0">
        
        <div class="flex items-center justify-center gap-4">
          <button id="player-prev" class="p-2 text-slate-400 hover:text-white transition-colors" title="Previous Track">
            <i class="fa-solid fa-backward-step text-sm"></i>
          </button>
          
          <button id="player-play-btn" class="w-11 h-11 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/40 transition-all transform active:scale-95" title="Play / Pause">
            <i class="fa-solid fa-play text-sm ml-0.5" id="player-play-icon"></i>
          </button>
          
          <button id="player-next" class="p-2 text-slate-400 hover:text-white transition-colors" title="Next Track">
            <i class="fa-solid fa-forward-step text-sm"></i>
          </button>
        </div>

        <div class="flex items-center gap-3 px-2">
          <i class="fa-solid fa-volume-high text-slate-400 text-xs"></i>
          <input type="range" id="player-volume" min="0" max="100" value="70" class="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" />
        </div>

      </div>

    </div>
  `;

  const playBtn = containerEl.querySelector('#player-play-btn');
  const playIcon = containerEl.querySelector('#player-play-icon');
  const prevBtn = containerEl.querySelector('#player-prev');
  const nextBtn = containerEl.querySelector('#player-next');
  const trackNameEl = containerEl.querySelector('#player-track-name');
  const trackMoodEl = containerEl.querySelector('#player-track-mood');
  const volSlider = containerEl.querySelector('#player-volume');
  const canvas = containerEl.querySelector('#music-visualizer');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
  }
  setTimeout(resizeCanvas, 50);

  // Web Audio Synthesizer Nodes
  let masterGain = null;
  let synthInterval = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(audioCtx.destination);
  }

  const CHORD_PROGRESSIONS = [
    // Lofi progression in C minor: Cm7 -> Fm7 -> Bb7 -> Ebmaj7
    [[261.63, 311.13, 392.00, 466.16], [174.61, 207.65, 261.63, 311.13], [233.08, 293.66, 349.23, 415.30], [155.56, 196.00, 233.08, 293.66]],
    // Dreamy synthwave: Am9 -> Fmaj7 -> Cmaj7 -> Gsus4
    [[220.00, 261.63, 329.63, 392.00], [174.61, 220.00, 261.63, 329.63], [130.81, 164.81, 196.00, 246.94], [196.00, 246.94, 293.66, 392.00]]
  ];

  let chordStep = 0;

  function playChord() {
    if (!audioCtx || !isPlaying) return;
    const prog = CHORD_PROGRESSIONS[currentTrackIdx % CHORD_PROGRESSIONS.length];
    const notes = prog[chordStep % prog.length];
    chordStep++;

    const now = audioCtx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 / notes.length, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  function startMusic() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isPlaying = true;
    playIcon.className = 'fa-solid fa-pause text-sm';
    playChord();
    synthInterval = setInterval(playChord, 2600);
    renderVisualizer();
  }

  function pauseMusic() {
    isPlaying = false;
    playIcon.className = 'fa-solid fa-play text-sm ml-0.5';
    if (synthInterval) clearInterval(synthInterval);
  }

  function togglePlay() {
    if (isPlaying) pauseMusic();
    else startMusic();
  }

  playBtn.addEventListener('click', togglePlay);

  nextBtn.addEventListener('click', () => {
    currentTrackIdx = (currentTrackIdx + 1) % TRACKS.length;
    updateTrackUI();
  });

  prevBtn.addEventListener('click', () => {
    currentTrackIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
    updateTrackUI();
  });

  function updateTrackUI() {
    const track = TRACKS[currentTrackIdx];
    trackNameEl.textContent = track.title;
    trackMoodEl.textContent = track.mood;
    chordStep = 0;
    if (isPlaying) {
      clearInterval(synthInterval);
      playChord();
      synthInterval = setInterval(playChord, 2600);
    }
  }

  volSlider.addEventListener('input', (e) => {
    const val = e.target.value / 100;
    if (masterGain) masterGain.gain.value = val * 0.35;
  });

  // Waveform Visualizer
  let wavePhase = 0;
  function renderVisualizer() {
    if (!containerEl.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const bars = 36;
    const barWidth = w / bars;

    for (let i = 0; i < bars; i++) {
      let amp = 0.1;
      if (isPlaying) {
        amp = Math.sin(wavePhase + i * 0.3) * 0.4 + Math.cos(wavePhase * 1.5 + i * 0.5) * 0.3 + 0.4;
      }
      const barHeight = Math.max(8, amp * (h * 0.65));
      const x = i * barWidth;
      const y = (h - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, '#7c5cff');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#10b981');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
      ctx.fill();
    }

    if (isPlaying) wavePhase += 0.08;
    animId = requestAnimationFrame(renderVisualizer);
  }

  renderVisualizer();

  winState.onClose = () => {
    pauseMusic();
    if (animId) cancelAnimationFrame(animId);
  };
}
