/* ============================================================
   HackRange directory.js
   The Directory: 120+ curated external labs with filters.
   Done marking feeds XP and the Explorer badge.
   ============================================================ */

window.HR.directory = (function () {
  const HR = window.HR;
  const dir = {};

  const CAT_LABELS = {
    web: 'Web', xss: 'XSS', sqli: 'SQL Injection', cmdi: 'Command Injection',
    linux: 'Linux & PrivEsc', rev: 'Reverse Engineering', pwn: 'Binary Exploitation',
    crypto: 'Cryptography', blue: 'Blue Team', mobile: 'Mobile', ctf: 'Multi-skill / CTF'
  };
  const DIFF_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', mixed: 'Mixed' };
  const COST_LABELS = { free: '100% free', 'free-tier': 'Free tier' };
  const SETUP_LABELS = { browser: 'Browser only', burp: 'Browser + Burp', download: 'Download / local', vpn: 'VPN / lab box', ssh: 'SSH', account: 'Free account' };

  const filters = { q: '', cat: '', diff: '', cost: '', setup: '' };

  dir.view = function (main, state) {
    const wrap = HR.el('div', { class: 'view' });
    const hero = HR.el('div', { class: 'hero' });
    hero.appendChild(HR.el('div', { class: 'hero-kicker', text: 'THE DIRECTORY' }));
    const h1 = HR.el('h1');
    h1.innerHTML = 'The best free practice grounds, <em>curated</em>';
    hero.appendChild(h1);
    hero.appendChild(HR.el('p', {
      html: HR.dir.length + ' hand picked labs, wargames and vulnerable apps from across the internet. All free or free tier. Filter by what you want to practice, mark what you finish, and let the XP follow.'
    }));
    wrap.appendChild(hero);

    /* filter bar */
    const bar = HR.el('div', { class: 'panel card-pad filter-bar' });
    const row1 = HR.el('div', { class: 'filter-row' });
    const q = HR.el('input', {
      class: 'input filter-q', type: 'text', placeholder: 'Search name, platform or skill...',
      value: filters.q
    });
    row1.appendChild(q);

    const mkSelect = function (key, label, options) {
      const s = HR.el('select', { class: 'select' });
      s.appendChild(HR.el('option', { value: '', text: label }));
      Object.keys(options).forEach(k => {
        const o = HR.el('option', { value: k, text: options[k] });
        if (filters[key] === k) o.selected = true;
        s.appendChild(o);
      });
      s.addEventListener('change', function () { filters[key] = s.value; render(); });
      return s;
    };
    row1.appendChild(mkSelect('cat', 'All categories', CAT_LABELS));
    row1.appendChild(mkSelect('diff', 'All levels', DIFF_LABELS));
    row1.appendChild(mkSelect('cost', 'All costs', COST_LABELS));
    row1.appendChild(mkSelect('setup', 'All setups', SETUP_LABELS));
    bar.appendChild(row1);
    wrap.appendChild(bar);

    const countLine = HR.el('p', { class: 'dim small dir-count' });
    wrap.appendChild(countLine);

    const grid = HR.el('div', { class: 'dir-grid' });
    wrap.appendChild(grid);
    main.appendChild(wrap);

    q.addEventListener('input', function () { filters.q = q.value; render(); });

    function matches(d) {
      if (filters.cat && d.cat !== filters.cat) return false;
      if (filters.diff && d.diff !== filters.diff) return false;
      if (filters.cost && d.cost !== filters.cost) return false;
      if (filters.setup && d.setup !== filters.setup) return false;
      if (filters.q) {
        const hay = (d.name + ' ' + d.src + ' ' + d.learn + ' ' + (CAT_LABELS[d.cat] || '')).toLowerCase();
        if (hay.indexOf(filters.q.toLowerCase()) === -1) return false;
      }
      return true;
    }

    function render() {
      const list = HR.dir.filter(matches);
      countLine.textContent = list.length + ' of ' + HR.dir.length + ' labs shown · ' +
        Object.keys(state.ext).length + ' marked done';
      grid.innerHTML = '';
      if (!list.length) {
        grid.appendChild(HR.el('div', {
          class: 'empty-note',
          text: 'Nothing matches these filters. Loosen one and try again.'
        }));
        return;
      }
      list.forEach(d => {
        const done = !!state.ext[d.id];
        const card = HR.el('div', { class: 'card dir-card' + (done ? ' done' : '') });

        const head = HR.el('div', { class: 'dir-head' });
        const titleRow = HR.el('div', { class: 'dir-title-row' });
        titleRow.appendChild(HR.el('span', { class: 'dir-name', text: d.name }));
        titleRow.appendChild(HR.el('span', { class: 'dir-src', text: d.src }));
        head.appendChild(titleRow);
        const chips = HR.el('div', { class: 'dir-chips' });
        chips.innerHTML =
          '<span class="cat-chip cat-dircat">' + (CAT_LABELS[d.cat] || d.cat) + '</span>' +
          '<span class="diff-pill diff-dir">' + (DIFF_LABELS[d.diff] || d.diff) + '</span>' +
          '<span class="cost-pill ' + (d.cost === 'free' ? 'cost-free' : 'cost-tier') + '">' + (COST_LABELS[d.cost] || d.cost) + '</span>' +
          '<span class="setup-pill">' + (SETUP_LABELS[d.setup] || d.setup) + '</span>';
        head.appendChild(chips);
        card.appendChild(head);

        card.appendChild(HR.el('p', { class: 'dir-learn', text: d.learn }));

        const tip = HR.el('div', { class: 'dir-tip' });
        tip.appendChild(HR.el('span', { class: 'dir-tip-label', text: 'Student tip' }));
        tip.appendChild(HR.el('span', { text: d.tip }));
        card.appendChild(tip);

        const actions = HR.el('div', { class: 'dir-actions' });
        const doneBtn = HR.el('button', {
          class: 'btn small' + (done ? ' primary' : ''),
          type: 'button',
          text: done ? '✓ Done' : 'Mark done'
        });
        doneBtn.addEventListener('click', function () {
          if (state.ext[d.id]) {
            delete state.ext[d.id];
            HR.saveState(state);
          } else {
            const res = HR.markExtDone(state, d.id);
            HR.toast('<b>' + d.name + '</b> marked done · +' + res.xp + ' XP', { icon: 'check' });
            res.badges.forEach((b, i) => setTimeout(() => {
              const def = HR.BADGES.find(x => x.id === b);
              HR.toast('<b>Badge unlocked</b> ' + (def ? def.icon + ' ' + def.name : b), { icon: 'bolt', cls: 'toast-badge' });
            }, 700 + i * 900));
          }
          if (window.HRApp && HRApp.refreshChip) HRApp.refreshChip();
          render();
        });
        actions.appendChild(doneBtn);
        actions.appendChild(HR.el('a', {
          class: 'btn small ghost', href: d.url, target: '_blank', rel: 'noopener noreferrer',
          text: 'Open lab ↗'
        }));
        card.appendChild(actions);
        grid.appendChild(card);
      });
    }
    render();
  };

  return dir;
})();
