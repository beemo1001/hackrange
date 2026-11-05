/* ============================================================
   HackRange app.js
   Router, boot screen, header XP chip, navigation state.
   ============================================================ */

window.HRApp = (function () {
  const HR = window.HR;
  const app = {};

  const main = () => document.getElementById('main');

  app.refreshChip = function () {
    const el = document.getElementById('xpChip');
    if (!el) return;
    const state = HR.loadState();
    const xp = HR.computeXP(state);
    const info = HR.rankFor(xp);
    el.innerHTML = '<span class="xp-chip-big">' + xp + ' XP</span><span class="rank-chip-mini">' + info.rank.name + '</span>';
  };

  function setActiveNav(hash) {
    const navs = document.querySelectorAll('.nav a');
    const first = (hash || '#/').split('/')[1] || '';
    navs.forEach(a => {
      const target = (a.getAttribute('href') || '').replace('#/', '').split('/')[0];
      a.classList.toggle('active', target === first);
    });
  }

  function render() {
    const hash = location.hash || '#/';
    const state = HR.loadState();
    const m = main();
    if (!m) return;
    m.innerHTML = '';
    setActiveNav(hash);

    let handled = false;
    const routes = [
      [/^#?\/?$/, function () { HR.views.home(m, state); }],
      [/^#\/arena$/, function () { HR.arena.home(m, state); }],
      [/^#\/arena\/([a-z]+)$/, function (mm) { HR.arena.category(m, state, mm[1]); }],
      [/^#\/lab\/([a-z0-9-]+)$/, function (mm) { HR.arena.lab(m, state, mm[1]); }],
      [/^#\/directory$/, function () { HR.directory.view(m, state); }],
      [/^#\/paths$/, function () { HR.pathsView.view(m, state); }],
      [/^#\/path\/([a-z0-9-]+)$/, function (mm) { HR.pathsView.detail(m, state, mm[1]); }],
      [/^#\/progress$/, function () { HR.views.progress(m, state); }]
    ];
    for (const r of routes) {
      const mm = hash.match(r[0]);
      if (mm) { r[1](mm); handled = true; break; }
    }
    if (!handled) { location.hash = '#/'; return; }

    /* keep scroll at top on view change, but not when only hash param changed within lab view */
    window.scrollTo(0, 0);
    app.refreshChip();
  }

  /* boot screen, family style */
  function boot() {
    const boot = document.querySelector('.boot');
    const fill = document.querySelector('.boot-fill');
    const status = document.querySelector('.boot-status');
    const steps = [
      'loading lab definitions...',
      'compiling ' + HR.labs.length + ' challenge environments...',
      'indexing ' + HR.dir.length + ' external labs...',
      'checking local progress...',
      'ready'
    ];
    let i = 0, pct = 0;
    const t = setInterval(function () {
      pct = Math.min(100, pct + 12 + Math.random() * 18);
      if (fill) fill.style.width = pct + '%';
      if (status) status.textContent = steps[Math.min(i, steps.length - 1)];
      i++;
      if (pct >= 100) {
        clearInterval(t);
        setTimeout(function () {
          if (boot) boot.remove();
          render();
        }, 260);
      }
    }, 130);
  }

  app.start = function () {
    window.addEventListener('hashchange', render);
    boot();
  };

  return app;
})();

document.addEventListener('DOMContentLoaded', function () {
  HRApp.start();
});
