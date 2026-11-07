/* HackGrid labs · Phishing, plus extra Crypto and Linux labs (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

/* ---------------- Phishing & social engineering ---------------- */
L({ id: 'phish-01', cat: 'phish', diff: 1, title: 'Read the Whole Domain',
  brief: `An email from "Northwind Bank" (a fictional bank) asks you to verify your account. The link looks like it goes to the bank. Domains are read from right to left.`,
  blocks: [{ t: 'code', title: 'Link in the email', text: 'https://northwindbank.example.secure-verify.example/login?acct=88213' }],
  q: 'What is the registered domain this link really goes to?', ph: 'domain',
  accept: ["baccecf4384369ba4fe879ebef04734d9b1bccfecb4bed290a23b88640742525"],
  hints: [`The real owner is the part right before the top-level domain.`, `Everything to the left is a subdomain the attacker chose freely.`, `northwindbank.example here is only a subdomain label.`],
  walk: `The host is <span class="mono">northwindbank.example.secure-verify.example</span>. Reading right to left: TLD <span class="mono">.example</span>, registered domain <b>secure-verify.example</b>. Everything to its left is a subdomain the attacker controls. Teach users to find the last two labels before the first slash.` });

L({ id: 'phish-02', cat: 'phish', diff: 2, title: 'Headers Do Not Lie',
  brief: `The display name says IT Support and the From address uses the company domain. The headers tell a different story.`,
  blocks: [{ t: 'code', title: 'Email headers (excerpt)', text: 'Return-Path: <bounce@mailer-7731.example>\nReceived: from mailer-7731.example (unknown [198.51.100.200])\n        by mx1.corp.example with ESMTP id 4F2A1; Wed, 5 Nov 2026 07:12:44 +0000\nAuthentication-Results: mx1.corp.example;\n        spf=fail (corp.example does not designate 198.51.100.200 as permitted sender)\n        dkim=none; dmarc=fail action=quarantine\nFrom: "IT Support" <it-support@corp.example>\nSubject: Password expires today - action required' }],
  q: 'What is the IP address of the server that actually sent this email?', ph: 'x.x.x.x',
  accept: ["fae7833f06e0b1d7a347165c251458b16d9224a7b411f0245eeb2e471db3e00e"],
  hints: [`The From line is just text the sender typed.`, `The Received header added by your own mail server records who connected to it.`, `SPF failed for that same address.`],
  walk: `Your mail server recorded the connection from <b>198.51.100.200</b> (mailer-7731.example). SPF fails because corp.example does not authorize that IP, there is no DKIM signature, and DMARC fails. The From address was simply forged. Always trust the Received line added by your own server over anything above it.` });

L({ id: 'phish-03', cat: 'phish', diff: 2, title: 'The At Sign',
  brief: `This link starts with the bank's name, so it must be safe... right? Browsers treat everything before an @ in a URL as a username, not a host.`,
  blocks: [{ t: 'code', title: 'Link', text: 'https://northwindbank.example@203.0.113.80/login' }],
  q: 'Which host does the browser actually connect to?', ph: 'host',
  accept: ["37650fa10135f01f6b6e564fc8b65c04f9afa3e519f61f0ef95b243a09f2b826"],
  hints: [`URL format: scheme://user:password@host/path`, `What sits between @ and the first /?`, `The bank name is in the username position.`],
  walk: `In <span class="mono">https://user@host/path</span>, the part before <span class="mono">@</span> is credentials. The browser connects to <b>203.0.113.80</b>. Modern browsers warn about this, but many mail clients and chat apps still display the link as-is.` });

