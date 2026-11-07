/* ============================================================
   HackGrid ui.js
   Views: Home, Labs (catalog), Lab, Paths, Path, Directory,
   Profile. Same layout language as BountyFlow and SecLab.
   ============================================================ */
window.HG = (function () {
  'use strict';
  const HR = window.HR;

  /* ---------- DOM helper (same as the other CyberFlow tools) ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(c)); }
    return el;
  }
  const ICONS = {
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', arrowL: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    term: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>', lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'
  };
  function icon(n, s) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', s || 16); svg.setAttribute('height', s || 16);
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('class', 'ic'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICONS[n] || ''; return svg;
  }

  const DIFF_TAG = { 1: 'ok', 2: 'info', 3: 'warn', 4: 'red' };
  const diffTag = d => h('span', { class: 'tag ' + DIFF_TAG[d] }, HR.DIFFS[d].label);
  const catName = c => (HR.CATS[c] || { short: c }).short;
  const labsIn = c => HR.labs.filter(l => l.cat === c);
  const state = () => HR.loadState();

  function pageHead(eyebrow, title, lead, right) {
    return h('div', { class: 'page-head' },
      h('div', {}, h('div', { class: 'eyebrow' }, eyebrow), h('h1', { class: 'display h1' }, title), lead ? h('p', { class: 'lead' }, lead) : null),
      right || null);
  }
  const kpi = (v, l, accent) => h('div', { class: 'kpi' + (accent ? ' accent' : '') }, h('b', {}, v), h('span', {}, l));
  const meter = pct => h('div', { class: 'meter' }, h('i', { style: 'width:' + Math.max(pct, pct ? 3 : 0) + '%' }));

  function labRow(lab, st) {
    const solved = !!st.solved[lab.id];
    return h('a', { class: 'lrow' + (solved ? ' solved' : ''), href: '#/lab/' + lab.id },
      h('span', { class: 'lrow-state' }, solved ? icon('check', 14) : null),
      h('div', { class: 'lrow-main' }, h('span', { class: 'lrow-title' }, lab.title), h('span', { class: 'lrow-sub' }, catName(lab.cat))),
      diffTag(lab.diff),
      h('span', { class: 'lrow-xp mono' }, lab.xp + ' XP'));
  }

  /* ============================================================
     HOME
     ============================================================ */
  function home(main) {
    const st = state();
    const xp = HR.computeXP(st);
    const all = HR.labStats(st);
    const next = HR.labs.find(l => !st.solved[l.id]);
    const v = h('div', { class: 'view' });
    v.append(pageHead('Hacking practice labs', 'Learn by doing',
      HR.labs.length + ' hands-on labs across ' + HR.CAT_ORDER.length + ' skills, from your first terminal command to incident response. Each lab gives you real-looking evidence, a question, a hint ladder and a walkthrough that explains why.',
      h('div', { class: 'kpis' }, kpi(String(HR.labs.length), 'labs'), kpi(all.solved + ' / ' + all.total, 'solved'), kpi(String(xp), 'XP', true))));

    if (next) {
      v.append(h('a', { class: 'continue card hover', href: '#/lab/' + next.id },
        h('div', {}, h('div', { class: 'eyebrow' }, all.solved ? 'Continue' : 'Start here'),
          h('div', { class: 'continue-title' }, next.title), h('div', { class: 'muted small' }, HR.CATS[next.cat].name + ' · ' + HR.DIFFS[next.diff].label + ' · ' + next.xp + ' XP')),
        h('span', { class: 'btn primary' }, all.solved ? 'Continue' : 'Start lab', icon('arrowR', 15))));
    }

    v.append(h('div', { class: 'section-head' }, h('h2', {}, 'Skills'), h('a', { class: 'more', href: '#/labs' }, 'All labs', icon('arrowR', 14))));
    v.append(h('div', { class: 'cat-grid' }, HR.CAT_ORDER.map(c => {
      const s = HR.labStats(st, c);
      return h('a', { class: 'cat card hover', href: '#/labs/' + c },
        h('div', { class: 'cat-top' }, h('h3', {}, HR.CATS[c].name), h('span', { class: 'muted mono tiny' }, s.solved + '/' + s.total)),
        h('p', { class: 'dim small' }, HR.CATS[c].blurb),
        meter(s.pct));
    })));

    v.append(h('div', { class: 'section-head', style: 'margin-top:40px' }, h('h2', {}, 'Learning paths'), h('a', { class: 'more', href: '#/paths' }, 'All ' + HR.paths.length + ' paths', icon('arrowR', 14))));
    v.append(h('div', { class: 'grid-3' }, HR.paths.slice(0, 3).map(p => pathCard(p, st))));

    v.append(h('a', { class: 'banner card hover', href: '#/directory' },
      h('div', {}, h('div', { class: 'eyebrow' }, 'Go hands-on'), h('h3', {}, HR.dir.length + ' free practice platforms, curated'),
        h('p', { class: 'dim small' }, 'PortSwigger Academy, TryHackMe, Hack The Box, OverTheWire, picoCTF and more: legal targets where you attack real vulnerable apps. Mark them done to earn XP.')),
      icon('arrowR', 20)));
    main.append(v);
  }

  /* ============================================================
     LABS CATALOG
     ============================================================ */
  const filt = { diff: 0, q: '' };
  function labs(main, cat) {
    const st = state();
    if (cat && !HR.CATS[cat]) cat = null;
    const v = h('div', { class: 'view' });
    v.append(pageHead(cat ? 'Skill' : 'Catalog', cat ? HR.CATS[cat].name : 'All labs', cat ? HR.CATS[cat].blurb : 'Pick a skill or search. Solved labs keep their check mark.'));

    const list = h('div', { class: 'llist card' });
    const meta = h('div', { class: 'result-meta' });
    function paint() {
      const q = filt.q.toLowerCase();
      const items = HR.labs.filter(l => (!cat || l.cat === cat) && (!filt.diff || l.diff === filt.diff) &&
        (!q || (l.title + ' ' + l.brief + ' ' + HR.CATS[l.cat].name).toLowerCase().includes(q)));
      meta.textContent = items.length + (items.length === 1 ? ' lab' : ' labs');
      list.innerHTML = '';
      if (!items.length) list.append(h('div', { class: 'empty' }, h('h3', {}, 'No labs match'), h('p', {}, 'Try another search or difficulty.')));
      items.forEach(l => list.append(labRow(l, st)));
    }
    const seg = h('div', { class: 'seg' }, [[0, 'All'], [1, 'Easy'], [2, 'Medium'], [3, 'Hard'], [4, 'Insane']].map(([d, l]) =>
      h('button', { class: filt.diff === d ? 'on' : '', type: 'button', onclick: e => { filt.diff = d; seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); paint(); } }, l)));
    v.append(h('div', { class: 'toolbar' },
      h('div', { class: 'search grow' }, icon('search', 16), h('input', { class: 'input', type: 'search', placeholder: 'Search labs', value: filt.q, 'aria-label': 'Search labs', oninput: e => { filt.q = e.target.value; paint(); } })),
      seg));
    v.append(h('div', { class: 'chips' },
      h('a', { class: 'chip' + (!cat ? ' on' : ''), href: '#/labs' }, 'All skills'),
      HR.CAT_ORDER.map(c => h('a', { class: 'chip' + (cat === c ? ' on' : ''), href: '#/labs/' + c }, catName(c)))));
    v.append(meta, list);
    paint();
    main.append(v);
  }

  /* ============================================================
     LAB
     ============================================================ */
  function lab(main, id) {
    const lab = HR.labById[id];
    if (!lab) { location.hash = '#/labs'; return; }
    const st = state();
    const siblings = labsIn(lab.cat);
    const idx = siblings.indexOf(lab);
    const prev = siblings[idx - 1], next = siblings[idx + 1];
    const isFlagLab = lab.env.type === 'terminal';

    const v = h('div', { class: 'view labv' });
    v.append(h('a', { class: 'back', href: '#/labs/' + lab.cat }, icon('arrowL', 14), HR.CATS[lab.cat].name));
    const status = h('span', {});
    const syncStatus = () => { status.innerHTML = ''; if (st.solved[lab.id]) status.append(h('span', { class: 'tag ok' }, icon('check', 12), 'Solved')); };
    syncStatus();
    v.append(h('div', { class: 'lab-head' },
      h('div', { class: 'row wrap-row' }, h('span', { class: 'tag' }, catName(lab.cat)), diffTag(lab.diff), h('span', { class: 'tag' }, lab.xp + ' XP'), status),
      h('h1', { class: 'lab-title' }, lab.title),
      h('p', { class: 'lead' }, lab.brief)));

    /* left column: evidence + answer */
    const envMount = h('div', { class: 'env-mount' });
    const left = h('div', { class: 'lab-main' },
      h('section', { class: 'card pad' }, h('div', { class: 'card-title' }, icon(isFlagLab ? 'term' : 'book', 15), isFlagLab ? 'Terminal' : 'Evidence'), envMount));

    const feedback = h('div', { class: 'feedback' });
    const answerCard = h('section', { class: 'card pad answer' });
    answerCard.append(h('div', { class: 'card-title' }, icon('flag', 15), isFlagLab ? 'Flag' : 'Your answer'));
    answerCard.append(h('p', { class: 'q' }, lab.q || (isFlagLab ? (lab.flagNote || 'Fix the problem in the terminal. The flag appears when you succeed.') : (lab.flagNote || 'Type your answer. Case and spacing do not matter.'))));

    let input;
    function submit(value) {
      const val = value != null ? value : input.value;
      if (!val || !String(val).trim()) return;
      if (st.solved[lab.id]) { feedback.innerHTML = ''; feedback.append(h('div', { class: 'note ok' }, icon('check', 15), h('span', {}, 'Already solved. The walkthrough is open below.'))); return; }
      if (HR.checkAnswer(lab, val)) solved();
      else { feedback.innerHTML = ''; feedback.append(h('div', { class: 'note red' }, h('span', {}, h('b', {}, 'Not quite. '), 'Read the evidence again, or open the first hint.'))); }
    }
    if (lab.choices) {
      answerCard.append(h('div', { class: 'choices' }, lab.choices.map((c, i) => {
        const letter = String.fromCharCode(97 + i);
        return h('button', { class: 'choice', type: 'button', onclick: e => { answerCard.querySelectorAll('.choice').forEach(b => b.classList.remove('picked')); e.currentTarget.classList.add('picked'); submit(letter); } },
          h('span', { class: 'choice-letter' }, letter.toUpperCase()), h('span', {}, c));
      })));
    } else {
      input = h('input', { class: 'input', type: 'text', placeholder: lab.ph || (isFlagLab ? 'HG{...}' : 'your answer'), spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Answer', onkeydown: e => { if (e.key === 'Enter') submit(); } });
      answerCard.append(h('div', { class: 'answer-row' }, input, h('button', { class: 'btn primary', type: 'button', onclick: () => submit() }, 'Submit')));
    }
    answerCard.append(feedback);
    left.append(answerCard);

    /* right column: hints + walkthrough + nav */
    const hintsUsed = HR.hintKey(st, lab);
    const hints = h('section', { class: 'card pad' }, h('div', { class: 'card-title' }, icon('bulb', 15), 'Hints'),
      h('p', { class: 'muted tiny' }, 'Hints are free. Opening the walkthrough before solving halves the XP.'),
      (lab.hints || []).map((txt, i) => {
        const open = hintsUsed.indexOf(i + 1) !== -1 || !!st.solved[lab.id];
        const box = h('div', { class: 'hint' + (open ? ' open' : '') },
          h('button', { class: 'hint-btn', type: 'button', onclick: () => { box.classList.add('open'); HR.recordHint(st, lab.id, i + 1); } }, h('span', { class: 'hint-n mono' }, String(i + 1)), ['Nudge', 'Bigger nudge', 'Almost there'][i] || 'Hint'),
          h('div', { class: 'hint-body' }, txt));
        return box;
      }));
    const walkBody = h('div', { class: 'walk-body', html: lab.walk || '' });
    const walk = h('section', { class: 'card pad walk' }, h('div', { class: 'card-title' }, icon('lock', 15), 'Walkthrough'), walkBody);
    const reveal = h('button', { class: 'btn sm', type: 'button', onclick: () => {
      if (!st.solved[lab.id]) { HR.recordHint(st, lab.id, 3); CF.toast('Walkthrough opened: this lab now gives half XP'); }
      openWalk();
    } }, 'Show walkthrough');
    function openWalk() { walk.classList.add('open'); reveal.remove(); walk.querySelector('.card-title').replaceWith(h('div', { class: 'card-title' }, icon('book', 15), 'Walkthrough')); }
    walk.append(reveal);
    const nav = h('div', { class: 'lab-nav' },
      prev ? h('a', { class: 'btn sm', href: '#/lab/' + prev.id }, icon('arrowL', 14), 'Previous') : h('span'),
      next ? h('a', { class: 'btn sm', href: '#/lab/' + next.id }, 'Next lab', icon('arrowR', 14)) : h('a', { class: 'btn sm', href: '#/labs/' + lab.cat }, 'Back to skill', icon('arrowR', 14)));
    const right = h('aside', { class: 'lab-side' }, hints, walk, lab.study ? h('p', { class: 'muted tiny study' }, lab.study.replace(/HackRange/g, 'HackGrid')) : null, nav);

    v.append(h('div', { class: 'lab-grid' }, left, right));
    main.append(v);

    function solved(flagFromEngine) {
      const res = HR.solveLab(lab, st);
      if (input && flagFromEngine) input.value = flagFromEngine;
      feedback.innerHTML = '';
      feedback.append(h('div', { class: 'note ok' }, icon('check', 15), h('span', {}, h('b', {}, 'Correct. '), res ? '+' + res.xp + ' XP' : '', next ? ' · ' : '', next ? h('a', { href: '#/lab/' + next.id }, 'Next lab') : null)));
      syncStatus(); openWalk(); HGApp.refreshChip();
      if (res) {
        CF.toast('Lab solved · +' + res.xp + ' XP');
        (res.badges || []).forEach((b, i) => setTimeout(() => { const d = HR.BADGES.find(x => x.id === b); CF.toast('Badge unlocked: ' + (d ? d.name : b)); }, 1600 + i * 1600));
      }
    }
    const api = { state: st, onSolve: flag => { if (st.solved[lab.id]) return; if (HR.norm(flag) !== HR.norm(lab.flag)) return; solved(flag); } };
    HR.envs.mount(lab.env.type, envMount, lab, api);
    if (st.solved[lab.id]) { openWalk(); if (input && lab.flag) input.value = lab.flag; }
  }

  /* ============================================================
     PATHS
     ============================================================ */
  function pathCard(p, st) {
    const pr = HR.pathProgress(st, p);
    const pct = pr.total ? Math.round(pr.done / pr.total * 100) : 0;
    return h('a', { class: 'pcard card hover', href: '#/path/' + p.id },
      h('div', { class: 'row' }, h('span', { class: 'tag' }, p.level), h('span', { class: 'spacer' }), h('span', { class: 'muted tiny mono' }, pr.done + '/' + pr.total)),
      h('h3', {}, p.title), h('p', { class: 'dim small' }, p.tagline), meter(pct));
  }
  function paths(main) {
    const st = state();
    const v = h('div', { class: 'view' });
    v.append(pageHead('Learning paths', 'Follow a route', 'Ordered roadmaps that mix HackGrid labs with the best free platforms. Steps tick themselves off as you go.'));
    v.append(h('div', { class: 'grid-3' }, HR.paths.map(p => pathCard(p, st))));
    main.append(v);
  }
  function path(main, id) {
    const p = HR.pathById[id];
    if (!p) { location.hash = '#/paths'; return; }
    const st = state();
    const pr = HR.pathProgress(st, p);
    const v = h('div', { class: 'view' });
    v.append(h('a', { class: 'back', href: '#/paths' }, icon('arrowL', 14), 'All paths'));
    v.append(pageHead(p.level + ' · ' + p.hours, p.title, p.tagline, h('div', { class: 'kpis' }, kpi(pr.done + ' / ' + pr.total, 'steps done', true))));
    const list = h('ol', { class: 'steps card' });
    p.steps.forEach((s, i) => {
      const done = HR.stepDone(st, p, i);
      let title, sub, href, extBtn = null;
      if (s.a && HR.labById[s.a]) { const l = HR.labById[s.a]; title = l.title; sub = 'HackGrid · ' + HR.CATS[l.cat].name + ' · ' + HR.DIFFS[l.diff].label; href = '#/lab/' + l.id; }
      else if (s.e && HR.dirById[s.e]) {
        const d = HR.dirById[s.e]; title = d.name; sub = d.src + ' · external'; href = d.url;
        extBtn = done ? null : h('button', { class: 'btn xs', type: 'button', onclick: e => { e.preventDefault(); const r = HR.markExtDone(HR.loadState(), d.id); CF.toast('Marked done · +' + r.xp + ' XP'); HGApp.render(); } }, 'Mark done');
      } else return;
      list.append(h('li', { class: 'step' + (done ? ' done' : '') },
        h('span', { class: 'step-n mono' }, done ? icon('check', 14) : String(i + 1)),
        h('div', { class: 'step-main' },
          h('a', { href, target: s.e ? '_blank' : null, rel: s.e ? 'noopener noreferrer' : null, class: 'step-title' }, title, s.e ? icon('ext', 13) : null),
          h('span', { class: 'muted tiny' }, sub), s.note ? h('p', { class: 'dim small' }, s.note) : null),
        extBtn));
    });
    v.append(list);
    main.append(v);
  }

  /* ============================================================
     DIRECTORY
     ============================================================ */
  const DCATS = { web: 'Web', sqli: 'SQL injection', xss: 'XSS', cmdi: 'Command injection', linux: 'Linux', net: 'Networking', pwn: 'Binary', crypto: 'Crypto', blue: 'Blue team', forensics: 'Forensics', phish: 'Phishing', cloud: 'Cloud', ad: 'Active Directory', mobile: 'Mobile', ctf: 'CTF' };
  const dfilt = { cat: '', diff: '', cost: '', q: '' };
  function directory(main) {
    const v = h('div', { class: 'view' });
    v.append(pageHead('Directory', 'Hands-on platforms', 'Curated, free or free-tier places to attack real vulnerable apps legally. Pricing changes over time, so treat cost labels as a guide.'));
    const list = h('div', { class: 'dlist' });
    const meta = h('div', { class: 'result-meta' });
    const cats = Object.keys(DCATS).filter(c => HR.dir.some(d => d.cat === c));
    function paint() {
      const st = state();
      const q = dfilt.q.toLowerCase();
      const items = HR.dir.filter(d => (!dfilt.cat || d.cat === dfilt.cat) && (!dfilt.diff || d.diff === dfilt.diff) && (!dfilt.cost || d.cost === dfilt.cost) &&
        (!q || (d.name + ' ' + d.src + ' ' + d.learn).toLowerCase().includes(q)));
      meta.textContent = items.length + ' platforms and labs';
      list.innerHTML = '';
      items.forEach(d => {
        const done = !!st.ext[d.id];
        list.append(h('article', { class: 'drow card' + (done ? ' done' : '') },
          h('div', { class: 'drow-main' },
            h('div', { class: 'row wrap-row' }, h('a', { class: 'drow-name', href: d.url, target: '_blank', rel: 'noopener noreferrer' }, d.name, icon('ext', 13)), h('span', { class: 'muted tiny' }, d.src)),
            h('p', { class: 'dim small' }, d.learn),
            d.tip ? h('p', { class: 'muted tiny' }, d.tip) : null,
            h('div', { class: 'row wrap-row' }, h('span', { class: 'tag' }, DCATS[d.cat] || d.cat), h('span', { class: 'tag' }, d.diff), h('span', { class: 'tag ' + (d.cost === 'free' ? 'ok' : '') }, d.cost === 'free-tier' ? 'free tier' : d.cost), h('span', { class: 'tag' }, d.setup))),
          done ? h('span', { class: 'tag ok' }, icon('check', 12), 'Done')
            : h('button', { class: 'btn xs', type: 'button', onclick: () => { const r = HR.markExtDone(HR.loadState(), d.id); CF.toast('Marked done · +' + r.xp + ' XP'); HGApp.refreshChip(); paint(); } }, 'Mark done')));
      });
    }
    const sel = (key, opts, label) => h('select', { class: 'select', 'aria-label': label, onchange: e => { dfilt[key] = e.target.value; paint(); } },
      opts.map(([val, l]) => h('option', { value: val, selected: dfilt[key] === val }, l)));
    v.append(h('div', { class: 'toolbar' },
      h('div', { class: 'search grow' }, icon('search', 16), h('input', { class: 'input', type: 'search', placeholder: 'Search platforms', value: dfilt.q, oninput: e => { dfilt.q = e.target.value; paint(); } })),
      sel('diff', [['', 'Any level'], ['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']], 'Level'),
      sel('cost', [['', 'Any cost'], ['free', 'Free'], ['free-tier', 'Free tier']], 'Cost')));
    const chips = h('div', { class: 'chips' });
    const paintChips = () => { chips.innerHTML = ''; chips.append(h('button', { class: 'chip' + (!dfilt.cat ? ' on' : ''), type: 'button', onclick: () => { dfilt.cat = ''; paintChips(); paint(); } }, 'All'),
      ...cats.map(c => h('button', { class: 'chip' + (dfilt.cat === c ? ' on' : ''), type: 'button', onclick: () => { dfilt.cat = c; paintChips(); paint(); } }, DCATS[c]))); };
    paintChips();
    v.append(chips, meta, list);
    paint();
    main.append(v);
  }

  /* ============================================================
     PROFILE
     ============================================================ */
  function profile(main) {
    const st = state();
    const xp = HR.computeXP(st);
    const r = HR.rankFor(xp);
    const v = h('div', { class: 'view' });
    v.append(pageHead('Profile', r.rank.name, r.next ? (r.next.xp - xp) + ' XP to ' + r.next.name + '.' : 'Top rank reached.', h('div', { class: 'kpis' }, kpi(String(xp), 'XP', true), kpi(String(Object.keys(st.solved).filter(id => HR.labById[id]).length), 'labs'), kpi(String(Object.keys(st.ext).length), 'external'))));
    v.append(h('div', { class: 'card pad' }, h('div', { class: 'row' }, h('b', {}, r.rank.name), h('span', { class: 'spacer' }), h('span', { class: 'muted small' }, r.next ? r.next.name + ' at ' + r.next.xp + ' XP' : 'max')), meter(r.pct)));

    v.append(h('div', { class: 'section-head', style: 'margin-top:32px' }, h('h2', {}, 'Skills')));
    v.append(h('div', { class: 'card pad skillbars' }, HR.CAT_ORDER.map(c => {
      const s = HR.labStats(st, c);
      return h('a', { class: 'skillbar', href: '#/labs/' + c }, h('span', {}, HR.CATS[c].name), meter(s.pct), h('span', { class: 'mono tiny muted' }, s.solved + '/' + s.total));
    })));

    v.append(h('div', { class: 'section-head', style: 'margin-top:32px' }, h('h2', {}, 'Badges'), h('span', { class: 'muted small' }, Object.keys(st.badges).length + ' / ' + HR.BADGES.length)));
    v.append(h('div', { class: 'badges' }, HR.BADGES.map(b => h('div', { class: 'badge card' + (st.badges[b.id] ? ' earned' : '') },
      h('span', { class: 'badge-ic' }, icon('trophy', 18)), h('b', {}, b.name), h('span', { class: 'muted tiny' }, b.desc)))));

    v.append(h('div', { class: 'section-head', style: 'margin-top:32px' }, h('h2', {}, 'Your data')));
    const file = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async e => {
      try { const data = JSON.parse(await e.target.files[0].text()); if (!data || data.v !== 1) throw new Error(); HR.saveState(data); CF.toast('Progress imported'); HGApp.render(); }
      catch (err) { CF.toast('That file is not a HackGrid backup'); }
    } });
    v.append(h('div', { class: 'card pad' }, h('p', { class: 'dim small' }, 'Progress lives only in this browser. Export a backup to move it to another device.'),
      h('div', { class: 'row wrap-row' },
        h('button', { class: 'btn sm', type: 'button', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(HR.loadState(), null, 1)], { type: 'application/json' })), download: 'hackgrid-progress.json' }); a.click(); } }, 'Export progress'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => file.click() }, 'Import progress'),
        h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { if (confirm('Reset all HackGrid progress in this browser? This cannot be undone.')) { HR.saveState(HR.defaultState()); HGApp.render(); } } }, 'Reset')), file));
    main.append(v);
  }

  return { h, icon, home, labs, lab, paths, path, directory, profile };
})();
