/* ============================================================
   HackGrid core.js
   Namespace, pure-JS SHA-256, progress store, XP + ranks,
   badges, hash router, DOM helpers, toasts.
   Written to run headless (no top level DOM access) so the
   crypto can be unit tested in node.
   ============================================================ */

window.HR = (function () {
  const HR = {};
  HR.labs = [];
  HR.dir = [];
  HR.paths = [];
  HR.labById = {};
  HR.dirById = {};
  HR.pathById = {};

  /* ---------------- SHA-256 (pure JS, UTF-8) ---------------- */
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }

  HR.sha256 = function (str) {
    const enc = (typeof TextEncoder !== 'undefined')
      ? new TextEncoder().encode(str)
      : Uint8Array.from(unescape(encodeURIComponent(str)).split('').map(c => c.charCodeAt(0)));
    const l = enc.length;
    const blocks = Math.ceil((l + 9) / 64);
    const total = blocks * 64;
    const m = new Uint8Array(total);
    m.set(enc);
    m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor(l / 0x20000000));
    dv.setUint32(total - 4, (l << 3) >>> 0);
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);
    for (let i = 0; i < blocks; i++) {
      for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i * 64 + j * 4);
      for (let j = 16; j < 64; j++) {
        const a15 = w[j - 15], a2 = w[j - 2];
        const s0 = rotr(a15, 7) ^ rotr(a15, 18) ^ (a15 >>> 3);
        const s1 = rotr(a2, 17) ^ rotr(a2, 19) ^ (a2 >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let j = 0; j < 64; j++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  };

  HR.norm = function (s) {
    return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase();
  };

  HR.hashAnswer = function (s) { return HR.sha256(HR.norm(s)); };

  /* ---------------- categories + difficulty ---------------- */
  HR.CATS = {
    linux:   { name: 'Linux & terminal',     short: 'Linux',    blurb: 'A real-feeling terminal and a broken box. Permissions, disks, services, DNS, cron.' },
    net:     { name: 'Networking',           short: 'Network',  blurb: 'Subnets, ports, scans, DNS records and packets. The map every attack and defense is drawn on.' },
    web:     { name: 'Web & HTTP',           short: 'Web',      blurb: 'Read requests and responses like a pro: status codes, cookies, headers, tokens, leaks.' },
    code:    { name: 'Secure code review',   short: 'Code',     blurb: 'Spot the vulnerable line, name the bug class, choose the right fix.' },
    enc:     { name: 'Encoding & decoding',  short: 'Encoding', blurb: 'Base64, hex, URL and unicode layers, and JWT structure. The decoder mindset.' },
    crypto:  { name: 'Crypto & passwords',   short: 'Crypto',   blurb: 'Identify hashes, spot weak secrets and key reuse, reason about password strength.' },
    logs:    { name: 'Logs & incident response', short: 'Blue team', blurb: 'Find the attacker in auth logs, web logs and Windows events. Build the timeline.' },
    forensics: { name: 'Forensics',          short: 'Forensics', blurb: 'Magic bytes, metadata, strings and timestamps. Make the evidence talk.' },
    phish:   { name: 'Phishing & social engineering', short: 'Phishing', blurb: 'Read email headers, unmask lookalike domains and deceptive links.' },
    asm:     { name: 'Assembly reading',     short: 'Assembly', blurb: 'Read x86-64 like a story: calling conventions, loops, overflows and hidden constants.' },
    adapt:   { name: 'Payload diagnosis',    short: 'Diagnosis', blurb: 'Something failed. Read the evidence, explain why, and name the fix.' }
  };
  HR.CAT_ORDER = ['linux', 'net', 'web', 'code', 'enc', 'crypto', 'logs', 'forensics', 'phish', 'asm', 'adapt'];

  HR.DIFFS = {
    1: { label: 'Easy',   xp: 10,  cls: 'diff-1' },
    2: { label: 'Medium', xp: 25,  cls: 'diff-2' },
    3: { label: 'Hard',   xp: 50,  cls: 'diff-3' },
    4: { label: 'Insane', xp: 100, cls: 'diff-4' }
  };

  HR.RANKS = [
    { name: 'Script Kiddie',       xp: 0 },
    { name: 'Junior Pentester',    xp: 200 },
    { name: 'Bug Hunter',          xp: 600 },
    { name: 'Security Researcher', xp: 1100 },
    { name: 'Elite Hacker',        xp: 1800 }
  ];

  HR.EXT_XP = 5;

  HR.BADGES = [
    { id: 'first-blood',   name: 'First Blood',     desc: 'Solve your first lab.' },
    { id: 'warming-up',    name: 'Warming Up',      desc: 'Solve 5 labs.' },
    { id: 'double-digits', name: 'Double Digits',   desc: 'Solve 10 labs.' },
    { id: 'halfway',       name: 'Halfway There',   desc: 'Solve half of all labs.' },
    { id: 'completionist', name: 'Completionist',   desc: 'Solve every lab.' },
    { id: 'purist',        name: 'Purist',          desc: 'Solve 3 labs without opening a single hint.' },
    { id: 'cat-master',    name: 'Category Master', desc: 'Clear every lab in one category.' },
    { id: 'polymath',      name: 'Polymath',        desc: 'Solve a lab in every category.' },
    { id: 'explorer',      name: 'Explorer',        desc: 'Mark 10 external labs as done.' },
    { id: 'cartographer',  name: 'Cartographer',    desc: 'Finish a learning path.' },
    { id: 'night-owl',     name: 'Night Owl',       desc: 'Solve a lab between midnight and 5am.' }
  ];

  /* ---------------- registration ---------------- */
  HR.defineLab = function (lab) {
    lab.diff = lab.diff || 1;
    lab.xp = HR.DIFFS[lab.diff].xp;
    lab.accept = lab.accept || (window.HR_MAT && HR_MAT.ACCEPT[lab.id]) || [];
    // older labs carry their multiple choice inside the evidence: lift it into lab.q / lab.choices
    const blocks = (lab.env && lab.env.blocks) || [];
    const mc = blocks.find(b => b.t === 'mc');
    if (mc && !lab.choices) { lab.q = lab.q || mc.q; lab.choices = mc.options; lab.env.blocks = blocks.filter(b => b !== mc); }
    lab.str = (window.HR_MAT && HR_MAT.STR) || {};
    HR.labs.push(lab);
    HR.labById[lab.id] = lab;
    return lab;
  };
  HR.defineDir = function (d) { HR.dir.push(d); HR.dirById[d.id] = d; return d; };
  HR.definePath = function (p) {
    p.steps = p.steps.map(s => {
      if (typeof s === 'string') return s.indexOf('/') === 0 ? { x: s.slice(1) } : { a: s };
      return s;
    });
    HR.paths.push(p); HR.pathById[p.id] = p; return p;
  };

  /* ---------------- progress store ---------------- */
  const KEY = 'hackgrid-progress-v1';
  const OLD_KEY = 'hackrange-progress-v1';

  HR.defaultState = function () {
    return { v: 1, solved: {}, ext: {}, paths: {}, badges: {} };
  };

  HR.loadState = function () {
    try {
      let raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(KEY) : null;
      if (!raw && typeof localStorage !== 'undefined') raw = localStorage.getItem(OLD_KEY); // carry over HackRange progress
      if (!raw) return HR.defaultState();
      const s = JSON.parse(raw);
      if (!s || s.v !== 1) return HR.defaultState();
      s.solved = s.solved || {}; s.ext = s.ext || {};
      s.paths = s.paths || {}; s.badges = s.badges || {};
      return s;
    } catch (e) { return HR.defaultState(); }
  };

  HR.saveState = function (state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  };

  HR.computeXP = function (state) {
    let xp = 0;
    for (const id in state.solved) {
      const lab = HR.labById[id];
      if (!lab) continue;
      const rec = state.solved[id];
      const half = rec && rec.hints && rec.hints.indexOf(3) !== -1;
      xp += half ? Math.round(lab.xp / 2) : lab.xp;
    }
    for (const id in state.ext) {
      if (HR.dirById[id]) xp += HR.EXT_XP;
    }
    return xp;
  };

  HR.rankFor = function (xp) {
    let r = HR.RANKS[0], next = null;
    for (let i = 0; i < HR.RANKS.length; i++) {
      if (xp >= HR.RANKS[i].xp) r = HR.RANKS[i];
      else { next = HR.RANKS[i]; break; }
    }
    const base = r.xp, span = next ? next.xp - base : 1;
    const pct = next ? Math.min(100, Math.round(((xp - base) / span) * 100)) : 100;
    return { rank: r, next: next, pct: pct };
  };

  HR.labStats = function (state, cat) {
    const labs = cat ? HR.labs.filter(l => l.cat === cat) : HR.labs;
    const solved = labs.filter(l => state.solved[l.id]).length;
    return { total: labs.length, solved: solved, pct: labs.length ? Math.round(solved / labs.length * 100) : 0 };
  };

  /* badge evaluation: returns array of newly earned badge ids */
  HR.evalBadges = function (state) {
    const earned = [];
    const solvedCount = Object.keys(state.solved).length;
    const add = id => { if (!state.badges[id]) { state.badges[id] = new Date().toISOString(); earned.push(id); } };
    if (solvedCount >= 1) add('first-blood');
    if (solvedCount >= 5) add('warming-up');
    if (solvedCount >= 10) add('double-digits');
    if (solvedCount >= Math.ceil(HR.labs.length / 2)) add('halfway');
    if (HR.CAT_ORDER.every(c => HR.labs.some(l => l.cat === c && state.solved[l.id]))) add('polymath');
    if (solvedCount >= HR.labs.length) add('completionist');
    if (solvedCount >= 1) {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) add('night-owl');
    }
    const pure = Object.keys(state.solved).filter(id => {
      const r = state.solved[id]; return !r.hints || r.hints.length === 0;
    }).length;
    if (pure >= 3) add('purist');
    for (const cat of HR.CAT_ORDER) {
      const st = HR.labStats(state, cat);
      if (st.total > 0 && st.solved === st.total) { add('cat-master'); break; }
    }
    if (Object.keys(state.ext).length >= 10) add('explorer');
    for (const p of HR.paths) {
      if (HR.pathProgress(state, p).done === p.steps.length) { add('cartographer'); break; }
    }
    return earned;
  };

  HR.pathProgress = function (state, path) {
    let done = 0, total = 0;
    for (const s of path.steps) {
      if (s.a) { total++; if (state.solved[s.a]) done++; }
      else if (s.e) { total++; if (state.ext[s.e]) done++; }
      else if (s.manual) { total++; if (state.paths[path.id] && state.paths[path.id][s.key]) done++; }
    }
    return { done: done, total: total };
  };

  HR.stepDone = function (state, path, idx) {
    const s = path.steps[idx];
    if (s.a) return !!state.solved[s.a];
    if (s.e) return !!state.ext[s.e];
    if (s.manual) return !!(state.paths[path.id] && state.paths[path.id][s.key]);
    return false;
  };

  /* ---------------- answer checking ---------------- */
  HR.checkAnswer = function (lab, input) {
    const n = HR.norm(input);
    if (!n) return false;
    if (lab.flag && n === HR.norm(lab.flag)) return true;
    if (!lab.accept || !lab.accept.length) return false;
    return lab.accept.indexOf(HR.sha256(n)) !== -1;
  };

  /* ---------------- router ---------------- */
  HR.routes = [];
  HR.route = function (pattern, fn) { HR.routes.push({ pattern: pattern, fn: fn }); };

  HR.resolveRoute = function (hash) {
    const path = (hash || '#/').replace(/^#/, '');
    for (const r of HR.routes) {
      const m = path.match(r.pattern);
      if (m) return { fn: r.fn, m: m };
    }
    return null;
  };

  /* ---------------- DOM helpers ---------------- */
  HR.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  HR.el = function (tag, attrs, kids) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      }
    }
    (kids || []).forEach(k => {
      if (k == null) return;
      node.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    });
    return node;
  };

  HR.icon = function (name, cls) {
    const paths = {
      home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
      arena: '<path d="M4 4h16v12H4z"/><path d="M4 8h16"/><path d="M8 4v4"/><path d="M9 20l3-4 3 4"/>',
      dir: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.5 3 14 0 18-3-4-3-14.5 0-18z"/>',
      paths: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a2 2 0 0 0 2-2V7"/><path d="M16 5H8a2 2 0 0 0-2 2v10"/>',
      progress: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
      flag: '<path d="M5 21V4"/><path d="M5 4h13l-2.5 3.5L18 11H5"/>',
      lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      check: '<path d="m5 13 4 4L19 7"/>',
      bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
      book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
      term: '<path d="m4 17 6-5-6-5"/><path d="M12 19h8"/>',
      target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
      external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
      arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
      bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.4c.8.7 1 1.6 1 2.6h6c0-1 .2-1.9 1-2.6A6 6 0 0 0 12 3z"/>',
      shield: '<path d="M12 3 5 6v5c0 5 3.3 8.4 7 10 3.7-1.6 7-5 7-10V6z"/>'
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (cls) svg.setAttribute('class', cls);
    svg.innerHTML = paths[name] || paths.target;
    return svg;
  };

  /* ---------------- toasts + celebration ---------------- */
  let toastWrap = null;

  HR.toast = function (msg, opts) {
    opts = opts || {};
    if (!toastWrap) {
      toastWrap = HR.el('div', { class: 'toast-wrap' });
      document.body.appendChild(toastWrap);
    }
    const t = HR.el('div', { class: 'toast show' + (opts.cls ? ' ' + opts.cls : '') });
    t.appendChild(HR.icon(opts.icon || 'check'));
    t.appendChild(HR.el('span', { html: msg }));
    toastWrap.appendChild(t);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3600);
  };

  HR.confetti = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#e0243a', '#ff4458', '#a51c30', '#f2f2f4', '#7d7d88'];
    const wrap = HR.el('div', { class: 'confetti-wrap' });
    for (let i = 0; i < 34; i++) {
      const p = HR.el('div', { class: 'confetti-p' });
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      if (i % 3 === 0) p.style.borderRadius = '50%';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3600);
  };

  /* solve flow shared by every environment */
  HR.solveLab = function (lab, state) {
    if (state.solved[lab.id]) return null;
    const hints = (state._hints && state._hints[lab.id]) || [];
    const beforeXP = HR.computeXP(state);
    state.solved[lab.id] = { t: new Date().toISOString(), hints: hints };
    if (state._hints) delete state._hints[lab.id];
    const badges = HR.evalBadges(state);
    HR.saveState(state);
    return { rec: state.solved[lab.id], xp: HR.computeXP(state) - beforeXP, badges: badges };
  };

  HR.hintKey = function (state, lab) {
    if (state.solved[lab.id]) return state.solved[lab.id].hints;
    return (state._hints && state._hints[lab.id]) || [];
  };

  /* shared flow for marking an external lab done */
  HR.markExtDone = function (state, extId) {
    const before = HR.computeXP(state);
    state.ext[extId] = new Date().toISOString();
    const badges = HR.evalBadges(state);
    HR.saveState(state);
    return { xp: HR.computeXP(state) - before, badges: badges };
  };

  /* persistent pre-solve hint tracking */
  HR.recordHint = function (state, labId, level) {
    if (state.solved[labId]) return state.solved[labId].hints;
    state._hints = state._hints || {};
    state._hints[labId] = state._hints[labId] || [];
    if (state._hints[labId].indexOf(level) === -1) state._hints[labId].push(level);
    HR.saveState(state);
    return state._hints[labId];
  };

  HR.dateLabel = function (iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return HR;
})();
