/* ============================================================
   HackRange envs.js
   Challenge environment engines:
   - static  : scenario blocks (code, request/response, story)
   - reflect : simulated XSS reflection page with WAF rules
   - query   : mock SQL console (formed query + result table)
   - cmdi    : simulated command injection shell output
   - terminal: interactive fake Linux shell with a mini filesystem
   Everything is rendered ESCAPED. No user input is ever injected
   into the DOM as raw HTML.
   ============================================================ */

window.HR.envs = (function () {
  const HR = window.HR;
  const envs = {};

  /* ---------------- shared pieces ---------------- */

  function codeBlock(title, text, cls) {
    const w = HR.el('div', { class: 'env-code ' + (cls || '') });
    if (title) w.appendChild(HR.el('div', { class: 'env-code-title', text: title }));
    w.appendChild(HR.el('pre', { class: 'env-pre', text: text }));
    return w;
  }

  function banner(type, html) {
    return HR.el('div', { class: 'env-banner ' + type, html: html });
  }

  function resultTable(spec) {
    if (!spec || !spec.cols) return null;
    const t = HR.el('table', { class: 'env-table' });
    const thead = HR.el('thead');
    const trh = HR.el('tr');
    spec.cols.forEach(c => trh.appendChild(HR.el('th', { text: c })));
    thead.appendChild(trh); t.appendChild(thead);
    const tb = HR.el('tbody');
    (spec.rows || []).forEach(r => {
      const tr = HR.el('tr');
      r.forEach(cell => {
        const td = HR.el('td');
        if (String(cell).indexOf('HR{') !== -1) {
          td.className = 'env-flagcell';
          td.appendChild(HR.el('span', { class: 'env-flagtext', text: String(cell) }));
        } else td.textContent = String(cell);
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }

  function flagPanel(flag, api) {
    const p = HR.el('div', { class: 'env-flagpanel' });
    p.appendChild(HR.el('div', { class: 'env-flaghead' }));
    const label = HR.el('div', { class: 'env-flaglabel', text: 'CHALLENGE SOLVED · YOUR FLAG' });
    const row = HR.el('div', { class: 'env-flagrow' });
    const code = HR.el('code', { class: 'env-flagcode', text: flag });
    const copy = HR.el('button', {
      class: 'btn small', type: 'button', text: 'Copy',
      onclick: function () {
        try { navigator.clipboard.writeText(flag); } catch (e) { }
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1400);
      }
    });
    row.appendChild(code); row.appendChild(copy);
    p.appendChild(label); p.appendChild(row);
    return p;
  }

  /* trigger the shared solve flow */
  function fireSolve(lab, api, flag, mount) {
    if (api.onSolve) api.onSolve(flag, mount);
  }

  /* ============================================================
     STATIC scenario blocks
     ============================================================ */
  envs.static = function (mount, lab, api) {
    const blocks = lab.env.blocks || [];
    blocks.forEach(b => {
      if (b.t === 'p') mount.appendChild(HR.el('p', { class: 'env-p', html: b.html }));
      else if (b.t === 'code') mount.appendChild(codeBlock(b.title, b.text));
      else if (b.t === 'req') {
        const text = b.method + ' ' + b.url + ' HTTP/1.1\n' + (b.headers || '') + (b.body ? '\n\n' + b.body : '');
        mount.appendChild(codeBlock('Request', text));
      } else if (b.t === 'res') {
        const text = 'HTTP/1.1 ' + b.status + '\n' + (b.headers || '') + (b.text ? '\n\n' + b.text : '');
        mount.appendChild(codeBlock('Response', text, 'env-code-res'));
      } else if (b.t === 'mc') {
        const box = HR.el('div', { class: 'mc-box' });
        box.appendChild(HR.el('div', { class: 'mc-title', text: b.q }));
        b.options.forEach((o, i) => {
          box.appendChild(HR.el('div', {
            class: 'mc-opt',
            html: '<span class="mc-letter">' + String.fromCharCode(65 + i) + '</span><span>' + HR.esc(o) + '</span>',
            onclick: function () {
              Array.prototype.forEach.call(box.querySelectorAll('.mc-opt'), x => x.classList.remove('sel'));
              box.classList.add('sel');
              box.setAttribute('data-pick', String.fromCharCode(65 + i));
            }
          }));
        });
        mount.appendChild(box);
      }
    });
  };

  /* ============================================================
     REFLECT engine (XSS)
     lab.env = { app, build(input), waf:[{re,msg}], exec(input) }
     ============================================================ */
  envs.reflect = function (mount, lab, api) {
    const env = lab.env;
    const head = HR.el('div', { class: 'env-apphead' });
    head.appendChild(HR.el('span', { class: 'env-appdot' }));
    head.appendChild(HR.el('span', { class: 'env-appname', text: env.app }));
    head.appendChild(HR.el('span', { class: 'env-apppath', text: 'https://lab.hackrange.local/search' }));
    mount.appendChild(head);

    const row = HR.el('div', { class: 'env-inputrow' });
    const inp = HR.el('input', {
      class: 'input env-inject-input', type: 'text',
      placeholder: env.placeholder || 'type your input for the page',
      spellcheck: 'false'
    });
    const btn = HR.el('button', { class: 'btn primary', type: 'button', text: 'Inject' });
    row.appendChild(inp); row.appendChild(btn);
    mount.appendChild(row);

    const out = HR.el('div', { class: 'env-out' });
    mount.appendChild(out);
    out.appendChild(HR.el('div', { class: 'env-hintline', html: 'Enter a value and press <b>Inject</b>. The page below is a faithful simulation of how the server embeds your input.' }));

    function run() {
      const v = inp.value;
      out.innerHTML = '';
      if (!v.trim()) {
        out.appendChild(banner('info', 'Type something first. Even a boring word like <span class="mono">book</span> shows you the reflection.'));
        return;
      }
      for (const rule of (env.waf || [])) {
        if (rule.re.test(v)) {
          out.appendChild(banner('blocked', '<b>Blocked by WAF.</b> ' + HR.esc(rule.msg) + ' <span class="mono dim">403 Forbidden</span>'));
          out.appendChild(codeBlock('Server response', 'HTTP/1.1 403 Forbidden\ncontent-type: text/html\n\n<h1>403</h1>Request blocked by security filter.'));
          return;
        }
      }
      const html = env.build(v);
      out.appendChild(codeBlock('What the server sent back (raw HTML)', html));
      const verdict = env.exec(v);
      if (verdict === true) {
        const browser = HR.el('div', { class: 'env-browser' });
        const bar = HR.el('div', { class: 'env-browserbar', html: '<span></span><span></span><span></span>' });
        const view = HR.el('div', { class: 'env-browserview' });
        const txt = HR.el('div', { class: 'env-inert', text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '(empty page)' });
        view.appendChild(txt);
        const alert = HR.el('div', { class: 'fake-alert' });
        alert.appendChild(HR.el('div', { class: 'fake-alert-title', text: 'lab.hackrange.local says' }));
        alert.appendChild(HR.el('div', { class: 'fake-alert-body', text: '1' }));
        alert.appendChild(HR.el('button', { class: 'btn small', type: 'button', text: 'OK' }));
        view.appendChild(alert);
        browser.appendChild(bar);
        browser.appendChild(view);
        out.appendChild(browser);
        out.appendChild(banner('ok', '<b>Script execution confirmed.</b> The event fired and JavaScript ran. That is a real XSS.'));
        out.appendChild(flagPanel(lab.flag, api));
        fireSolve(lab, api, lab.flag, mount);
      } else {
        const browser = HR.el('div', { class: 'env-browser' });
        const bar = HR.el('div', { class: 'env-browserbar', html: '<span></span><span></span><span></span>' });
        const view = HR.el('div', { class: 'env-browserview' });
        const txt = HR.el('div', { class: 'env-inert', text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '(empty page)' });
        view.appendChild(txt);
        browser.appendChild(bar); browser.appendChild(view);
        out.appendChild(browser);
        const note = typeof verdict === 'string' ? verdict : 'The HTML rendered but nothing executed. Read the raw response above: where exactly did your payload land?';
        out.appendChild(banner('info', HR.esc(note)));
      }
    }
    btn.addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  };

  /* ============================================================
     QUERY engine (SQL injection)
     lab.env = { label, placeholder, sql(input), waf, run(input) }
     ============================================================ */
  envs.query = function (mount, lab, api) {
    const env = lab.env;
    const row = HR.el('div', { class: 'env-inputrow' });
    const inp = HR.el('input', {
      class: 'input env-inject-input', type: 'text',
      placeholder: env.placeholder || "inject into the query",
      spellcheck: 'false'
    });
    const btn = HR.el('button', { class: 'btn primary', type: 'button', text: env.action || 'Submit' });
    row.appendChild(inp); row.appendChild(btn);
    mount.appendChild(row);

    const out = HR.el('div', { class: 'env-out' });
    mount.appendChild(out);
    out.appendChild(HR.el('div', {
      class: 'env-hintline',
      html: 'Value goes into: <span class="mono">' + HR.esc(env.template) + '</span>'
    }));

    function run() {
      const v = inp.value;
      out.innerHTML = '';
      if (!v.trim()) { out.appendChild(banner('info', 'Enter a value for the parameter first.')); return; }
      for (const rule of (env.waf || [])) {
        if (rule.re.test(v)) {
          out.appendChild(banner('blocked', '<b>WAF:</b> ' + HR.esc(rule.msg)));
          return;
        }
      }
      const sql = env.sql(v);
      out.appendChild(codeBlock('Query sent to the database', sql));
      const r = env.run(v);
      if (r.error) out.appendChild(banner('error', '<b>Database error:</b> ' + HR.esc(r.error)));
      if (r.msg) out.appendChild(banner(r.ok ? 'ok' : 'info', HR.esc(r.msg)));
      if (r.rows) {
        const t = resultTable(r.rows);
        if (t) out.appendChild(t);
      }
      if (r.solved) {
        out.appendChild(flagPanel(lab.flag, api));
        fireSolve(lab, api, lab.flag, mount);
      }
    }
    btn.addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  };

  /* ============================================================
     CMDI engine (command injection)
     lab.env = { label, placeholder, multiline, waf, run(input) }
     ============================================================ */
  envs.cmdi = function (mount, lab, api) {
    const env = lab.env;
    const head = HR.el('div', { class: 'env-apphead' });
    head.appendChild(HR.el('span', { class: 'env-appdot' }));
    head.appendChild(HR.el('span', { class: 'env-appname', text: env.app }));
    head.appendChild(HR.el('span', { class: 'env-apppath', text: 'https://lab.hackrange.local/tools/ping' }));
    mount.appendChild(head);

    const row = HR.el('div', { class: 'env-inputrow' + (env.multiline ? ' env-inputrow-col' : '') });
    let inp;
    if (env.multiline) {
      inp = HR.el('textarea', {
        class: 'input env-inject-area', rows: '3',
        placeholder: env.placeholder || 'hostname to ping',
        spellcheck: 'false'
      });
    } else {
      inp = HR.el('input', {
        class: 'input env-inject-input', type: 'text',
        placeholder: env.placeholder || 'hostname to ping',
        spellcheck: 'false'
      });
    }
    const btn = HR.el('button', { class: 'btn primary', type: 'button', text: 'Ping' });
    row.appendChild(inp); row.appendChild(btn);
    mount.appendChild(row);

    const out = HR.el('div', { class: 'env-out' });
    mount.appendChild(out);
    out.appendChild(HR.el('div', {
      class: 'env-hintline',
      html: 'The app runs: <span class="mono">' + HR.esc(env.shellCmd) + '</span>'
    }));

    function run() {
      const v = inp.value;
      out.innerHTML = '';
      if (!v.trim()) { out.appendChild(banner('info', 'Enter a hostname.')); return; }
      for (const rule of (env.waf || [])) {
        if (rule.re.test(v)) {
          out.appendChild(banner('blocked', '<b>WAF:</b> ' + HR.esc(rule.msg)));
          return;
        }
      }
      const r = env.run(v);
      const pre = HR.el('pre', { class: 'env-pre env-shellout' });
      pre.textContent = (r.out || []).join('\n') || '(no output)';
      out.appendChild(pre);
      if (r.note) out.appendChild(banner('info', HR.esc(r.note)));
      if (r.solved) {
        out.appendChild(flagPanel(lab.flag, api));
        fireSolve(lab, api, lab.flag, mount);
      }
    }
    btn.addEventListener('click', run);
    if (inp.tagName === 'INPUT') inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  };

  /* ============================================================
     TERMINAL engine (Linux diagnosis)
     lab.env = { user, host, welcome[], fs (tree), exec(cmd, io, ctx) }
     ============================================================ */
  envs.terminal = function (mount, lab, api) {
    const env = lab.env;
    const user = env.user || 'student';
    const host = env.host || 'lab-01';
    const ctx = { cwd: env.startDir || '/home/' + user, state: {}, solvedFlag: false };

    const box = HR.el('div', { class: 'term' });
    const screen = HR.el('div', { class: 'term-screen' });
    const screenOut = HR.el('div', { class: 'term-out' });
    const line = HR.el('div', { class: 'term-line' });
    const prompt = HR.el('span', { class: 'term-prompt', html: '<span class="term-user">' + user + '@' + host + '</span>:<span class="term-cwd">~</span>$' });
    const inp = HR.el('input', { class: 'term-input', type: 'text', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'terminal input' });
    line.appendChild(prompt); line.appendChild(inp);
    screen.appendChild(screenOut); screen.appendChild(line);
    box.appendChild(screen);
    mount.appendChild(box);
    if (env.welcome) env.welcome.forEach(w => print(w));

    const history = []; let hIdx = -1;

    function shortCwd() {
      const home = '/home/' + user;
      if (ctx.cwd === home) return '~';
      if (ctx.cwd.indexOf(home + '/') === 0) return '~' + ctx.cwd.slice(home.length);
      return ctx.cwd;
    }
    function syncPrompt() {
      prompt.innerHTML = '<span class="term-user">' + user + '@' + host + '</span>:<span class="term-cwd">' + HR.esc(shortCwd()) + '</span>$';
    }
    function print(text, cls) {
      if (text == null) return;
      String(text).split('\n').forEach(l => {
        screenOut.appendChild(HR.el('div', { class: 'term-row ' + (cls || ''), text: l }));
      });
      screen.scrollTop = screen.scrollHeight;
    }
    function printHTML(html) {
      screenOut.appendChild(HR.el('div', { class: 'term-row', html: html }));
      screen.scrollTop = screen.scrollHeight;
    }

    const io = {
      print: print, printHTML: printHTML, err: t => print(t, 'term-err'),
      clear: () => { screenOut.innerHTML = ''; },
      solve: function (flag) {
        if (ctx.solvedFlag) return;
        ctx.solvedFlag = true;
        print('');
        printHTML('<span class="term-flag">FLAG CAPTURED: ' + HR.esc(flag) + '</span>');
        fireSolve(lab, api, flag, mount);
      }
    };

    /* ---- mini filesystem ---- */
    function node(path) {
      const abs = resolve(path);
      const parts = abs.split('/').filter(Boolean);
      let n = env.fs;
      for (const p of parts) {
        if (!n || n.type !== 'd' || !n.children[p]) return null;
        n = n.children[p];
      }
      return n;
    }
    function resolve(p) {
      let base;
      if (!p) return ctx.cwd;
      if (p[0] === '/') base = [];
      else if (p === '~' || p.slice(0, 2) === '~/') { base = ['home', user]; p = p.slice(1); }
      else base = ctx.cwd.split('/').filter(Boolean);
      for (const seg of p.split('/')) {
        if (!seg || seg === '.') continue;
        if (seg === '..') base.pop();
        else base.push(seg);
      }
      return '/' + base.join('/');
    }
    function parentOf(abs) {
      const parts = abs.split('/').filter(Boolean);
      const name = parts.pop();
      return { parent: '/' + parts.join('/'), name: name };
    }

    /* ---- builtin commands ---- */
    const builtins = {
      help: function () {
        print('Available commands: ' +
          'ls  cd  pwd  cat  head  tail  file  echo  grep  wc  find-ish: ls -R not needed\n' +
          'chmod  rm  touch  df  du  ps  id  whoami  uname  date  history  clear\n' +
          'systemctl  journalctl  crontab  curl  ping  nginx  bash  sudo\n' +
          'Tip: use arrow keys for command history.');
        return true;
      },
      ls: function (args) {
        const long = args.indexOf('-l') !== -1 || args.indexOf('-la') !== -1 || args.indexOf('-al') !== -1;
        const target = args.filter(a => a[0] !== '-')[0] || ctx.cwd;
        const n = node(target);
        if (!n) { io.err('ls: cannot access ' + target + ': No such file or directory'); return true; }
        if (n.type === 'f') { print(target); return true; }
        const names = Object.keys(n.children).sort();
        if (!names.length) { print('(empty)'); return true; }
        if (!long) { print(names.join('  ')); return true; }
        const lines = names.map(name => {
          const c = n.children[name];
          const isDir = c.type === 'd';
          const mode = c.mode || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
          const size = isDir ? '4096' : String((c.content || '').length);
          return mode.padEnd(11) + '1 student student ' + size.padStart(7) + ' ' + name;
        });
        print('total ' + names.length);
        print(lines.join('\n'));
        return true;
      },
      cd: function (args) {
        const t = args[0] || '~';
        const n = node(t);
        if (!n) { io.err('cd: ' + t + ': No such file or directory'); return true; }
        if (n.type !== 'd') { io.err('cd: ' + t + ': Not a directory'); return true; }
        ctx.cwd = resolve(t); syncPrompt();
        return true;
      },
      pwd: function () { print(ctx.cwd); return true; },
      cat: function (args) {
        if (!args.length) { io.err('cat: missing file operand'); return true; }
        args.forEach(t => {
          const n = node(t);
          if (!n) io.err('cat: ' + t + ': No such file or directory');
          else if (n.type === 'd') io.err('cat: ' + t + ': Is a directory');
          else print(n.content || '');
        });
        return true;
      },
      head: function (args) {
        const t = args.filter(a => a[0] !== '-')[0];
        const n = t && node(t);
        if (!n || n.type !== 'f') { io.err('head: cannot open ' + (t || '') + ' for reading'); return true; }
        print((n.content || '').split('\n').slice(0, 10).join('\n'));
        return true;
      },
      tail: function (args) {
        const t = args.filter(a => a[0] !== '-')[0];
        const n = t && node(t);
        if (!n || n.type !== 'f') { io.err('tail: cannot open ' + (t || '') + ' for reading'); return true; }
        print((n.content || '').split('\n').slice(-10).join('\n'));
        return true;
      },
      file: function (args) {
        const t = args[0]; const n = t && node(t);
        if (!n) { io.err(t + ': cannot open'); return true; }
        print(t + ': ' + (n.type === 'd' ? 'directory' : (n.filetype || 'ASCII text')));
        return true;
      },
      grep: function (args) {
        const pat = args.find(a => a[0] !== '-') || '';
        const t = args.filter(a => a[0] !== '-')[1];
        const n = t && node(t);
        if (!n || n.type !== 'f') { io.err('grep: ' + (t || '') + ': No such file or directory'); return true; }
        const re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        print((n.content || '').split('\n').filter(l => re.test(l)).join('\n') || '(no matches)');
        return true;
      },
      wc: function (args) {
        const t = args.filter(a => a[0] !== '-')[0];
        const n = t && node(t);
        if (!n || n.type !== 'f') { io.err('wc: ' + (t || '') + ': No such file or directory'); return true; }
        const lines = (n.content || '').split('\n').filter(Boolean).length;
        print(lines + ' ' + (t || ''));
        return true;
      },
      echo: function (raw) {
        const m = raw.match(/^echo\s+(.*)$/);
        let rest = m ? m[1] : '';
        const redirect = rest.match(/^(.*?)\s*(>>?)\s*(\S+)\s*$/);
        if (redirect) {
          const text = redirect[1].replace(/^["']|["']$/g, '');
          const append = redirect[2] === '>>';
          const abs = resolve(redirect[3]);
          const { parent, name } = parentOf(abs);
          const dir = node(parent);
          if (!dir || dir.type !== 'd') { io.err(redirect[3] + ': No such file or directory'); return true; }
          const existing = dir.children[name];
          const prev = append && existing && existing.type === 'f' ? (existing.content || '') + '\n' : '';
          dir.children[name] = { type: 'f', mode: 'rw-r--r--', content: prev + text, filetype: 'ASCII text' };
          return true;
        }
        print(rest.replace(/^["']|["']$/g, ''));
        return true;
      },
      touch: function (args) {
        const t = args[0]; if (!t) { io.err('touch: missing file operand'); return true; }
        const abs = resolve(t); const { parent, name } = parentOf(abs);
        const dir = node(parent);
        if (!dir || dir.type !== 'd') { io.err('touch: cannot touch ' + t + ': No such file or directory'); return true; }
        if (!dir.children[name]) {
          if (typeof env.onTouch === 'function') return env.onTouch(t, io, ctx);
          dir.children[name] = { type: 'f', mode: 'rw-r--r--', content: '', filetype: 'empty' };
        }
        return true;
      },
      rm: function (args) {
        const flags = args.filter(a => a[0] === '-').join('');
        const targets = args.filter(a => a[0] !== '-');
        if (!targets.length) { io.err('rm: missing operand'); return true; }
        const t = targets[0];
        const abs = resolve(t);
        const { parent, name } = parentOf(abs);
        const dir = node(parent);
        const n = node(abs);
        /* labs may intercept custom removals (wildcards, bulk) first */
        if (typeof env.onRm === 'function') {
          const handled = env.onRm(abs, n, io, ctx, t);
          if (handled) return true;
        }
        if (!n) { io.err('rm: cannot remove ' + t + ': No such file or directory'); return true; }
        if (n.type === 'd' && flags.indexOf('r') === -1) { io.err('rm: cannot remove ' + t + ': Is a directory'); return true; }
        delete dir.children[name];
        return true;
      },
      chmod: function (args) {
        const mode = args[0]; const t = args[1];
        if (!mode || !t) { io.err('chmod: missing operand'); return true; }
        const n = node(t);
        if (!n) { io.err('chmod: cannot access ' + t + ': No such file or directory'); return true; }
        if (!/^[0-7]{3,4}$/.test(mode)) { io.err('chmod: invalid mode: ' + mode); return true; }
        const bits = ('000' + parseInt(mode.slice(-3), 8).toString(2)).slice(-9);
        const map = [['r', 'w', 'x'], ['r', 'w', 'x'], ['r', 'w', 'x']];
        let out = (n.type === 'd' ? 'd' : '-');
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out += bits[i * 3 + j] === '1' ? map[i][j] : '-';
        n.mode = out;
        if (typeof env.onChmod === 'function') env.onChmod(mode, n, t, io, ctx);
        return true;
      },
      df: function (args) {
        const table = typeof env.df === 'function' ? env.df(args, ctx) : env.df;
        print(table);
        return true;
      },
      du: function (args) {
        const t = args.filter(a => a[0] !== '-')[0] || '.';
        if (typeof env.du === 'function') { print(env.du(t, ctx)); return true; }
        const n = node(t);
        if (!n) { io.err('du: cannot access ' + t + ': No such file or directory'); return true; }
        print('42M\t' + t);
        return true;
      },
      whoami: function () { print(user); return true; },
      id: function () { print('uid=1000(' + user + ') gid=1000(' + user + ') groups=1000(' + user + ')'); return true; },
      uname: function () { print('Linux ' + host + ' 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux'); return true; },
      date: function () { print(new Date().toString()); return true; },
      history: function () { history.forEach((h, i) => print(String(i + 1).padStart(4) + '  ' + h)); return true; },
      clear: function () { io.clear(); return true; },
      sudo: function () { io.err(user + ' is not in the sudoers file. This incident will be reported.'); return true; },
      vi: function () { io.err('vi: no interactive editors in this lab. Use sed or echo with a redirect.'); return true; },
      nano: function () { io.err('nano: no interactive editors in this lab. Use sed or echo with a redirect.'); return true; },
      ps: function () { print(env.ps || '  PID TTY          TIME CMD\n  842 pts/0    00:00:00 bash\n 1024 pts/0    00:00:00 ps'); return true; },
      bash: function (args) { return runScript(args[0]); },
      exit: function () { print('logout (nice try, the lab stays open)'); return true; }
    };

    function runScript(t) {
      if (!t) { io.err('bash: no script given'); return true; }
      const n = node(t);
      if (!n) { io.err('bash: ' + t + ': No such file or directory'); return true; }
      if (n.type !== 'f') { io.err('bash: ' + t + ': Is a directory'); return true; }
      if (typeof env.onScript === 'function') return env.onScript(t, n, io, ctx);
      print(n.content || '');
      return true;
    }

    function runRaw(raw) {
      /* executable path like ./deploy.sh */
      if (raw.indexOf('./') === 0 || /^\.\.?\//.test(raw)) {
        const parts = raw.split(/\s+/);
        const n = node(parts[0]);
        if (!n) { io.err(parts[0] + ': No such file or directory'); return true; }
        if (n.type === 'f' && (!n.mode || n.mode[3] !== 'x')) {
          io.err('-bash: ' + parts[0] + ': Permission denied');
          return true;
        }
        if (n.type === 'f' && typeof env.onScript === 'function') return env.onScript(parts[0], n, io, ctx);
        print(n.content || '');
        return true;
      }
      return false;
    }

    function execCmd(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      printHTML('<span class="term-cmdline">' + user + '@' + host + ':' + HR.esc(shortCwd()) + '$ ' + HR.esc(trimmed) + '</span>');
      /* lab-specific command handling first */
      if (typeof env.exec === 'function' && env.exec(trimmed, io, ctx)) return;
      if (runRaw(trimmed)) return;
      const m = trimmed.match(/^(\S+)\s*(.*)$/);
      const cmd = m ? m[1] : trimmed;
      const rest = m ? m[2] : '';
      const args = rest ? rest.split(/\s+/).filter(Boolean) : [];
      if (builtins[cmd]) {
        if (cmd === 'echo') builtins.echo(trimmed);
        else builtins[cmd](args);
      } else if (cmd.indexOf('/') !== -1 && node(cmd)) {
        runScript(cmd);
      } else {
        io.err(cmd + ': command not found');
      }
    }

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const v = inp.value;
        inp.value = '';
        if (!v.trim()) { printHTML('<span class="term-cmdline">' + user + '@' + host + ':' + HR.esc(shortCwd()) + '$</span>'); return; }
        history.push(v); hIdx = history.length;
        execCmd(v);
        screen.scrollTop = screen.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; inp.value = history[hIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; inp.value = history[hIdx] || ''; }
        else { hIdx = history.length; inp.value = ''; }
      }
    });
    setTimeout(function () { inp.focus(); }, 60);
    box.addEventListener('click', function () { inp.focus(); });
  };

  envs.mount = function (type, mount, lab, api) {
    mount.innerHTML = '';
    (envs[type] || envs.static)(mount, lab, api);
  };

  return envs;
})();
