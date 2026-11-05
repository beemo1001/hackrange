/* ============================================================
   HackRange views.js
   Home page and the Progress profile: rank ladder, badges,
   stats, per category progress, export / import / reset.
   ============================================================ */

window.HR.views = (function () {
  const HR = window.HR;
  const views = {};

  /* ---------------- home ---------------- */

  views.home = function (main, state) {
    const wrap = HR.el('div', { class: 'view' });
    const stAll = HR.labStats(state);
    const xp = HR.computeXP(state);
    const rankInfo = HR.rankFor(xp);
    const solvedCount = Object.keys(state.solved).length;
    const extCount = Object.keys(state.ext).length;
    const badgeCount = Object.keys(state.badges).length;

    const hero = HR.el('div', { class: 'hero' });
    hero.appendChild(HR.el('div', { class: 'hero-kicker', text: 'HACKRANGE · THE PRACTICE ARENA' }));
    const h1 = HR.el('h1');
    h1.innerHTML = 'Reading about hacking is not hacking. <em>Practice is.</em>';
    hero.appendChild(h1);
    hero.appendChild(HR.el('p', {
      html: '54 built-in labs that run entirely in your browser: simulated XSS pages with real filter logic, a mock SQL console, a fake Linux box to repair, assembly to read and payloads to fix. Plus ' + HR.dir.length + ' curated external labs and 6 learning paths. Free, offline, no account.'
    }));
    const cta = HR.el('div', { class: 'hero-cta' });
    cta.appendChild(HR.el('a', { class: 'btn primary', href: '#/arena', text: 'Enter the Arena' }));
    cta.appendChild(HR.el('a', { class: 'btn', href: '#/paths', text: 'Pick a path' }));
    hero.appendChild(cta);
    wrap.appendChild(hero);

    /* stat strip */
    const strip = HR.el('div', { class: 'stat-strip' });
    function stat(label, value, sub) {
      const s = HR.el('div', { class: 'card card-pad stat-card' });
      s.appendChild(HR.el('span', { class: 'stat-value', text: value }));
      s.appendChild(HR.el('span', { class: 'stat-label', text: label }));
      if (sub) s.appendChild(HR.el('span', { class: 'stat-sub', text: sub }));
      return s;
    }
    strip.appendChild(stat('Arena labs solved', solvedCount + ' / ' + stAll.total, stAll.pct + '% complete'));
    strip.appendChild(stat('Experience', xp + ' XP', rankInfo.rank.name + (rankInfo.next ? ' · next rank at ' + rankInfo.next.xp : '')));
    strip.appendChild(stat('External labs done', String(extCount), HR.dir.length + ' curated'));
    strip.appendChild(stat('Badges', String(badgeCount), HR.BADGES.length + ' to collect'));
    wrap.appendChild(strip);

    /* rank progress */
    const rankPanel = HR.el('div', { class: 'panel card-pad rank-panel' });
    const rt = HR.el('div', { class: 'panel-head' });
    rt.appendChild(HR.icon('progress'));
    rt.appendChild(HR.el('span', { class: 'panel-title', text: 'Rank: ' + rankInfo.rank.name }));
    if (rankInfo.next) rt.appendChild(HR.el('span', { class: 'dim small', text: rankInfo.next.xp - xp + ' XP to ' + rankInfo.next.name }));
    rankPanel.appendChild(rt);
    const ladder = HR.el('div', { class: 'rank-ladder' });
    HR.RANKS.forEach(r => {
      const cur = r.name === rankInfo.rank.name;
      const got = xp >= r.xp;
      ladder.appendChild(HR.el('span', {
        class: 'rank-chip' + (cur ? ' current' : '') + (got ? ' earned' : ''),
        text: r.name + (cur ? ' · ' + xp + ' XP' : ' · ' + r.xp + '+')
      }));
    });
    rankPanel.appendChild(ladder);
    const bar = HR.el('div', { class: 'path-bar' });
    bar.innerHTML = '<div class="path-bar-fill" style="width:' + rankInfo.pct + '%"></div>';
    rankPanel.appendChild(bar);
    wrap.appendChild(rankPanel);

    /* category progress */
    const t2 = HR.el('div', { class: 'section-title' });
    t2.appendChild(HR.icon('arena'));
    t2.appendChild(HR.el('span', { text: 'Categories' }));
    wrap.appendChild(t2);
    const grid = HR.el('div', { class: 'cat-grid compact' });
    HR.CAT_ORDER.forEach(catId => {
      const c = HR.CATS[catId];
      const st = HR.labStats(state, catId);
      const card = HR.el('a', { class: 'card card-pad cat-card cat-' + c.color, href: '#/arena/' + catId });
      const head = HR.el('div', { class: 'cat-card-head' });
      head.appendChild(HR.el('span', { class: 'cat-emoji', text: c.icon }));
      head.appendChild(HR.el('span', { class: 'cat-name', text: c.name }));
      const pctEl = HR.el('span', { class: 'cat-pct-txt' + (st.pct === 100 ? ' full' : ''), text: st.solved + '/' + st.total });
      head.appendChild(pctEl);
      card.appendChild(head);
      card.appendChild(HR.el('p', { class: 'cat-blurb', text: c.blurb }));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    /* how it works */
    const t3 = HR.el('div', { class: 'section-title' });
    t3.appendChild(HR.icon('bulb'));
    t3.appendChild(HR.el('span', { text: 'How HackRange works' }));
    wrap.appendChild(t3);
    const how = HR.el('div', { class: 'how-grid' });
    [
      ['1', 'Pick a lab', 'Each lab is a mission with a story: a broken server, a filtered search box, a mystery binary. No setup, no account, it just runs.'],
      ['2', 'Experiment in the environment', 'Inject payloads into simulated apps, type commands into a fake Linux box, trace assembly by hand. Wrong answers cost nothing.'],
      ['3', 'Climb the ladder when stuck', 'Three hints escalate gently. The full walkthrough explains WHY, and taking it before solving simply halves the XP. No shame, just XP math.'],
      ['4', 'Track everything', 'XP, ranks, badges and per category progress live in your browser. Export your progress as JSON and take it anywhere.']
    ].forEach(it => {
      const card = HR.el('div', { class: 'card card-pad how-card' });
      card.appendChild(HR.el('span', { class: 'how-n', text: it[0] }));
      card.appendChild(HR.el('h3', { text: it[1] }));
      card.appendChild(HR.el('p', { text: it[2] }));
      how.appendChild(card);
    });
    wrap.appendChild(how);

    /* ethics */
    wrap.appendChild(HR.el('div', {
      class: 'panel card-pad ethics-panel',
      html: '<b>Practice ranges only.</b> Every target in HackRange is either simulated in your browser or a platform that exists for legal practice. The skills transfer to real bug bounty programs, where scope rules and authorized testing are the difference between a researcher and a criminal. Stay in scope. Always.'
    }));

    main.appendChild(wrap);
  };

  /* ---------------- progress profile ---------------- */

  views.progress = function (main, state) {
    const wrap = HR.el('div', { class: 'view' });
    const stAll = HR.labStats(state);
    const xp = HR.computeXP(state);
    const rankInfo = HR.rankFor(xp);

    const hero = HR.el('div', { class: 'hero' });
    hero.appendChild(HR.el('div', { class: 'hero-kicker', text: 'YOUR PROGRESS' }));
    const h1 = HR.el('h1');
    h1.innerHTML = 'Rank <em>' + rankInfo.rank.name + '</em>';
    hero.appendChild(h1);
    hero.appendChild(HR.el('p', {
      html: xp + ' XP earned. ' + Object.keys(state.solved).length + ' of ' + stAll.total + ' arena labs solved, ' + Object.keys(state.ext).length + ' external labs done, ' + Object.keys(state.badges).length + ' of ' + HR.BADGES.length + ' badges collected.' +
        (rankInfo.next ? ' ' + (rankInfo.next.xp - xp) + ' XP to ' + rankInfo.next.name + '.' : ' Every rank earned. Maximum respect.')
    }));
    wrap.appendChild(hero);

    /* badges */
    const t1 = HR.el('div', { class: 'section-title' });
    t1.appendChild(HR.icon('bolt'));
    t1.appendChild(HR.el('span', { text: 'Badges' }));
    t1.appendChild(HR.el('span', { class: 'count', text: Object.keys(state.badges).length + ' / ' + HR.BADGES.length }));
    wrap.appendChild(t1);
    const bgrid = HR.el('div', { class: 'badge-grid' });
    HR.BADGES.forEach(b => {
      const got = !!state.badges[b.id];
      const card = HR.el('div', { class: 'card card-pad badge-card' + (got ? ' unlocked' : '') });
      card.appendChild(HR.el('span', { class: 'badge-emoji', text: got ? b.icon : '🔒' }));
      card.appendChild(HR.el('span', { class: 'badge-name', text: b.name }));
      card.appendChild(HR.el('span', { class: 'badge-desc', text: b.desc }));
      if (got) card.appendChild(HR.el('span', { class: 'badge-date', text: HR.dateLabel(state.badges[b.id]) }));
      bgrid.appendChild(card);
    });
    wrap.appendChild(bgrid);

    /* per category */
    const t2 = HR.el('div', { class: 'section-title' });
    t2.appendChild(HR.icon('arena'));
    t2.appendChild(HR.el('span', { text: 'Category progress' }));
    wrap.appendChild(t2);
    const cats = HR.el('div', { class: 'cat-progress-list' });
    HR.CAT_ORDER.forEach(catId => {
      const c = HR.CATS[catId];
      const st = HR.labStats(state, catId);
      const row = HR.el('a', { class: 'cat-progress-row', href: '#/arena/' + catId });
      row.innerHTML =
        '<span class="cat-emoji">' + c.icon + '</span>' +
        '<span class="cat-prog-name">' + c.name + '</span>' +
        '<div class="path-bar"><div class="path-bar-fill" style="width:' + st.pct + '%"></div></div>' +
        '<span class="cat-prog-count">' + st.solved + '/' + st.total + '</span>';
      cats.appendChild(row);
    });
    wrap.appendChild(cats);

    /* rank ladder */
    const t3 = HR.el('div', { class: 'section-title' });
    t3.appendChild(HR.icon('progress'));
    t3.appendChild(HR.el('span', { text: 'Rank ladder' }));
    wrap.appendChild(t3);
    const rl = HR.el('div', { class: 'panel card-pad' });
    const ladder = HR.el('div', { class: 'rank-ladder big' });
    HR.RANKS.forEach(r => {
      const cur = r.name === rankInfo.rank.name;
      ladder.appendChild(HR.el('span', {
        class: 'rank-chip' + (cur ? ' current' : '') + (xp >= r.xp ? ' earned' : ''),
        text: r.name + ' · ' + r.xp + ' XP'
      }));
    });
    rl.appendChild(ladder);
    wrap.appendChild(rl);

    /* solved labs timeline (recent) */
    const solvedIds = Object.keys(state.solved).sort((a, b) => state.solved[b].t.localeCompare(state.solved[a].t));
    if (solvedIds.length) {
      const t4 = HR.el('div', { class: 'section-title' });
      t4.appendChild(HR.icon('flag'));
      t4.appendChild(HR.el('span', { text: 'Recent solves' }));
      wrap.appendChild(t4);
      const list = HR.el('div', { class: 'lab-list' });
      solvedIds.slice(0, 8).forEach(id => {
        const lab = HR.labById[id];
        if (!lab) return;
        const rec = state.solved[id];
        const row = HR.el('a', { class: 'lab-row solved', href: '#/lab/' + id });
        const mid = HR.el('div', { class: 'lab-mid' });
        mid.appendChild(HR.el('span', { class: 'lab-title', html: '<span class="solved-tick">✓</span> ' + HR.esc(lab.title) }));
        mid.appendChild(HR.el('span', { class: 'lab-briefline', text: HR.CATS[lab.cat].name + ' · solved ' + HR.dateLabel(rec.t) + (rec.hints && rec.hints.length ? ' · ' + rec.hints.length + ' hint' + (rec.hints.length > 1 ? 's' : '') : ' · no hints, clean') }));
        const right = HR.el('div', { class: 'lab-right' });
        right.innerHTML = '<span class="xp-chip">' + (rec.hints && rec.hints.indexOf(3) !== -1 ? Math.round(lab.xp / 2) : lab.xp) + ' XP</span>';
        row.appendChild(HR.el('span', { class: 'lab-num', text: '✓' }));
        row.appendChild(mid); row.appendChild(right);
        list.appendChild(row);
      });
      wrap.appendChild(list);
    }

    /* data management */
    const t5 = HR.el('div', { class: 'section-title' });
    t5.appendChild(HR.icon('shield'));
    t5.appendChild(HR.el('span', { text: 'Your data' }));
    wrap.appendChild(t5);
    const dm = HR.el('div', { class: 'panel card-pad data-panel' });
    dm.appendChild(HR.el('p', {
      class: 'dim small',
      text: 'Everything is stored in this browser only: no account, no server, no telemetry. Export a backup before switching devices or clearing site data.'
    }));
    const rowBtn = HR.el('div', { class: 'filter-row' });

    const exp = HR.el('button', { class: 'btn', type: 'button', text: 'Export progress (JSON)' });
    exp.addEventListener('click', function () {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'hackrange-progress.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    rowBtn.appendChild(exp);

    const impLabel = HR.el('label', { class: 'btn ghost import-label' });
    impLabel.appendChild(document.createTextNode('Import progress'));
    const imp = HR.el('input', { type: 'file', accept: 'application/json' });
    imp.style.display = 'none';
    impLabel.appendChild(imp);
    imp.addEventListener('change', function () {
      const f = imp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = function () {
        try {
          const data = JSON.parse(r.result);
          if (!data || data.v !== 1 || typeof data.solved !== 'object') throw new Error('bad shape');
          const fresh = {
            v: 1, solved: data.solved || {}, ext: data.ext || {},
            paths: data.paths || {}, badges: data.badges || {}
          };
          HR.saveState(fresh);
          HR.toast('Progress imported. Welcome back.', { icon: 'check' });
          if (window.HRApp && HRApp.refreshChip) HRApp.refreshChip();
          const old = main.querySelector('.view');
          if (old) old.remove();
          views.progress(main, HR.loadState());
        } catch (e) {
          HR.toast('That file is not a valid HackRange backup.', { icon: 'lock', cls: 'toast-error' });
        }
      };
      r.readAsText(f);
    });
    rowBtn.appendChild(impLabel);

    const rst = HR.el('button', { class: 'btn danger-btn', type: 'button', text: 'Reset everything' });
    rst.addEventListener('click', function () {
      if (!window.confirm('Delete ALL HackRange progress in this browser? This cannot be undone. Export first if you want a backup.')) return;
      const fresh = HR.defaultState();
      HR.saveState(fresh);
      HR.toast('Progress reset. Fresh start.', { icon: 'bolt' });
      if (window.HRApp && HRApp.refreshChip) HRApp.refreshChip();
      const old = main.querySelector('.view');
      if (old) old.remove();
      views.progress(main, HR.loadState());
    });
    rowBtn.appendChild(rst);

    dm.appendChild(rowBtn);
    wrap.appendChild(dm);

    main.appendChild(wrap);
  };

  return views;
})();
