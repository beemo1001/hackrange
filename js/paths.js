/* ============================================================
   HackRange paths.js
   Learning paths: guided roadmaps mixing arena labs,
   external labs and advice milestones. Steps track
   automatically from your own progress.
   ============================================================ */

window.HR.pathsView = (function () {
  const HR = window.HR;
  const paths = {};
  /* NOTE: module is HR.pathsView, HR.paths stays the data array */

  function progressBar(pct) {
    return '<div class="path-bar"><div class="path-bar-fill" style="width:' + pct + '%"></div></div>';
  }

  paths.view = function (main, state) {
    const wrap = HR.el('div', { class: 'view' });
    const hero = HR.el('div', { class: 'hero' });
    hero.appendChild(HR.el('div', { class: 'hero-kicker', text: 'LEARNING PATHS' }));
    const h1 = HR.el('h1');
    h1.innerHTML = 'Roadmaps, not <em>random labs</em>';
    hero.appendChild(h1);
    hero.appendChild(HR.el('p', {
      html: 'Six guided sequences from absolute beginner to bug bounty ready. Steps check themselves off as you solve the labs, because a path that tracks you is a path you finish.'
    }));
    wrap.appendChild(hero);

    const grid = HR.el('div', { class: 'path-grid' });
    HR.paths.forEach(p => {
      const pr = HR.pathProgress(state, p);
      const pct = pr.total ? Math.round(pr.done / pr.total * 100) : 0;
      const card = HR.el('a', { class: 'card card-pad path-card' + (pct === 100 ? ' complete' : ''), href: '#/path/' + p.id });
      const top = HR.el('div', { class: 'path-card-top' });
      top.appendChild(HR.el('span', { class: 'path-level', text: p.level }));
      top.appendChild(HR.el('span', { class: 'path-hours', text: p.hours }));
      card.appendChild(top);
      card.appendChild(HR.el('h3', { text: p.title }));
      card.appendChild(HR.el('p', { class: 'path-tagline', text: p.tagline }));
      card.appendChild(HR.el('div', {
        class: 'path-meta',
        html: progressBar(pct) + '<span class="path-count">' + pr.done + ' / ' + pr.total + ' steps · ' + pct + '%</span>'
      }));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    main.appendChild(wrap);
  };

  paths.detail = function (main, state, id) {
    const p = HR.pathById[id];
    if (!p) { location.hash = '#/paths'; return; }
    const pr = HR.pathProgress(state, p);
    const pct = pr.total ? Math.round(pr.done / pr.total * 100) : 0;

    const wrap = HR.el('div', { class: 'view' });
    wrap.appendChild(HR.el('a', { class: 'crumb', href: '#/paths', text: '← All paths' }));

    const head = HR.el('div', { class: 'path-detail-head' });
    head.appendChild(HR.el('span', { class: 'path-level', text: p.level }));
    head.appendChild(HR.el('span', { class: 'path-hours dim', text: p.hours }));
    const h1 = HR.el('h1');
    h1.innerHTML = HR.esc(p.title);
    head.appendChild(h1);
    head.appendChild(HR.el('p', { class: 'path-tagline', text: p.tagline }));
    head.appendChild(HR.el('div', { class: 'path-meta', html: progressBar(pct) + '<span class="path-count">' + pr.done + ' / ' + pr.total + ' steps · ' + pct + '%</span>' }));
    wrap.appendChild(head);

    const steps = HR.el('div', { class: 'path-steps' });
    p.steps.forEach((s, i) => {
      const isMilestone = !s.a && !s.e;
      const row = HR.el('div', { class: 'path-step' + (isMilestone ? ' milestone' : '') });
      let done = false;

      let label = '', href = null;
      if (s.a) {
        const lab = HR.labById[s.a];
        done = !!state.solved[s.a];
        label = lab ? 'Arena: ' + lab.title : s.a;
        href = '#/lab/' + s.a;
      } else if (s.e) {
        const d = HR.dirById[s.e];
        done = !!state.ext[s.e];
        label = d ? d.name + ' · ' + d.src : s.e;
        href = d ? d.url : null;
      } else {
        label = s.label || 'Milestone';
      }

      const left = HR.el('div', { class: 'path-step-left' });
      left.appendChild(HR.el('span', { class: 'path-step-n' + (done ? ' done' : ''), text: done ? '✓' : String(i + 1).padStart(2, '0') }));

      const mid = HR.el('div', { class: 'path-step-mid' });
      const titleEl = (href && !s.a)
        ? HR.el('a', { class: 'path-step-title', href: href, target: s.e ? '_blank' : undefined, rel: s.e ? 'noopener noreferrer' : undefined, text: label })
        : (href && s.a)
          ? HR.el('a', { class: 'path-step-title', href: href, text: label })
          : HR.el('span', { class: 'path-step-title', text: label });
      mid.appendChild(titleEl);
      if (s.note) mid.appendChild(HR.el('span', { class: 'path-step-note', text: s.note }));
      row.appendChild(left);
      row.appendChild(mid);

      if (s.e && !state.ext[s.e]) {
        const markBtn = HR.el('button', { class: 'btn small ghost', type: 'button', text: 'Mark done' });
        markBtn.addEventListener('click', function () {
          const res = HR.markExtDone(state, s.e);
          HR.toast('Step done · +' + res.xp + ' XP', { icon: 'check' });
          res.badges.forEach((b, k) => setTimeout(() => {
            const def = HR.BADGES.find(x => x.id === b);
            HR.toast('<b>Badge unlocked</b> ' + (def ? def.icon + ' ' + def.name : b), { icon: 'bolt', cls: 'toast-badge' });
          }, 700 + k * 900));
          if (window.HRApp && HRApp.refreshChip) HRApp.refreshChip();
          const old = main.querySelector('.view');
          if (old) old.remove();
          paths.detail(main, state, id);
        });
        row.appendChild(markBtn);
      }
      steps.appendChild(row);
    });
    wrap.appendChild(steps);

    if (pct === 100) {
      wrap.appendChild(HR.el('div', {
        class: 'env-banner ok path-complete-banner',
        html: '<b>Path complete.</b> ' + HR.esc(p.title) + ' is finished. Your skills are real now, go use them somewhere it matters.'
      }));
    }

    main.appendChild(wrap);
  };

  return paths;
})();
