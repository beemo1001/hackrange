/* HackGrid labs · Web & HTTP (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

L({ id: 'web-01', cat: 'web', diff: 1, title: 'Status Report',
  brief: `You browse a test shop and note the status code of every request. One response means: the server knows exactly who you are, and still says no.`,
  blocks: [{ t: 'table', title: 'Proxy history', cols: ['Method', 'Path', 'Status'], rows: [['GET', '/', '200 OK'], ['GET', '/old-catalog', '301 Moved Permanently'], ['GET', '/api/v2/users', '401 Unauthorized'], ['GET', '/admin', '403 Forbidden'], ['GET', '/backup.zip', '404 Not Found'], ['POST', '/api/cart', '500 Internal Server Error']] }],
  q: 'Which path returned "I know who you are, but you are not allowed"?', ph: '/path',
  accept: ["84a04c248965d2392b463bd74424c512aab08a08ac8c231ccd34591a617c9913", "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"],
  hints: [`401 and 403 sound similar but mean different things.`, `401 Unauthorized really means "unauthenticated": log in first.`, `403 Forbidden means authenticated (or not needed) but not permitted.`],
  walk: `<b>/admin</b> returned <span class="mono">403 Forbidden</span>: identity is not the problem, permission is. <span class="mono">401</span> asks you to authenticate. Bonus reading of this table: the 500 on <span class="mono">/api/cart</span> is worth a look (unhandled errors leak information), and a 301 tells you an old path still exists.` });

L({ id: 'web-02', cat: 'web', diff: 1, title: 'Cookie Jar',
  brief: `After logging into the test app, the server sets three cookies. One of them carries your authentication token and can be read by any JavaScript running on the page. If an XSS ever lands, that token walks out the door.`,
  blocks: [{ t: 'res', status: '200 OK', headers: 'Set-Cookie: prefs=theme%3Ddark; Path=/; SameSite=Lax\nSet-Cookie: csrf=9f2c41e0; Path=/; Secure; HttpOnly; SameSite=Strict\nSet-Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ4MjF9.x; Path=/; Secure; SameSite=Lax\ncontent-type: text/html' }],
  q: 'Which cookie is missing the flag that keeps JavaScript away from it?', ph: 'cookie name',
  accept: ["b00171bacea319da2f65495e86d96c717707642f52b7273a7b1f8536d6728904"],
  hints: [`The flag that hides a cookie from document.cookie is HttpOnly.`, `prefs holds nothing sensitive. Which cookie is sensitive?`, `The authentication cookie has Secure and SameSite, but not HttpOnly.`],
  walk: `<span class="mono">auth_token</span> has <span class="mono">Secure</span> and <span class="mono">SameSite=Lax</span> but no <span class="mono">HttpOnly</span>, so <span class="mono">document.cookie</span> exposes it. Session and auth cookies should always be <span class="mono">HttpOnly; Secure; SameSite</span>. It does not stop XSS, but it stops the easiest way to turn an XSS into account takeover.` });

L({ id: 'web-03', cat: 'web', diff: 2, title: 'Missing Armor',
  brief: `The login page of a test bank can be loaded inside an iframe on any website. That makes clickjacking possible. Look at the response headers and name the protection that is missing.`,
  blocks: [{ t: 'res', title: 'GET /login', status: '200 OK', headers: "Strict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nContent-Security-Policy: default-src 'self'; script-src 'self'\nReferrer-Policy: strict-origin-when-cross-origin\ncontent-type: text/html; charset=utf-8" }],
  q: 'Which header (or CSP directive) would stop other sites from framing this page?', ph: 'header or directive name',
  accept: ["42b518f30640c6ac2481ba4fc07ee4781bac5415d9438bd35d59eb922623c06a", "b0d26fd681b173845070a06a9faebefd3e19f79784496dc33ee514d1fd977b72", "5a86a9633799e952b1a1ee41f5aa2fee15dc6143e9b37f9b34fc29da2e5d8704", "0172a27c8bcd692ea29630dd7ba486e32e4f699d534229b1e3aeec9e580c5c47", "6bf3d87732ce6da32ac6ef335530396c93100e18395a1b3ebf23ce9bef1bd665", "0dfabbc16f14b53890bffc98629ca66601d59b4db402348071985fc598aa1f6f", "f435ea01b383f11beb78b3718ad7d79ac055210fa0f9dcaf59602fd64a190a49", "a38b6c71235e64638b7b2d347859efb3ca4181f6a443f0b6cc029700219027ad"],
  hints: [`Clickjacking needs the victim page inside a frame.`, `There is an old header for this and a modern CSP directive.`, `X-Frame-Options: DENY, or CSP frame-ancestors 'none'.`],
  walk: `The CSP restricts scripts but has no <span class="mono">frame-ancestors</span> directive, and there is no <span class="mono">X-Frame-Options</span> header. Either one fixes it: <span class="mono">Content-Security-Policy: frame-ancestors 'none'</span> (modern) or <span class="mono">X-Frame-Options: DENY</span> (legacy, still widely supported). Report missing headers only when you can show impact: a framed login or a one-click sensitive action is impact.` });

L({ id: 'web-04', cat: 'web', diff: 2, title: 'Read the Rules',
  brief: `A bug bounty program lists its scope, and the site's robots.txt lists paths the owner does not want crawled. robots.txt is not access control, but the program's scope IS the law. Which of these paths are you not allowed to test?`,
  blocks: [{ t: 'code', title: 'Program scope', text: 'In scope:   *.shop.example\nOut of scope: /api/internal/* on any host, third-party payment pages\nNo automated scanning faster than 5 requests/second.' },
    { t: 'code', title: 'https://www.shop.example/robots.txt', text: 'User-agent: *\nDisallow: /admin-legacy/\nDisallow: /api/internal/\nDisallow: /search?\nDisallow: /exports/' }],
  q: 'Which disallowed path is explicitly out of scope?', ph: '/path/',
  accept: ["9003d053e78d852ef33d8111238b94ee7a2e3a89ee6751a3e5181edb39850aab", "ef830e604eca94cdc33f60f0f6224fffa2301f40d512f799f5b2a3b2336b0329", "ca923016a1eb55c35900510e0e3f7526f87c2900612800c5cd84fd9374a5c25d", "faf89840a67381ebfdcbbe850faabbc95bfb43c0e1e35a7d6d7bd002aae6a4fb"],
  hints: [`Compare every Disallow line with the scope rules.`, `robots.txt only says "please do not crawl". Scope says what you may legally test.`, `One of the paths matches an out-of-scope rule word for word.`],
  walk: `<span class="mono">/api/internal/</span> is excluded by the program, so it is off limits no matter what robots.txt says. The other disallowed paths (<span class="mono">/admin-legacy/</span>, <span class="mono">/exports/</span>) are in scope and often interesting, because robots.txt tends to list exactly the places owners would rather you did not look. Read scope before every session: testing out of scope can get you banned or worse.` });

L({ id: 'web-05', cat: 'web', diff: 1, title: 'Token Timeline',
  brief: `You decoded the payload of a JWT from a test API. How long is it valid? iat is when it was issued and exp is when it expires, both as Unix timestamps in seconds.`,
  blocks: [{ t: 'code', title: 'JWT payload (decoded)', text: '{\n  "sub": "4821",\n  "role": "user",\n  "iat": 1793952000,\n  "exp": 1793955600\n}' }],
  q: 'How many minutes is this token valid?', ph: 'minutes',
  accept: ["39fa9ec190eee7b6f4dff1100d6343e10918d044c75eac8f9e9a2596173f80c9", "3d374f26e401656d8495d8724df716c1c8354a2184f9a83901b13e323b925ed4", "b63f1f48f79dc3c0319a846b9df813b98c4882df4d8b885b7f74d4ad237cf24f", "f8b8883f0c9d8d823a8df096ebde57ec04abe9f9cbc4eea1cbc3454c5025c484", "beac088784771a56031d00fd834d744533c35bb08cff202620117893f1746b27"],
  hints: [`Subtract iat from exp.`, `The difference is in seconds.`, `3600 seconds divided by 60.`],
  walk: `<span class="mono">1793955600 - 1793952000 = 3600</span> seconds, which is <b>60 minutes</b>. Short-lived access tokens limit the damage of a leak. Things worth testing on any JWT API (with permission): does the server actually reject expired tokens, and does it check the signature at all?` });

L({ id: 'web-06', cat: 'web', diff: 2, title: 'Secrets in the Bundle',
  brief: `Front-end JavaScript is public: anyone can read it in the browser. While reading the main bundle of a test app, you find its config object. One value is a server-side secret that should never have been shipped to browsers.`,
  blocks: [{ t: 'code', title: 'main.3f9a1c.js (excerpt)', text: 'const config = {\n  API_BASE: "https://api.shop.example/v2",\n  MAPS_PUBLIC_KEY: "pub_7Hk2...q9",\n  PAYMENTS_PUBLISHABLE: "pk_test_51Nx...aa",\n  SENTRY_DSN: "https://4f1e@errors.shop.example/12",\n  PAYMENTS_SECRET: "sk_live_9Qe1...Zt",\n  FEATURE_FLAGS: ["new-cart", "dark-mode"]\n};' }],
  q: 'Which config key holds the secret that must never reach the browser?', ph: 'key name',
  accept: ["57a9aadbae8418154c22652597b93cd381e55c312aa451851247d2b1e71fd1b6"],
  hints: [`Public and publishable keys are designed to be visible.`, `Look for the naming convention that says secret.`, `sk_live means a live secret key.`],
  walk: `<span class="mono">PAYMENTS_SECRET</span> holds a live secret key (<span class="mono">sk_live_</span>). With it, anyone can act as the shop against its payment provider. Publishable and public keys are meant for the front end. In a real program you report it immediately, do not use it, and the company must rotate it (deleting it from the bundle is not enough: it is already leaked).` });

L({ id: 'web-07', cat: 'web', diff: 2, title: 'Same Origin?',
  brief: `The browser's same-origin policy is the foundation of web security. Two URLs share an origin only when scheme, host and port all match.`,
  blocks: [{ t: 'code', title: 'Reference origin', text: 'https://app.shop.example' }],
  q: 'Which URL is same-origin with the reference?',
  choices: ['http://app.shop.example/settings', 'https://app.shop.example:443/settings', 'https://api.shop.example/settings', 'https://app.shop.example:8443/settings'],
  accept: ["3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"],
  hints: [`Check scheme, then host, then port. Paths do not matter.`, `https uses port 443 when no port is written.`, `Only one option keeps all three identical.`],
  walk: `<b>B</b>: <span class="mono">https://app.shop.example:443</span> is the same origin because 443 is the default https port. A changes the scheme (http), C changes the host (api), D changes the port (8443). Every CORS, cookie and postMessage question starts with this check.` });

L({ id: 'web-08', cat: 'web', diff: 3, title: 'CORS Confession',
  brief: `You send a request to a test API with an Origin header from a domain you made up. Read the response headers carefully.`,
  blocks: [{ t: 'req', method: 'GET', url: '/api/v2/me', headers: 'Host: api.shop.example\nOrigin: https://totally-random-site.example\nCookie: session=...' },
    { t: 'res', status: '200 OK', headers: 'Access-Control-Allow-Origin: https://totally-random-site.example\nAccess-Control-Allow-Credentials: true\ncontent-type: application/json', text: '{"id":4821,"email":"student@shop.example","address":"..."}' }],
  q: 'What is the problem?',
  choices: ['Nothing: CORS headers are only informational', 'The server reflects any Origin and allows credentials, so any website can read logged-in users\' data', 'The API should use a wildcard * instead', 'The Cookie header should not be sent over HTTPS'],
  accept: ["3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"],
  hints: [`Did the server know or trust this origin? It is a domain you invented.`, `Allow-Credentials: true means the browser sends cookies and lets the page read the response.`, `Reflecting the request Origin is equivalent to trusting everyone.`],
  walk: `<b>B</b>. The API copies whatever Origin it receives into <span class="mono">Access-Control-Allow-Origin</span> and adds <span class="mono">Allow-Credentials: true</span>. Any website a logged-in user visits can call this API with their cookies and read the JSON. The fix is a strict allowlist of trusted origins. Note that <span class="mono">*</span> with credentials is refused by browsers, which is why misconfigured servers reflect instead.` });

L({ id: 'web-09', cat: 'web', diff: 2, title: 'Pattern in the Logs',
  brief: `You are reviewing API logs of a test shop. User 4821 is logged in and looks at their order, then keeps going. Every request succeeds, and every response belongs to a different customer.`,
  blocks: [{ t: 'code', title: 'api.log', text: '09:14:02 uid=4821 GET /api/orders/77310 200 customer="Student, A."\n09:14:09 uid=4821 GET /api/orders/77309 200 customer="Nguyen, T."\n09:14:11 uid=4821 GET /api/orders/77308 200 customer="Okafor, C."\n09:14:12 uid=4821 GET /api/orders/77307 200 customer="Larsen, M."\n09:14:13 uid=4821 GET /api/orders/77306 200 customer="Silva, R."' }],
  q: 'What is the name of this vulnerability class? (common acronym)', ph: 'acronym or name',
  accept: ["0b5a52cdc4f5481343077f16476c5afde78732e28c9c5eafbf7f9a9a54a0540d", "b3777307274a541c0c9464647aa92c2254810bffbafc6e3a8e45b561843034ab", "d1868e7fdda3fab4292bd38c4835959cad104a3acdaf0dd4b82eea8105cc42a5", "8b88c35eb7ba86b91d8c4b69d468df3d24931071206c07cc61c3aaff03aaea88", "438f76afb3babc94246e69120007d0f1b4eea235bf8b5636ed4ec11bf8913977", "b2d4259e1ab2ca23b9391903d71553a9d7d1acd956067937b3996ac95d12f1ba"],
  hints: [`The user changes an ID in the URL and gets someone else's data.`, `The server checks that you are logged in, but not that the object is yours.`, `Four letters, starts with I. The API world calls it BOLA.`],
  walk: `This is <b>IDOR</b> (Insecure Direct Object Reference), called BOLA in the OWASP API Top 10. The server authenticates the user but never checks ownership of order 77309. Fix: every object lookup must include the current user (<span class="mono">WHERE id = ? AND owner_id = ?</span>). Detection tip: one user reading many sequential IDs belonging to others is a textbook alert rule.` });
})();