L({ id: 'phish-04', cat: 'phish', diff: 1, title: 'Double Extension',
  brief: `The attachment shows up as Statement_October.pdf in the mail client, with a long gap that hides the rest of the name.`,
  blocks: [{ t: 'code', title: 'Attachment file name (full)', text: 'Statement_October.pdf                                   .scr' }],
  q: 'What is the real file extension?', ph: 'extension',
  accept: ["07ac44e362f92f1f548cf0e6a20a3af1bc232b8c973a3115db09bbecfc86faae", "b53cf8517f72e398e30464bcc7581686f521b9096d34142e103ca863cc6d8a32"],
  hints: [`Only the last extension counts.`, `Spaces push the real extension out of view.`, `.scr is a Windows screensaver, which is an executable.`],
  walk: `The real extension is <b>.scr</b>, a Windows screensaver, which is just an executable. Padding with spaces (or a right-to-left override character) hides it. Defenses: show file extensions in the OS, and block executable attachment types at the mail gateway.` });

L({ id: 'phish-05', cat: 'phish', diff: 1, title: 'Spot the Odd One',
  brief: `Your manager asks you to train new staff. Which of these is NOT a phishing red flag?`,
  q: 'Pick the one that is NOT a red flag.',
  choices: ['Urgent pressure: "your account will be closed in 2 hours"', 'A link whose real destination differs from the text shown', 'An email you expected, from a known sender, whose links go to the company\'s usual domain', 'A request to pay an invoice to new bank details'],
  accept: ["2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6"],
  hints: [`Phishing relies on urgency, deception and unusual requests.`, `Three options describe tricks attackers use.`, `One describes normal, expected business email.`],
  walk: `<b>C</b> describes normal email. Urgency (A), mismatched links (B) and changed payment details (D) are the classic signs. Payment-detail changes deserve special attention: business email compromise causes more losses than any malware, and the fix is simple: verify by phone using a number you already know.` });

L({ id: 'phish-06', cat: 'phish', diff: 3, title: 'Lookalike Letters',
  brief: `The link text shows northwindbank.example, but one letter is a Cyrillic character that looks identical to a Latin one. Browsers convert such names to an ASCII form called punycode.`,
  blocks: [{ t: 'code', title: 'Link host (as displayed)', text: 'nоrthwindbank.example' }],
  q: 'What is the punycode (ASCII) form of the first label?', ph: 'xn--...',
  accept: ["d3d53bd89fa61b41066188374442fd739562c08b9bdfde594a72e445c42039b1", "34ecadb70187d8215031d97206a3389f9ba4fd5e73b6f0c93db560e9c4b9cc80"],
  hints: [`Internationalized domain names become ASCII labels starting with xn--`, `Only the label containing the non-Latin character changes.`, `Python: 'n\\u043erthwindbank'.encode('idna')`],
  walk: `The second letter is Cyrillic <span class="mono">о</span> (U+043E), so the label encodes to <b>xn--nrthwindbank-4fk</b>. This is a homograph attack. Browsers show punycode when they suspect mixing of scripts, and password managers refuse to autofill on the wrong domain: one more reason to use them.` });

/* ---------------- Crypto & passwords (extra) ---------------- */
L({ id: 'crypto-07', cat: 'crypto', diff: 1, title: 'Four Digits',
  brief: `A phone app protects payments with a 4-digit PIN and no lockout. How many possible PINs does an attacker have to try at most?`,
  q: 'Number of possible 4-digit PINs?', ph: 'a number',
  accept: ["39e5b4830d4d9c14db7368a95b65d5463ea3d09520373723430c03a5a453b5df", "28ec039832f5bc96c2be0eaee016dafeb7547ed76b510ed5a24d25b180493271", "351351c1e7d7cbcedb34405c258f092d440b3d3300997014beaf4106e9a1dfce", "d612e2bb51927b983a947836b2afcd1ec35ba4b9ca94d3026f7152e4ebfdd98d"],
  hints: [`Each position has 10 options (0 to 9).`, `Four positions.`, `10 x 10 x 10 x 10.`],
  walk: `<span class="mono">10^4 = <b>10,000</b></span>. A script tries them all in minutes, which is why lockouts and rate limits matter as much as the secret itself.` });

