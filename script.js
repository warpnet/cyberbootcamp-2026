(function() {
  const boxes      = document.querySelectorAll('ul.mission input[type="checkbox"]');
  const totalEl    = document.getElementById('scoreTotal');
  const maxEl      = document.getElementById('scoreMax');
  const fillEl     = document.getElementById('scoreFill');
  const countEl    = document.getElementById('scoreCount');
  const ofEl       = document.getElementById('scoreOf');
  const rankEl     = document.getElementById('scoreRank');
  const resetEl    = document.getElementById('scoreReset');
  const celebEl    = document.getElementById('celebration');
  const celebCta   = document.getElementById('celebCta');
  const confettiEl = document.getElementById('confetti');

  const STORAGE_KEY = 'hardware-hacking-cyberbootcamp-2026-score-v1';

  // ---- Storage (localStorage may be unavailable in some embedded contexts) ----
  function safeGet() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function safeSet(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
  }
  function safeClear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  // ---- Wire up checkboxes ----
  // Assign a stable index, parse points
  let max = 0;
  boxes.forEach((cb, i) => {
    cb.dataset.idx = i;
    const pts = cb.parentElement.querySelector('.pts');
    const n = pts ? parseInt(pts.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
    cb.dataset.pts = n;
    max += n;
  });
  maxEl.textContent = max;
  ofEl.textContent  = boxes.length;

  // Restore saved state
  const saved = new Set(safeGet());
  boxes.forEach((cb, i) => { if (saved.has(i)) cb.checked = true; });

  const ranks = [
    [0,    'SCREWDRIVER ROOKIE'],
    [70,   'PROBE JOCKEY'],
    [160,  'UART WHISPERER'],
    [260,  'BOOTLOADER BANDIT'],
    [360,  'FLASH RIPPER'],
    [440,  'FIRMWARE OVERLORD']
  ];
  function rankFor(score) {
    let r = ranks[0][1];
    for (const [t, name] of ranks) if (score >= t) r = name;
    return r;
  }

  // ---- Confetti ----
  const COLORS = ['#F97316', '#f210db', '#74b3fd', '#ffb000', '#ffffff'];
  let confettiActive = false;
  function burstConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    const N = 90;
    for (let i = 0; i < N; i++) {
      const piece = document.createElement('span');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.animationDuration = (2.4 + Math.random() * 2.4) + 's';
      piece.style.animationDelay = (Math.random() * 0.6) + 's';
      // some pieces are taller/thinner to vary
      if (Math.random() < 0.5) { piece.style.width = '6px'; piece.style.height = '10px'; }
      confettiEl.appendChild(piece);
      // cleanup after fall
      setTimeout(() => piece.remove(), 6000);
    }
    setTimeout(() => { confettiActive = false; }, 1200); // small re-trigger cooldown
  }

  // ---- Celebration state ----
  let wasMaxed = false;  // prevents re-triggering confetti every render
  function showCelebration(reveal) {
    if (reveal) {
      celebEl.classList.add('show');
      if (!wasMaxed) {
        burstConfetti();
        wasMaxed = true;
      }
    } else {
      celebEl.classList.remove('show');
      wasMaxed = false;
    }
  }

  // ---- Update loop ----
  function update() {
    let total = 0, count = 0;
    const checked = [];
    boxes.forEach((cb, i) => {
      if (cb.checked) {
        total += +cb.dataset.pts;
        count++;
        checked.push(i);
      }
    });
    totalEl.textContent = total;
    countEl.textContent = count;
    fillEl.style.width = max ? (total / max * 100) + '%' : '0%';
    rankEl.textContent = rankFor(total);

    const maxed = (total === max && max > 0);
    totalEl.classList.toggle('maxed', maxed);
    showCelebration(maxed);

    safeSet(checked);
  }

  boxes.forEach(cb => cb.addEventListener('change', update));

  resetEl.addEventListener('click', () => {
    if (confirm('Clear all ticked objectives?')) {
      boxes.forEach(cb => cb.checked = false);
      safeClear();
      update();
    }
  });

  // CTA inside the celebration banner: scroll to share section
  celebCta.addEventListener('click', () => {
    const target = document.querySelector('.share');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  update();
})();
