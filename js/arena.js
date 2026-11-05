/* ============================================================
   HackRange arena.js
   The Arena: category grid, lab lists, lab detail with the
   challenge environment, hint ladder, flag submission and
   walkthrough. Solve flow updates panels in place so the
   environment (terminal sessions) never resets.
   ============================================================ */

window.HR.arena = (function () {
  const HR = window.HR;
  const arena = {};

  /* ---------- shared bits ---------- */

  function diffPill(diff) {
    const d = HR.DIFFS[diff];
    return '<span class="diff-pill ' + d.cls + '">' + d.label + '</span>';
  }

  function catChip(cat) {
    const c = HR.CATS[cat];
    return '<span class="cat-chip cat-' + c.color + '">' + c.name + '</span>';
  }

  function progressRing(pct, size) {
    const s = size || 46, r = (s - 6) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - pct / 100);
    return '<svg class="ring" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="var(--border-2)" stroke-width="4"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 ' + s / 2 + ' ' + s / 2 + ')"/>' +
      '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" class="ring-txt">' + pct + '%</text></svg>';
  }

  /* ---------- arena home: category grid ---------- */

  arena.home = function (main, state) {
    const wrap = HR.el('div', { class: 'view' });
    const hero = HR.el('div', { class: 'hero' });
    hero.appendChild(HR.el('div', { class: 'hero-kicker', text: 'THE PRACTICE ARENA' }));
    const h1 = HR.el('h1');
    h1.innerHTML = 'Practice like it is <em>the real thing</em>';
    hero.appendChild(h1);
    hero.appendChild(HR.el('p', {
      html: HR.labs.length + ' built-in labs across 8 categories, all running in your browser, all free. Every lab has a mission, a challenge environment, a hint ladder and a full walkthrough that explains the <b>why</b>, not just the <b>what</b>.'
    }));
    const cta = HR.el('div', { class: 'hero-cta' });
    const st = HR.labStats(state);
    const firstUnsolved = HR.labs.find(l => !state.solved[l.id]) || HR.labs[0];
    cta.appendChild(HR.el('a', { class: 'btn primary', href: st.solved ? '#/lab/' + firstUnsolved.id : '#/lab/' + (HR.labById['enc-01'] ? 'enc-01' : firstUnsolved.id), text: st.solved ? 'Continue practicing' : 'Start with lab 1' }));
    cta.appendChild(HR.el('a', { class: 'btn', href: '#/directory', text: 'Browse ' + HR.dir.length + ' external labs' }));
    hero.appendChild(cta);
    wrap.appendChild(hero);

    const grid = HR.el('div', { class: 'cat-grid' });
    HR.CAT_ORDER.forEach(catId => {
      const c = HR.CATS[catId];
      const st = HR.labStats(state, catId);
      const labs = HR.labs.filter(l => l.cat === catId);
      const card = HR.el('a', {
        class: 'card card-pad cat-card cat-' + c.color,
        href: '#/arena/' + catId
      });
      const head = HR.el('div', { class: 'cat-card-head' });
      head.appendChild(HR.el('span', { class: 'cat-emoji', text: c.icon || '' }));
      head.appendChild(HR.el('span', { class: 'cat-name', text: c.name }));
      head.appendChild(HR.el('span', { class: 'cat-ring', html: progressRing(st.pct) }));
      card.appendChild(head);
      card.appendChild(HR.el('p', { class: 'cat-blurb', text: c.blurb }));
      const meta = HR.el('div', { class: 'cat-meta' });
      meta.appendChild(HR.el('span', { class: 'dim', text: st.solved + ' / ' + st.total + ' solved' }));
      const diffs = {};
      labs.forEach(l => diffs[l.diff] = (diffs[l.diff] || 0) + 1);
      [1, 2, 3, 4].forEach(d => {
        if (diffs[d]) meta.appendChild(HR.el('span', { class: 'diff-pill ' + HR.DIFFS[d].cls, text: HR.DIFFS[d].label + ' ×' + diffs[d] }));
      });
      card.appendChild(meta);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    main.appendChild(wrap);
  };

  /* ---------- one category: lab list ---------- */

  arena.category = function (main, state, catId) {
    const c = HR.CATS[catId];
    if (!c) { location.hash = '#/arena'; return; }
    const labs = HR.labs.filter(l => l.cat === catId);
    const st = HR.labStats(state, catId);

    const wrap = HR.el('div', { class: 'view' });
    const back = HR.el('a', { class: 'crumb', href: '#/arena', text: '← All categories' });
    wrap.appendChild(back);

    const title = HR.el('div', { class: 'section-title' });
    title.appendChild(HR.icon('arena'));
    title.appendChild(HR.el('span', { text: c.name }));
    const count = HR.el('span', { class: 'count', text: st.solved + ' of ' + st.total + ' solved' });
    title.appendChild(count);
    wrap.appendChild(title);
    wrap.appendChild(HR.el('p', { class: 'section-sub', text: c.blurb }));

    const list = HR.el('div', { class: 'lab-list' });
    labs.forEach((lab, i) => {
      const solved = !!state.solved[lab.id];
      const row = HR.el('a', { class: 'lab-row' + (solved ? ' solved' : ''), href: '#/lab/' + lab.id });
      const num = HR.el('span', { class: 'lab-num', text: String(i + 1).padStart(2, '0') });
      const mid = HR.el('div', { class: 'lab-mid' });
      mid.appendChild(HR.el('span', { class: 'lab-title', html: (solved ? '<span class="solved-tick">✓</span> ' : '') + HR.esc(lab.title) }));
      mid.appendChild(HR.el('span', { class: 'lab-briefline', text: lab.brief.slice(0, 96) + '...' }));
      const right = HR.el('div', { class: 'lab-right' });
      right.innerHTML = diffPill(lab.diff) + '<span class="xp-chip">' + lab.xp + ' XP</span>';
      row.appendChild(num); row.appendChild(mid); row.appendChild(right);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    main.appendChild(wrap);
  };

  /* ---------- lab detail ---------- */

  arena.lab = function (main, state, labId) {
    const lab = HR.labById[labId];
    if (!lab) { location.hash = '#/arena'; return; }
    const c = HR.CATS[lab.cat];
    const catLabs = HR.labs.filter(l => l.cat === lab.cat);
    const idx = catLabs.indexOf(lab);
    const prev = catLabs[idx - 1], next = catLabs[idx + 1];

    const wrap = HR.el('div', { class: 'view lab-view' });
    wrap.appendChild(HR.el('a', { class: 'crumb', href: '#/arena/' + lab.cat, text: '← ' + c.name }));

    /* header */
    const head = HR.el('div', { class: 'lab-head' });
    head.innerHTML =
      '<div class="lab-head-main">' + diffPill(lab.diff) +
      '<span class="xp-chip">' + lab.xp + ' XP</span>' +
      '<span class="cat-chip cat-' + c.color + '">' + c.name + '</span></div>' +
      '<h1>' + HR.esc(lab.title) + '</h1>';
    const status = HR.el('span', { class: 'lab-status' });
    head.appendChild(status);
    wrap.appendChild(head);

    function syncStatus(state2) {
      const rec = state2.solved[lab.id];
      status.innerHTML = rec
        ? '<span class="status-chip done">Solved · ' + HR.dateLabel(rec.t) + '</span>'
        : '<span class="status-chip open">Unsolved</span>';
    }
    syncStatus(state);

    /* brief */
    const brief = HR.el('div', { class: 'panel card-pad lab-panel' });
    const bt = HR.el('div', { class: 'panel-head' });
    bt.appendChild(HR.icon('book'));
    bt.appendChild(HR.el('span', { class: 'panel-title', text: 'Mission brief' }));
    brief.appendChild(bt);
    brief.appendChild(HR.el('p', { class: 'lab-brief', text: lab.brief }));
    wrap.appendChild(brief);

    /* environment */
    const envPanel = HR.el('div', { class: 'panel card-pad lab-panel' });
    const et = HR.el('div', { class: 'panel-head' });
    et.appendChild(HR.icon('term'));
    et.appendChild(HR.el('span', { class: 'panel-title', text: 'Challenge environment' }));
    envPanel.appendChild(et);
    const envMount = HR.el('div', { class: 'env-mount' });
    envPanel.appendChild(envMount);
    wrap.appendChild(envPanel);

    /* submission */
    const sub = HR.el('div', { class: 'panel card-pad lab-panel sub-panel' });
    const st2 = HR.el('div', { class: 'panel-head' });
    st2.appendChild(HR.icon('flag'));
    st2.appendChild(HR.el('span', { class: 'panel-title', text: lab.flag ? 'Flag' : 'Your answer' }));
    sub.appendChild(st2);
    const isEngine = !!lab.flag;
    sub.appendChild(HR.el('p', {
      class: 'dim small',
      html: isEngine
        ? HR.esc(lab.flagNote || 'The environment reveals the flag when you solve the challenge.')
        : HR.esc(lab.flagNote || 'Type your answer and submit. Case and spacing do not matter.')
    }));
    const row = HR.el('div', { class: 'env-inputrow' });
    const inp = HR.el('input', {
      class: 'input env-inject-input', type: 'text',
      placeholder: isEngine ? 'flag appears here when you solve it' : 'type your answer...',
      spellcheck: 'false'
    });
    const btn = HR.el('button', { class: 'btn primary', type: 'button', text: 'Submit' });
    row.appendChild(inp); row.appendChild(btn);
    sub.appendChild(row);
    const feedback = HR.el('div', { class: 'sub-feedback' });
    sub.appendChild(feedback);
    wrap.appendChild(sub);

    /* hints */
    const hints = HR.el('div', { class: 'panel card-pad lab-panel' });
    const ht = HR.el('div', { class: 'panel-head' });
    ht.appendChild(HR.icon('bulb'));
    ht.appendChild(HR.el('span', { class: 'panel-title', text: 'Hint ladder' }));
    ht.appendChild(HR.el('span', { class: 'dim small', text: 'hints 1 to 3 are free · the full solution halves the XP' }));
    hints.appendChild(ht);
    const ladder = HR.el('div', { class: 'hint-ladder' });
    (lab.hints || []).forEach((h, i) => {
      const card = HR.el('div', { class: 'hint-card' });
      const head = HR.el('button', {
        class: 'hint-head', type: 'button',
        onclick: function () {
          if (!card.classList.contains('open')) {
            card.classList.add('open');
            HR.recordHint(state, lab.id, i + 1);
          }
        }
      });
      head.innerHTML = '<span class="hint-n">' + (i + 1) + '</span><span>' +
        ['Nudge', 'Bigger nudge', 'Almost the answer'][i] + '</span><span class="hint-chev">▾</span>';
      card.appendChild(head);
      card.appendChild(HR.el('div', { class: 'hint-body', text: h }));
      ladder.appendChild(card);
    });
    hints.appendChild(ladder);

    /* full solution button */
    const walk = HR.el('div', { class: 'panel card-pad lab-panel walk-panel' });
    const wt = HR.el('div', { class: 'panel-head' });
    wt.appendChild(HR.icon('shield'));
    wt.appendChild(HR.el('span', { class: 'panel-title', text: 'Full walkthrough' }));
    walk.appendChild(wt);
    const walkBody = HR.el('div', { class: 'walk-body', html: lab.walk });
    walk.appendChild(walkBody);
    const walkBtn = HR.el('button', {
      class: 'btn walk-btn', type: 'button',
      text: 'Reveal full solution (halves XP for this lab)'
    });
    walkBtn.addEventListener('click', function () {
      if (!state.solved[lab.id]) {
        HR.recordHint(state, lab.id, 3);
        toastNote('Solution revealed. Solving after this earns half XP.');
      }
      walk.classList.add('open');
      walkBtn.remove();
    });
    walk.appendChild(walkBtn);
    wrap.appendChild(hints);
    wrap.appendChild(walk);

    /* study note */
    if (lab.study) {
      const study = HR.el('div', { class: 'panel card-pad lab-panel study-panel' });
      study.appendChild(HR.el('div', {
        class: 'study-note',
        html: '<b>Study material:</b> ' + HR.esc(lab.study)
      }));
      wrap.appendChild(study);
    }

    /* prev / next */
    const nav = HR.el('div', { class: 'lab-nav' });
    if (prev) nav.appendChild(HR.el('a', { class: 'btn', href: '#/lab/' + prev.id, text: '← ' + prev.title }));
    else nav.appendChild(HR.el('span'));
    if (next) nav.appendChild(HR.el('a', { class: 'btn', href: '#/lab/' + next.id, text: next.title + ' →' }));
    else nav.appendChild(HR.el('a', { class: 'btn', href: '#/arena/' + lab.cat, text: 'Back to ' + c.name + ' →' }));
    wrap.appendChild(nav);

    main.appendChild(wrap);

    /* ---------- behavior ---------- */

    function toastNote(msg) { HR.toast(msg, { icon: 'bulb', cls: 'toast-info' }); }

    function celebrate(res) {
      HR.confetti();
      HR.toast('<b>Lab solved</b> · +' + res.xp + ' XP', { icon: 'check' });
      (res.badges || []).forEach((b, i) => {
        setTimeout(() => {
          const def = HR.BADGES.find(x => x.id === b);
          HR.toast('<b>Badge unlocked</b> ' + (def ? def.icon + ' ' + def.name : b), { icon: 'bolt', cls: 'toast-badge' });
        }, 700 + i * 900);
      });
      if (window.HRApp && HRApp.refreshChip) HRApp.refreshChip();
    }

    function markSolved(res) {
      syncStatus(state);
      walk.classList.add('open');
      const wb = walk.querySelector('.walk-btn');
      if (wb) wb.remove();
      celebrate(res);
    }

    /* api for engine-driven labs */
    const api = {
      state: state,
      onSolve: function (flag) {
        if (state.solved[lab.id]) return;
        if (isEngine && HR.norm(flag) !== HR.norm(lab.flag)) return;
        if (!isEngine) {
          /* engine can also solve answer labs by matching accept */
          if (!HR.checkAnswer(lab, flag)) return;
        }
        if (isEngine) inp.value = lab.flag;
        else inp.value = flag;
        const res = HR.solveLab(lab, state);
        if (res) markSolved(res);
      }
    };

    /* mount environment */
    HR.envs.mount(lab.env.type, envMount, lab, api);

    /* flag / answer submission */
    function submit() {
      const v = inp.value;
      if (!v.trim()) return;
      if (state.solved[lab.id]) {
        feedback.innerHTML = '<div class="env-banner info">Already solved. Check the walkthrough below for the full lesson.</div>';
        return;
      }
      if (HR.checkAnswer(lab, v)) {
        const res = HR.solveLab(lab, state);
        feedback.innerHTML = '';
        if (res) markSolved(res);
      } else {
        feedback.innerHTML = '<div class="env-banner error"><b>Not it.</b> Read the raw response or scenario again, take hint 1, and think about what the environment is telling you.</div>';
      }
    }
    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

    /* already solved on arrival: open walkthrough, prefill flag */
    if (state.solved[lab.id]) {
      walk.classList.add('open');
      const wb = walk.querySelector('.walk-btn');
      if (wb) wb.remove();
      if (isEngine) inp.value = lab.flag;
    }
  };

  return arena;
})();