L({ id: 'crypto-08', cat: 'crypto', diff: 2, title: 'Store It Right',
  brief: `A startup asks how to store user passwords. Which option is correct?`,
  q: 'Pick the right way to store passwords.',
  choices: ['MD5 of the password', 'SHA-256 of the password', 'bcrypt (or Argon2) with a per-user salt and a work factor', 'Base64 of the password'],
  accept: ["2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6"],
  hints: [`Base64 is encoding: anyone can reverse it.`, `MD5 and SHA-256 are designed to be fast. For password storage, fast is bad.`, `You want a slow, salted, tunable function.`],
  walk: `<b>C</b>. bcrypt, scrypt and Argon2 are deliberately slow and salted, so cracking each guess costs real time. A GPU computes billions of MD5 or SHA-256 hashes per second, and Base64 is not protection at all.` });

L({ id: 'crypto-09', cat: 'crypto', diff: 2, title: 'How Long to Crack?',
  brief: `A password is exactly 8 lowercase letters (a to z). An attacker has a fast hash (no salt, no slow function) and tries 10 billion guesses per second. How long to try every possibility?`,
  q: 'Seconds to exhaust the whole keyspace (round to the nearest whole second)?', ph: 'seconds',
  accept: ["6f4b6612125fb3a0daecd2799dfd6c9c299424fd920f9b308110a2c1fbd8f443", "cbcfce46d9e416d68e0e1f98ec655059cb493c701d4132079cc8ff221d526ad2", "5ddd7252c4fd5046d1131050e9304cabc0e25e5196848fb2ab7d0f5c648e2fe8", "aaa3ff5bc9f33ee02ad9a7b789eb7fb2a282b96de308cf6806221f22dd2820ea"],
  hints: [`Keyspace = characters ^ length.`, `26^8 = 208,827,064,576.`, `Divide by 10,000,000,000.`],
  walk: `<span class="mono">26^8 = 208,827,064,576</span> combinations / 10^10 per second = about <b>21 seconds</b>. Add uppercase, digits and length (and use bcrypt) and the same attack takes centuries. Length beats complexity: each extra character multiplies the work.` });

/* ---------------- Linux (extra, evidence based) ---------------- */
L({ id: 'linux-07', cat: 'linux', diff: 1, title: 'The Special Bit',
  brief: `During a security audit you list a custom tool. Its permission string has an unusual letter where the owner's x normally is.`,
  blocks: [{ t: 'code', title: 'ls -l /usr/local/bin/backup', text: '-rwsr-xr-x 1 root root 18432 Oct  2 11:20 /usr/local/bin/backup' }],
  q: 'Which special permission bit is set?', ph: 'name',
  accept: ["15460c0b5edfae7f2ffbe4b0374123ca87016732fcaae48d6e0850f7cabe7943", "f59e1c02817722dd02d349301257623891b10386df25a3beaa7e825a5f736d35", "3917eb900f2c2fd413e593bb24c9217eab46e66a25b9a3da825780f6d77ae9d8", "b8090fbbee6b5c14f7aea67974c2a3178fd6d74b6d77ea4b769b4e19dc0db211", "d573d46f716bcc0498c7647e2a5a817026852b80cf86132e461d65ab585ce4c8", "043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89"],
  hints: [`Look at the 4th character.`, `An s in the owner triad means the program runs as its owner, not as you.`, `The owner here is root.`],
  walk: `The <span class="mono">s</span> in <span class="mono">rw<b>s</b></span> is the <b>SUID</b> bit: anyone who runs it runs it as root. Custom SUID-root programs are a top item in Linux audits: if the program can be tricked (writing files, running other commands), it becomes a path to root. Find them with <span class="mono">find / -perm -4000 -type f 2>/dev/null</span>.` });

