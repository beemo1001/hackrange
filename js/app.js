/* ============================================================
   HackGrid app.js
   Router and header XP chip.
   ============================================================ */
window.HGApp = (function () {
  'use strict';
  const HR = window.HR;

  function refreshChip() {
    const el = document.getElementById('xpChip');
    if (!el) return;
    const xp = HR.computeXP(HR.loadState());
    el.innerHTML = '';
    el.append(Object.assign(document.createElement('b'), { textContent: xp + ' XP' }), Object.assign(document.createElement('span'), { textContent: HR.rankFor(xp).rank.name }));
  }

  const ROUTES = [
    [/^#?\/?$/, m => HG.home(m)],
    [/^#\/labs$/, m => HG.labs(m)],
    [/^#\/labs\/([a-z]+)$/, (m, x) => HG.labs(m, x[1])],
    [/^#\/arena(?:\/([a-z]+))?$/, (m, x) => { location.hash = x[1] ? '#/labs/' + x[1] : '#/labs'; }], // old HackRange links
    [/^#\/lab\/([a-z0-9-]+)$/, (m, x) => HG.lab(m, x[1])],
    [/^#\/paths$/, m => HG.paths(m)],
    [/^#\/path\/([a-z0-9-]+)$/, (m, x) => HG.path(m, x[1])],
    [/^#\/directory$/, m => HG.directory(m)],
    [/^#\/(profile|progress)$/, m => HG.profile(m)]
  ];

  function render() {
    const hash = location.hash || '#/';
    const main = document.getElementById('main');
    main.innerHTML = '';
    const top = '#/' + (hash.replace(/^#\/?/, '').split('/')[0] || '');
    const navKey = { '#/lab': '#/labs', '#/path': '#/paths', '#/progress': '#/profile' }[top] || top;
    document.querySelectorAll('.cf-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === navKey));
    const r = ROUTES.find(([re]) => re.test(hash));
    if (!r) { location.hash = '#/'; return; }
    r[1](main, hash.match(r[0]));
    window.scrollTo(0, 0);
    refreshChip();
  }

  function start() {
    CF.initChrome('hackgrid');
    window.addEventListener('hashchange', render);
    render();
  }

  return { start, render, refreshChip };
})();

document.addEventListener('DOMContentLoaded', HGApp.start);
