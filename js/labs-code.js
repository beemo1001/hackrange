/* HackGrid labs · Secure code review (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

L({ id: 'code-01', cat: 'code', diff: 1, title: 'Glued Together',
  brief: `A login helper builds its database query by gluing strings together. Pick the fix a senior reviewer would ask for.`,
  blocks: [{ t: 'code', title: 'auth.py', text: 'def find_user(cur, email):\n    cur.execute("SELECT id, pw_hash FROM users WHERE email = \'" + email + "\'")\n    return cur.fetchone()' }],
  q: 'What is the correct fix?',
  choices: ['Strip quote characters from email before building the query', 'Use a parameterized query: cur.execute("SELECT id, pw_hash FROM users WHERE email = %s", (email,))', 'Check that email contains an @ sign', 'Base64-encode email before putting it in the query'],
  accept: ["3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"],
  hints: [`The bug is that data becomes part of the SQL code.`, `Filtering characters is a blocklist: blocklists get bypassed.`, `The database driver can send code and data separately.`],
  walk: `<b>B</b>. Parameterized queries send the SQL and the value separately, so the value can never change the query's structure. Stripping quotes (A) breaks legitimate names like O'Brien and misses other tricks, format checks (C) are not a security boundary, and encoding (D) just breaks lookups. This is SQL injection, and the parameterized query is the fix in every language.` });

L({ id: 'code-02', cat: 'code', diff: 1, title: 'Hello, Stranger',
  brief: `A welcome banner greets visitors by the name in the URL. A reviewer flags it immediately.`,
  blocks: [{ t: 'code', title: 'welcome.js', text: "const params = new URLSearchParams(location.search);\nconst banner = document.getElementById('banner');\nbanner.innerHTML = 'Welcome back, ' + params.get('name') + '!';" }],
  q: 'What is the safest fix?',
  choices: ["banner.textContent = 'Welcome back, ' + params.get('name') + '!';", "Remove the string '<script>' from the name first", 'Only show the banner to logged-in users', 'Wrap the name in an encodeURIComponent() call'],
  accept: ["ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"],
  hints: [`innerHTML parses its input as HTML.`, `Is there a property that inserts text instead of HTML?`, `textContent never interprets markup.`],
  walk: `<b>A</b>. <span class="mono">textContent</span> inserts plain text, so anything in the URL is displayed, never executed. <span class="mono">innerHTML</span> with URL data is a DOM-based XSS sink. Removing one tag (B) is a blocklist, hiding it (C) does not change the bug, and URL-encoding (D) is the wrong encoding for HTML and would show garbage to real users.` });

L({ id: 'code-03', cat: 'code', diff: 2, title: 'Download Anything',
  brief: `An endpoint serves user uploads. The file name comes from the query string.`,
  blocks: [{ t: 'code', title: 'routes/files.js', text: "app.get('/download', requireLogin, (req, res) => {\n  const file = path.join(__dirname, 'uploads', req.query.file);\n  res.sendFile(file);\n});" }],
  q: 'Name the vulnerability class.', ph: 'vulnerability class',
  accept: ["48889f368c09a1c977445b9e5aed72f03394e07276cc7d178420e094592c07ce", "2e25ed6548177a4bbdd4d18826cf02cbb3e6b468be0d8146d4c565763d2e4ffa", "6d3b0dfc1e50925e7b551447c19f593a9b121d006ffb24101e5823d9d3f1dcc4", "ea74ccc2a500e816c8b46a77e0dad88762b4fbd8bd9ce38bde3323ca0c11a3d5", "c862a3e0dde1fbdd6ceb693834cc8981064d700bdc3651edd62247d0f769c22d", "2a74aebd467ecdf7ad0f93d49b6d6873c606a2c9bf69b5e844a556287fbf268f"],
  hints: [`What happens if file contains ../ sequences?`, `path.join resolves .. segments, it does not block them.`, `The attacker can climb out of the uploads folder.`],
  walk: `This is <b>path traversal</b>. <span class="mono">path.join(__dirname, 'uploads', '../../config/.env')</span> resolves outside the uploads directory. Fix: resolve the final path and verify it still starts with the uploads directory, or better, look files up by an ID in the database and never use user input as a path.` });

L({ id: 'code-04', cat: 'code', diff: 2, title: 'Delete Someone Else',
  brief: `Logged-in users can delete their own posts. The route checks login. Does it check enough?`,
  blocks: [{ t: 'code', title: 'routes/posts.js', text: "app.delete('/api/posts/:id', requireLogin, async (req, res) => {\n  await Post.deleteOne({ _id: req.params.id });\n  res.sendStatus(204);\n});" }],
  q: 'Which change fixes it?',
  choices: ['Add rate limiting to the route', 'Validate that req.params.id is a valid ObjectId', 'Delete only if the post belongs to the user: Post.deleteOne({ _id: req.params.id, author: req.user.id })', 'Change DELETE to POST'],
  accept: ["2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6"],
  hints: [`Authentication: who are you. Authorization: may you do this.`, `Any logged-in user can pass any post ID.`, `The query needs an ownership condition.`],
  walk: `<b>C</b>. The route authenticates but never authorizes: any user can delete any post by ID (IDOR / broken access control). Putting the owner in the query means another user's post simply does not match. Rate limits (A), ID format checks (B) and verb changes (D) do nothing for authorization.` });

L({ id: 'code-05', cat: 'code', diff: 2, title: 'In the Repo',
  brief: `A public repository contains this settings file. Which line will get the project a very bad day?`,
  blocks: [{ t: 'code', title: 'settings.py', text: '1  import os\n2  DEBUG = os.getenv("DEBUG", "false") == "true"\n3  ALLOWED_HOSTS = ["shop.example"]\n4  DATABASE_URL = os.environ["DATABASE_URL"]\n5  JWT_SECRET = "changeme-2024"\n6  SESSION_COOKIE_SECURE = True\n7  LOG_LEVEL = "INFO"' }],
  q: 'Which line number contains the hardcoded secret?', ph: 'line number',
  accept: ["ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", "a3634e0a10adb332d665e63dd9615107565c3b54f5e6e05d5d6819a97073284b"],
  hints: [`Most values here are read from the environment. One is not.`, `What signs authentication tokens?`, `A secret written in the source is public the moment the repo is.`],
  walk: `Line <b>5</b>: <span class="mono">JWT_SECRET = "changeme-2024"</span>. Anyone who reads the repo can sign their own tokens, for example with an admin role. Secrets belong in environment variables or a secrets manager (like line 4). If one was ever committed, rotate it: git history keeps it forever.` });

L({ id: 'code-06', cat: 'code', diff: 2, title: 'Lucky Numbers',
  brief: `Password reset tokens are generated like this. Reviewers say they are guessable.`,
  blocks: [{ t: 'code', title: 'reset.js', text: "function makeResetToken() {\n  return Math.random().toString(36).slice(2, 10);\n}" }],
  q: 'What is the right replacement?',
  choices: ['Math.random().toString(36).slice(2) + Date.now()', "crypto.randomBytes(32).toString('hex')", 'A SHA-256 hash of the user\'s email', 'The user ID plus the current timestamp'],
  accept: ["3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"],
  hints: [`Math.random is fast, not secure.`, `Tokens need a cryptographically secure random source and enough length.`, `Node has a crypto module for exactly this.`],
  walk: `<b>B</b>. <span class="mono">crypto.randomBytes(32)</span> gives 256 bits from a cryptographically secure generator. <span class="mono">Math.random()</span> is predictable and the token is only 8 characters. Adding a timestamp (A, D) adds almost no entropy, and a hash of the email (C) is the same every time and computable by anyone.` });

L({ id: 'code-07', cat: 'code', diff: 3, title: 'Trusting the Cookie',
  brief: `User preferences are stored in a cookie and loaded on every request.`,
  blocks: [{ t: 'code', title: 'app.py', text: "@app.before_request\ndef load_prefs():\n    raw = request.cookies.get('prefs')\n    if raw:\n        g.prefs = pickle.loads(base64.b64decode(raw))" }],
  q: 'Name the vulnerability class.', ph: 'vulnerability class',
  accept: ["34498bef6c3d66959b9acc51f2cdfd94bd3ed42dca38163391b96eac7fc1b6e8", "009273cb073724e06474a09b6415ddcddc43cb324ce948c8b7d320d425d8b88e", "193b4b6f7400e383f9443d022456ed01b86b97b417ebe0a84716f4488a85adcc", "cfb9141623dbf2f8707c5178ed276b3b821881cdf1960455c043844006200ffa", "69ed4790ddedda4513dda31f2b8af81f93ff79dff13db8c12659bc1ca8e641c4"],
  hints: [`The cookie is fully controlled by the user.`, `What does pickle.loads do with arbitrary bytes?`, `Python's own docs warn: never unpickle untrusted data.`],
  walk: `<b>Insecure deserialization</b>. <span class="mono">pickle</span> can rebuild arbitrary objects, and crafted data can run code during loading, so a user-controlled cookie becomes remote code execution. Fix: store simple data as JSON (<span class="mono">json.loads</span>) and sign it (or keep preferences server-side).` });

L({ id: 'code-08', cat: 'code', diff: 3, title: 'Compare Carefully',
  brief: `An internal API checks a static key on every request.`,
  blocks: [{ t: 'code', title: 'middleware.js', text: "function checkKey(req, res, next) {\n  if (req.headers['x-api-key'] == process.env.API_KEY) return next();\n  res.sendStatus(401);\n}" }],
  q: 'What is the subtle weakness and its fix?',
  choices: ['== should be === and that fully fixes it', 'Normal string comparison stops at the first different character, leaking timing; use crypto.timingSafeEqual on equal-length buffers', 'Headers are encrypted so there is no issue', 'Move the key to a query parameter'],
  accept: ["3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"],
  hints: [`Think about how long the comparison takes for a nearly-correct key versus a totally wrong one.`, `The difference is tiny but measurable over many requests.`, `Node offers a constant-time comparison.`],
  walk: `<b>B</b>. A regular comparison returns as soon as one character differs, so response timing can reveal how much of the key is right. <span class="mono">crypto.timingSafeEqual</span> takes the same time regardless (compare equal-length buffers, e.g. hashes of both values). <span class="mono">===</span> is good hygiene but not the fix, and query parameters (D) leak into logs.` });

L({ id: 'code-09', cat: 'code', diff: 2, title: 'Where Next?',
  brief: `After login, users are sent back to the page they came from.`,
  blocks: [{ t: 'code', title: 'login.js', text: "app.post('/login', async (req, res) => {\n  // ...check password...\n  res.redirect(req.query.next || '/dashboard');\n});" }],
  q: 'What is the best fix?',
  choices: ['Only allow relative paths that start with a single / (and not //), otherwise go to /dashboard', 'URL-encode req.query.next', 'Use a 302 instead of a 301 redirect', 'Check that next contains the word dashboard'],
  accept: ["ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"],
  hints: [`What if next is a full URL to another site?`, `This is called an open redirect, and phishers love it.`, `Watch out: //evil.example is also an absolute URL.`],
  walk: `<b>A</b>. Without validation, <span class="mono">?next=https://phish.example</span> turns the real login page into a trusted-looking launchpad for phishing. Accept only same-site relative paths (starting with one <span class="mono">/</span>, not <span class="mono">//</span> or <span class="mono">/\\</span>), or map short names to an allowlist. Substring checks (D) are trivially bypassed.` });

L({ id: 'code-10', cat: 'code', diff: 2, title: 'Update Everything',
  brief: `The profile update endpoint saves whatever JSON the client sends.`,
  blocks: [{ t: 'code', title: 'models/user.js + routes/me.js', text: "// User fields: id, name, email, avatar, role ('user' | 'admin'), created_at\n\napp.patch('/api/me', requireLogin, async (req, res) => {\n  await User.update(req.user.id, req.body);\n  res.json(await User.get(req.user.id));\n});" }],
  q: 'Which field would a user add to their request to escalate privileges?', ph: 'field name',
  accept: ["4b168d88dc872a7753c2bc35b36a2d4249487af55baf78f247f38cae2fe962da", "4c27f56632ec0fd60359bc8ec548bbff2e2589606a504b4bbdfc13c263c8a946", "a67b9a5b6278e936cb82979ce64cf8af1c0a9b31bc4a2b470fab53654f491132", "2e37b8e59bd6979f0e2d74362fa83f1615e0966e40cf2b712bb4d5ae84d19e66", "d639395ffb629e2a00d51fbed4bad4154bbe0ffefba559be2caa4b316c5d5ad3"],
  hints: [`The client controls every key in req.body.`, `Which field decides what a user is allowed to do?`, `The model lists it with two possible values.`],
  walk: `<span class="mono">{"role": "admin"}</span>. This is <b>mass assignment</b>: the server copies all client-supplied fields into the model. Fix with an allowlist of editable fields (<span class="mono">name, avatar</span>), never a blocklist. Test it ethically by adding fields from the API's own responses to your update requests on your own account.` });
})();