L({ id: 'linux-08', cat: 'linux', diff: 1, title: 'Speak Octal',
  brief: `A config file with a database password should be readable and writable by its owner, readable by its group, and nothing for anyone else.`,
  blocks: [{ t: 'code', title: 'Desired permissions', text: 'rw-r-----' }],
  q: 'Which chmod number gives exactly rw-r-----?', ph: 'three digits',
  accept: ["3f1bb7c0da3c01e685edd592f3a3ca0b149a399d25b97c0da47118c24a39f59a", "d39f0369dcf28ae41948a2cfbe199deffa84745e7223ec88f88e76a92b4fee43", "4d0f22acca2916c54373a44724491392f8407fd3fd2c1bb5bcf629e298dd8d7f"],
  hints: [`r = 4, w = 2, x = 1. Add them per triad.`, `Owner rw- = 4 + 2.`, `Group r-- = 4, others --- = 0.`],
  walk: `Owner <span class="mono">rw-</span> = 6, group <span class="mono">r--</span> = 4, others <span class="mono">---</span> = 0, so <b>640</b>. World-readable config files (644) are one of the most common ways credentials leak on shared servers.` });

L({ id: 'linux-09', cat: 'linux', diff: 2, title: 'Listening to Everyone',
  brief: `A server should only expose SSH and HTTPS. One service is listening on all interfaces and is famous for having no password by default.`,
  blocks: [{ t: 'code', title: 'ss -tlnp', text: 'State  Local Address:Port  Process\nLISTEN 0.0.0.0:22          users:(("sshd",pid=812))\nLISTEN 0.0.0.0:443         users:(("nginx",pid=1101))\nLISTEN 127.0.0.1:5432      users:(("postgres",pid=990))\nLISTEN 0.0.0.0:6379        users:(("redis-server",pid=1350))\nLISTEN 127.0.0.53:53       users:(("systemd-resolve",pid=640))' }],
  q: 'Which process is exposed that should not be?', ph: 'process name',
  accept: ["abd47c1cb512aba9a7f6b7530c1d8a8d47a531433ebb7a23fe50a0f7002e3741", "34fb46c847bb9df96e5205a39d382f648a6e8dce1e014cd85b4ca6a88d88ed03", "48f599a9094eb9a4fcd2ff73dd158208d3a2e0d8769a32e3c3795fc8791a0a71"],
  hints: [`0.0.0.0 means every interface, including the public one. 127.0.0.1 means local only.`, `Remove sshd and nginx: they are expected.`, `Port 6379.`],
  walk: `<b>redis-server</b> listens on <span class="mono">0.0.0.0:6379</span>. Postgres and the DNS resolver are bound to localhost, which is correct. An unauthenticated Redis reachable from the internet is regularly abused. Fix: <span class="mono">bind 127.0.0.1</span> plus <span class="mono">requirepass</span> (or ACLs) and a firewall rule.` });

L({ id: 'linux-10', cat: 'linux', diff: 2, title: 'Two Roots',
  brief: `On Linux, the user with UID 0 is all-powerful, whatever its name. Someone added a second one.`,
  blocks: [{ t: 'code', title: '/etc/passwd (excerpt)', text: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nalice:x:1000:1000:Alice:/home/alice:/bin/bash\nsysmaint:x:0:0:maintenance:/var/lib/sysmaint:/bin/bash\ndeploy:x:1001:1001::/home/deploy:/bin/bash' }],
  q: 'Which account besides root has UID 0?', ph: 'username',
  accept: ["b73225b952562f61e95c73f85bba98ae051f151421f3dbecf720e2e67b9aeed4"],
  hints: [`Fields: name:password:UID:GID:comment:home:shell`, `Look at the third field of each line.`, `One more line has 0:0.`],
  walk: `<b>sysmaint</b> has UID 0 and GID 0: it is root under another name, a classic backdoor. Check with <span class="mono">awk -F: '$3 == 0' /etc/passwd</span>. Only root should ever match.` });
})();
