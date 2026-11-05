/* ============================================================
   HackRange data-directory.js
   Curated external practice labs, all free or free tier.
   Categories, difficulty, cost and setup are filterable.
   Pricing status is "at the time of writing": platforms change
   their free offerings, so treat cost labels as a guide.
   ============================================================ */

(function () {
  const D = (id, name, src, url, cat, diff, cost, setup, learn, tip) =>
    HR.defineDir({ id: id, name: name, src: src, url: url, cat: cat, diff: diff, cost: cost, setup: setup, learn: learn, tip: tip });

  /* ------------- PortSwigger Web Security Academy ------------- */
  const PS = 'https://portswigger.net/web-security/';
  const ps = (slug, name, cat, diff, learn, tip) =>
    D('ps-' + slug.replace(/\//g, '-'), name, 'PortSwigger Academy', PS + slug, cat, diff, 'free', 'burp', learn, tip);
  ps('sql-injection', 'SQL injection path', 'sqli', 'intermediate', 'UNION attacks, blind injection, second order injection, with guided labs at every step.', 'The single best free SQLi curriculum on the internet. Do the labs, not just the reading.');
  ps('xss', 'Cross-site scripting path', 'xss', 'beginner', 'Reflected, stored and DOM XSS, context analysis and exploitation, 40+ labs.', 'Start with reflected, finish every DOM lab. DOM XSS is where the jobs are.');
  ps('csrf', 'Cross-site request forgery path', 'web', 'beginner', 'CSRF tokens, SameSite cookies and the modern defenses, with labs.', 'Understanding SameSite deeply will also level up your XSS reports.');
  ps('ssrf', 'Server-side request forgery path', 'web', 'intermediate', 'SSRF against first party apps, allowlist bypasses, cloud metadata attacks.', 'The metadata lab is the exact technique behind real cloud breaches.');
  ps('xxe', 'XML external entity injection path', 'web', 'intermediate', 'XXE to read files, SSRF via XXE, and blind XXE exfiltration.', 'Learn the entity syntax by hand once, then the labs feel like puzzles.');
  ps('access-control', 'Access control vulnerabilities path', 'web', 'beginner', 'IDOR, privilege escalation, path based access control bypasses.', 'IDOR findings are the bread and butter of real bug bounty income.');
  ps('file-uploads', 'File upload vulnerabilities path', 'web', 'beginner', 'Uploading web shells, content type bypasses, path traversal on upload.', 'Try every lab without looking at solutions first, one is enough per session.');
  ps('os-command-injection', 'OS command injection path', 'cmdi', 'beginner', 'Command separators, blind injection, output channel thinking.', 'Pairs perfectly with our command injection arena category.');
  ps('information-disclosure', 'Information disclosure path', 'web', 'beginner', 'Error messages, debug endpoints, backup files, source disclosure.', 'Recon mindset in lab form. These findings are everywhere in the wild.');
  ps('authentication', 'Authentication path', 'web', 'intermediate', 'Logic flaws in login, password reset poisoning, brute force protections.', 'Every lab here maps to a real bounty class.');
  ps('logic-flaws', 'Business logic vulnerabilities path', 'web', 'intermediate', 'Flawed assumptions, price tampering, workflow bypasses.', 'Logic bugs need zero technical payloads and pay extremely well.');
  ps('oauth', 'OAuth authentication path', 'web', 'advanced', 'OAuth flow attacks, redirect_uri abuse, implicit grant flaws.', 'Sign in with X bugs are constant real world findings.');
  ps('websockets', 'WebSockets path', 'web', 'intermediate', 'Cross-site WebSocket hijacking and WebSocket message manipulation.', 'Small path, rarely practiced, great differentiator.');
  ps('cors', 'CORS path', 'web', 'intermediate', 'CORS misconfiguration, origin reflection, trust relationship abuse.', 'Check every lab against your own bug bounty targets afterwards.');
  ps('clickjacking', 'Clickjacking path', 'web', 'beginner', 'Frame buster bypasses and UI redressing.', 'Short and satisfying. Bring a second browser window.');
  ps('dom-based', 'DOM-based vulnerabilities path', 'web', 'intermediate', 'DOM XSS via sources and sinks, DOM Invader driven labs.', 'Install DOM Invader from the BApp store first, it teaches while it scans.');
  ps('path-traversal', 'Path traversal path', 'web', 'beginner', 'Reading arbitrary files, bypassing filters, absolute vs relative paths.', 'Classic technique that never died on real servers.');
  ps('deserialization', 'Insecure deserialization path', 'web', 'advanced', 'PHP, Ruby, Java and Python gadget chains, phar deserialization.', 'Hardest path here. Do the language you know best first.');
  ps('graphql', 'GraphQL API vulnerabilities path', 'web', 'intermediate', 'Introspection abuse, CSRF over GraphQL, disclosure via GraphQL.', 'GraphQL is spreading fast in real targets, few hunters know it.');
  ps('race-conditions', 'Race conditions path', 'web', 'advanced', 'Limit race conditions, single endpoint races, turbo intruder.', 'The most modern topic in the academy, few competitors practice it.');
  ps('api-testing', 'API testing path', 'web', 'intermediate', 'REST and GraphQL API recon, hidden endpoints, mass assignment.', 'Mass assignment alone will pay for your laptop eventually.');
  ps('request-smuggling', 'HTTP request smuggling path', 'web', 'advanced', 'CL.TE, TE.CL and TE.TE desync attacks.', 'Deep protocol knowledge, brutal but famous bug class.');
  ps('host-header', 'HTTP Host header attacks path', 'web', 'intermediate', 'Host header password reset poisoning and cache based attacks.', 'Tiny topic, huge interview value.');
  ps('prototype-pollution', 'Prototype pollution path', 'web', 'advanced', 'Client and server side prototype pollution, gadget chains.', 'JavaScript internals knowledge that transfers to Node bug hunting.');
  ps('nosql-injection', 'NoSQL injection path', 'sqli', 'intermediate', 'MongoDB operator injection and syntax bypasses.', 'Do this right after the SQL path, the mindset transfers.');
  ps('web-cache-poisoning', 'Web cache poisoning path', 'web', 'advanced', 'Unkeyed inputs, cache key manipulation, cache deception.', 'Elite tier. The labs are famously tricky, take notes.');
  ps('llm-attacks', 'Web LLM attacks path', 'web', 'beginner', 'Prompt injection, LLM API abuse, training data poisoning.', 'Brand new attack surface, be early.');

  /* ------------- OverTheWire wargames ------------- */
  const OTW = 'https://overthewire.org/wargames/';
  const otw = (slug, name, cat, diff, learn, tip) =>
    D('otw-' + slug, name, 'OverTheWire', OTW + slug, cat, diff, 'free', 'ssh', learn, tip);
  otw('bandit', 'Bandit (levels 0 to 34)', 'linux', 'beginner', 'The absolute classic: pure Linux command line survival from level 0 to root of the basics.', 'If you only do one thing on this list, do Bandit. Keep a personal cheat sheet as you climb.');
  otw('natas', 'Natas (web security)', 'web', 'intermediate', 'Server side web security, one clever level at a time, no tools but a browser.', 'Every level teaches one web concept. Try hard before walkthroughs.');
  otw('leviathan', 'Leviathan', 'linux', 'beginner', 'Simple data hacking, privilege and file permission puzzles.', 'A gentle step up from Bandit.');
  otw('krypton', 'Krypton', 'crypto', 'beginner', 'Classical cryptography puzzles from Caesar onwards.', 'Perfect companion to our crypto arena labs.');
  otw('narnia', 'Narnia', 'pwn', 'intermediate', 'First binary exploitation: stack overflows in a guided environment.', 'Read the source, then the disassembly, then exploit.');
  otw('behemoth', 'Behemoth', 'pwn', 'intermediate', 'Escalating privilege escalation and exploitation challenges.', 'Expect to get stuck, that is the curriculum.');
  otw('utumno', 'Utumno', 'pwn', 'advanced', 'Harder exploitation with less hand holding.', 'Only after Narnia and Behemoth.');
  otw('maze', 'Maze', 'pwn', 'advanced', 'A maze of exploitation challenges requiring creativity.', 'Bring everything you learned from the earlier games.');
  otw('vortex', 'Vortex', 'pwn', 'advanced', 'Low level exploitation and protocol puzzles.', 'Community favorite for building real intuition.');
  otw('semtex', 'Semtex', 'pwn', 'advanced', 'Exploitation with heavy obfuscation.', 'The black belt of OverTheWire.');
  otw('drifter', 'Drifter', 'rev', 'advanced', 'Reverse engineering and exploitation hybrids.', 'Good bridge into crackme practice.');
  otw('manpage', 'Manpage', 'linux', 'intermediate', 'Learn the manual by being forced to read it.', 'Hilarious and genuinely useful.');

  /* ------------- TryHackMe (free rooms) ------------- */
  const THM = 'https://tryhackme.com/';
  const thm = (slug, name, cat, diff, learn, tip) =>
    D('thm-' + slug.replace(/\//g, '-'), name, 'TryHackMe', THM + slug, cat, diff, 'free', 'vpn', learn, tip);
  thm('room/linuxfundamentalspart1', 'Linux Fundamentals 1', 'linux', 'beginner', 'First steps in a real Linux terminal over SSH.', 'Free room. Perfect day one companion to Bandit.');
  thm('room/linuxfundamentalspart2', 'Linux Fundamentals 2', 'linux', 'beginner', 'File system, permissions and processes.', 'Free room. Do it alongside our Linux diagnosis labs.');
  thm('room/linuxfundamentalspart3', 'Linux Fundamentals 3', 'linux', 'beginner', 'Cron, packages, logs and the things that break servers.', 'Free room. The cron content pairs with our cron trap lab.');
  thm('room/windowsfundamentals1xbx', 'Windows Fundamentals 1', 'blue', 'beginner', 'Windows desktop, file system and the registry basics.', 'Free room. Windows knowledge doubles your target pool.');
  thm('room/windowsfundamentals2x0x', 'Windows Fundamentals 2', 'blue', 'beginner', 'System configuration, users and UAC.', 'Free room.');
  thm('room/windowsfundamentals3xqx', 'Windows Fundamentals 3', 'blue', 'beginner', 'Windows maintenance and administration.', 'Free room.');
  thm('room/introtooffensivesecurity', 'Intro to Offensive Security', 'web', 'beginner', 'A guided first hack: recon, exploit, capture a flag.', 'Free room. The perfect first 30 minutes of anyone training.');
  thm('room/ohshint', 'OhSINT', 'ctf', 'beginner', 'OSINT from a single image file to a full identity trail.', 'Free room. Eye opening how much a picture leaks.');
  thm('room/googledorking', 'Google Dorking', 'web', 'beginner', 'Search operators as recon weapons.', 'Free room. Dorks feed directly into bug bounty recon.');
  thm('room/vulnversity', 'Vulnversity', 'web', 'beginner', 'Recon, enumeration and exploitation of a vulnerable box.', 'Free room. Your first full box.');
  thm('room/bountyhunter', 'Bounty Hacker', 'linux', 'beginner', 'A cowboy themed box: FTP, SSH and privesc.', 'Free room. Named after what you want to become.');
  thm('room/blue', 'Blue', 'blue', 'beginner', 'Metasploitable and EternalBlue, the famous SMB exploit.', 'Free room. Understand a historic exploit hands on.');
  thm('room/kenobi', 'Kenobi', 'linux', 'intermediate', 'SMB enumeration, path manipulation and privesc via misconfigured binaries.', 'Free room. Classic privesc patterns.');
  thm('room/shodan', 'Shodan', 'ctf', 'beginner', 'The search engine for internet connected devices.', 'Free room (Shodan account needed for full features).');
  thm('path/outline/presecurity', 'Pre Security learning path', 'ctf', 'beginner', 'Networking, web basics and Linux primer in one path.', 'Free path. The official on ramp to everything else.');

  /* ------------- picoCTF ------------- */
  D('picoctf', 'picoCTF platform', 'picoCTF', 'https://picoctf.org/', 'ctf', 'beginner', 'free', 'browser', 'The friendliest CTF on earth, built by Carnegie Mellon for students.', 'Make an account, start with the easiest challenges, never look up answers before trying 30 minutes.');
  D('picogym', 'picoGym practice area', 'picoCTF', 'https://play.picoctf.org/practice', 'ctf', 'beginner', 'free', 'account', 'Every past picoCTF challenge in permanent practice mode.', 'The single best zero pressure practice environment for beginners.');

  /* ------------- Hack The Box ------------- */
  D('htb-main', 'Hack The Box free tier', 'Hack TheBox', 'https://www.hackthebox.com/', 'ctf', 'intermediate', 'free-tier', 'vpn', 'Retired machines and starting point boxes on the free tier, a few active machines.', 'The Starting Point series is free and brilliantly guided. Machines rotate, retired boxes need VIP for some features.');
  D('htb-academy', 'HTB Academy free modules', 'HTB Academy', 'https://academy.hackthebox.com/', 'ctf', 'beginner', 'free-tier', 'account', 'University grade modules, several completely free including intro tiers.', 'The Introduction to Web Applications module is free and outstanding.');

  /* ------------- Vulnerable web apps (local install) ------------- */
  D('juiceshop', 'OWASP Juice Shop', 'OWASP', 'https://owasp.org/www-project-juice-shop/', 'web', 'beginner', 'free', 'download', 'A modern vulnerable shop covering the entire OWASP Top 10 plus wilder bugs, with a scoreboard.', 'Run it in Docker, open the scoreboard in a second tab, and chase challenges in order of difficulty.');
  D('dvwa', 'DVWA (Damn Vulnerable Web Application)', 'DVWA', 'https://dvwa.co.uk/', 'web', 'beginner', 'free', 'download', 'The classic PHP vulnerable app with LOW to IMPOSSIBLE security levels.', 'Set security to Impossible after solving each level to learn what the FIX looks like.');
  D('bwapp', 'bWAPP', 'bWAPP', 'http://itsecgames.com/', 'web', 'beginner', 'free', 'download', 'Over 100 web bug classes in one deliberately broken PHP app.', 'The A1 to A10 menu is basically an OWASP checklist with practice.');
  D('webgoat', 'OWASP WebGoat', 'OWASP', 'https://owasp.org/www-project-webgoat/', 'web', 'beginner', 'free', 'download', 'A teaching app: every lesson explains the vulnerability before you exploit it.', 'Great for self study, the lesson text is genuinely good.');
  D('mutillidae', 'Mutillidae II', 'WebPwnized', 'https://github.com/webpwnized/mutillidae', 'web', 'beginner', 'free', 'download', 'Vulnerable app with hints built into every page.', 'The hint system makes it beginner friendly without walkthroughs.');
  D('xvwa', 'XVWA (Xtreme Vulnerable Web App)', 'XVWA', 'https://github.com/s4n7h0/xvwa', 'web', 'intermediate', 'free', 'download', 'A minimal vulnerable app with no hints, good after DVWA.', 'The lack of guidance is the feature.');
  D('sqli-labs', 'SQLi labs (Audi-1)', 'Audi-1', 'https://github.com/Audi-1/sqli-labs', 'sqli', 'intermediate', 'free', 'download', 'The classic 65 level SQL injection ladder from basic to stacked queries.', 'Levels 1 to 10 alone will teach you more SQLi than most courses.');
  D('shepherd', 'OWASP Security Shepherd', 'OWASP', 'https://owasp.org/www-project-security-shepherd/', 'web', 'intermediate', 'free', 'download', 'Gamified secure coding and exploitation training with levels and rankings.', 'Good classroom tool, works well for clubs.');
  D('dvna', 'Damn Vulnerable Node Application', 'DVNA', 'https://github.com/cr0hn/dvna', 'web', 'intermediate', 'free', 'download', 'Node.js vulnerable app for practicing modern stack bugs.', 'JavaScript everywhere: prototype pollution territory.');
  D('railsgoat', 'OWASP RailsGoat', 'OWASP', 'https://github.com/OWASP/railsgoat', 'web', 'intermediate', 'free', 'download', 'A Ruby on Rails vulnerable app covering Rails specific pitfalls.', 'Rare chance to attack a well structured framework.');
  D('nodegoat', 'OWASP NodeGoat', 'OWASP', 'https://github.com/OWASP/NodeGoat', 'web', 'intermediate', 'free', 'download', 'Node.js specific vulnerabilities with a tutorial mode.', 'Pairs with the PortSwigger prototype pollution path.');
  D('dvga', 'Damn Vulnerable GraphQL Application', 'DVGA', 'https://github.com/dolevf/Damn-Vulnerable-GraphQL-Application', 'web', 'advanced', 'free', 'download', 'Deliberately vulnerable GraphQL app: introspection, mutations, injection.', 'Do the PortSwigger GraphQL path first, then live here.');

  /* ------------- Root Me ------------- */
  const RM = 'https://www.root-me.org/en/Challenges/';
  const rm = (slug, name, cat, diff, learn, tip) =>
    D('rm-' + slug.toLowerCase().replace(/\//g, '-'), name, 'Root Me', RM + slug, cat, diff, 'free-tier', 'browser', learn, tip);
  rm('Web', 'Web challenges', 'web', 'intermediate', 'Hundreds of web challenges from basic injections to advanced logic bugs.', 'Free to play everything, some quality of life features need an account.');
  rm('Web-Server', 'Web server challenges', 'web', 'intermediate', 'Server side bugs: upload, SSRF, config mistakes.', 'The two web sections combined are a full curriculum.');
  rm('App-Script', 'App script challenges', 'linux', 'intermediate', 'Scripting puzzles: bash, Python and friends against real problems.', 'Great for building automation muscles.');
  rm('App-Systeme', 'App system challenges', 'rev', 'advanced', 'Binary analysis and low level puzzles.', 'Harder than Narnia, fair but demanding.');
  rm('Cracking', 'Cracking challenges', 'rev', 'intermediate', 'Reverse engineering and keygen writing.', 'Natural continuation of our assembly arena labs.');
  rm('Network', 'Network challenges', 'blue', 'beginner', 'Packet analysis, sniffing, protocol puzzles.', 'Wireshark fluency is a career skill.');
  rm('Steganography', 'Steganography challenges', 'crypto', 'intermediate', 'Hidden data in images, audio and files.', 'Start with the easiest few, tooling matters more than theory.');
  rm('Realist', 'Realist challenges', 'ctf', 'advanced', 'Scenario based challenges modeled on real incidents.', 'The closest Root Me gets to real engagements.');

  /* ------------- Cryptography ------------- */
  D('cryptohack', 'CryptoHack', 'CryptoHack', 'https://cryptohack.org/', 'crypto', 'intermediate', 'free-tier', 'account', 'Applied cryptography challenges: encoding, XOR, RSA, AES, math attacks.', 'The intro courses are free and superb. Math fear is optional, curiosity mandatory.');
  D('cryptopals', 'Cryptopals crypto challenges', 'Matasano', 'https://cryptopals.com/', 'crypto', 'advanced', 'free', 'browser', 'The legendary 8 set challenge series used to train real security engineers.', 'Set 1 is a rite of passage. Do the code yourself, no copy pasting solutions.');
  D('mysterytwister', 'MysteryTwister C3', 'MTC3', 'https://www.mysterytwister.org/', 'crypto', 'intermediate', 'free-tier', 'account', 'A global crypto cipher contest with challenges from school level to research level.', 'Nice difficulty ladder, the easy section is genuinely easy.');

  /* ------------- Reverse engineering + pwn ------------- */
  D('crackmes', 'crackmes.one', 'crackmes.one', 'https://crackmes.one/', 'rev', 'intermediate', 'free', 'download', 'Thousands of user submitted crackmes ranked by difficulty, license key puzzles included.', 'Sort by difficulty 1 to 2, solve ten, then climb. Ghidra is your friend.');
  D('reversing-kr', 'Reversing.kr', 'Reversing.kr', 'http://www.reversing.kr/', 'rev', 'advanced', 'free', 'download', 'Old school Korean reversing challenges, short list but each one is dense.', 'A badge of honor among reversers to finish the set.');
  D('pwnable-kr', 'pwnable.kr', 'pwnable.kr', 'http://www.pwnable.kr/', 'pwn', 'intermediate', 'free-tier', 'ssh', 'Toddler\'s Bottle is the friendliest pwn curriculum: fd, collision, bof, passcode.', 'Solve fd and bof and you already understand more memory corruption than most applicants.');
  D('pwnable-tw', 'pwnable.tw', 'pwnable.tw', 'https://pwnable.tw/', 'pwn', 'advanced', 'free-tier', 'ssh', 'Harder pwn challenges: seccomp, heap, kernel intro.', 'The natural next step after pwnable.kr Toddler\'s Bottle.');
  D('247ctf', '247CTF', '247CTF', 'https://247ctf.com/', 'ctf', 'intermediate', 'free-tier', 'browser', 'A permanent CTF: solve at your own pace, no event pressure, wide category coverage.', 'Free access with some rate limits per day, which honestly enforces healthy study breaks.');
  D('microcorruption', 'Microcorruption', 'Microcorruption', 'https://microcorruption.com', 'pwn', 'advanced', 'free', 'browser', 'Embedded security CTF: reverse engineer and exploit lock firmware, all in the browser.', 'No setup, pure thinking. Teaches assembly level exploitation beautifully.');
  D('exploit-edu-phoenix', 'Exploit Education: Phoenix', 'Exploit-Education', 'https://exploit-education.net/phoenix/', 'pwn', 'intermediate', 'free', 'ssh', 'Stack, heap, format string and network exploitation levels in one place.', 'The intro material is exceptional, read it all.');
  D('exploit-edu-nebula', 'Exploit Education: Nebula', 'Exploit-Education', 'https://exploit-education.net/nebula/', 'linux', 'intermediate', 'free', 'ssh', 'Privilege escalation on Linux: SUID, PATH abuse, cron, variables.', 'The absolute best free privesc curriculum. Do it before any privesc room.');
  D('smashthestack', 'SmashTheStack (io)', 'SmashTheStack', 'https://www.smashthestack.org/', 'pwn', 'advanced', 'free', 'ssh', 'The io wargame: long running exploitation levels with a strong community.', 'Level 01 to 10 teaches more than a semester.');
  D('pwn-college', 'pwn.college', 'pwn.college', 'https://pwn.college/', 'pwn', 'intermediate', 'free', 'browser', 'University lectures plus dojo exercises: assembly, reverse engineering, exploitation, ROP.', 'Free accounts get full dojo access. The ROP section is world class.');

  /* ------------- Blue team ------------- */
  D('letsdefend', 'LetsDefend', 'LetsDefend', 'https://letsdefend.io/', 'blue', 'beginner', 'free-tier', 'browser', 'A simulated SOC: investigate alerts, triage, respond, all against realistic attacks.', 'The free tier includes a daily alert. Analyst skills make you a better attacker.');
  D('cyberdefenders', 'CyberDefenders', 'CyberDefenders', 'https://cyberdefenders.org/', 'blue', 'intermediate', 'free-tier', 'browser', 'Blue team labs: forensics, network analysis, malware triage.', 'Several labs are fully free, filter by difficulty and start.');
  D('blueteamlabs', 'Blue Team Labs Online', 'BTLO', 'https://blueteamlabs.online/', 'blue', 'intermediate', 'free-tier', 'browser', 'Investigation challenges: phishing analysis, memory forensics, log analysis.', 'Free tier rotates available investigations.');
  D('malware-traffic', 'Malware Traffic Analysis', 'MTA', 'https://www.malware-traffic-analysis.net/', 'blue', 'intermediate', 'free', 'download', 'Real (defanged) malware PCAPs with exercises: the closest thing to incident response practice.', 'Download the exercise PCAPs and answer the questions in the blog posts.');

  /* ------------- Misc platforms ------------- */
  D('linuxjourney', 'Linux Journey', 'Linux Journey', 'https://linuxjourney.com/', 'linux', 'beginner', 'free', 'browser', 'Bite sized Linux fundamentals from shell basics to permissions and networking.', 'Finish it in a weekend, it makes every other lab on this list easier.');
  D('linuxupskill', 'Linux Upskill Challenge', 'LUC', 'https://linuxupskillchallenge.org/', 'linux', 'beginner', 'free', 'account', 'A 20 day guided course in running a real Linux server.', 'Free, one email per day, genuinely transforms beginners.');
  D('hackthissite', 'Hack This Site', 'HTS', 'https://www.hackthissite.org/', 'web', 'beginner', 'free', 'browser', 'Old school, legally sanctioned hacking missions: basic to realistic web missions.', 'The realistic missions simulate attacking full fake companies. Community since 2003.');
  D('xssgame', 'Google XSS Game', 'Google', 'https://xss-game.appspot.com/', 'xss', 'beginner', 'free', 'browser', 'Six tight XSS puzzles by Google, in browser, no setup.', 'The perfect warm up before our XSS arena category.');
  D('gruyere', 'Google Gruyere', 'Google', 'https://google-gruyere.appspot.com/', 'web', 'beginner', 'free', 'browser', 'A cheese themed vulnerable app covering XSS, XSRF, information disclosure and more.', 'Google quality explanations attached to each exploit.');
  D('h101-ctf', 'Hacker101 CTF', 'HackerOne', 'https://ctf.hacker101.com/', 'web', 'intermediate', 'free', 'browser', 'HackerOne\'s own CTF: realistic targets and the same classes of bugs their bounty programs pay for.', 'Solving challenges here unlocks actual private HackerOne invitations. Career value: enormous.');
  D('bugcrowd-university', 'Bugcrowd University', 'Bugcrowd', 'https://www.bugcrowd.com/hackers/bugcrowd-university/', 'web', 'beginner', 'free', 'browser', 'Free video courses on web vulnerabilities, recon and methodology by working researchers.', 'Watch alongside our SecLab lessons, then practice in our arena.');
  D('roppers', 'Roppers Academy', 'Roppers', 'https://www.roppers.academy/', 'ctf', 'beginner', 'free', 'account', 'Free structured courses: Computing Fundamentals, Beginner Pwn, CTF Fundamentals.', 'The no stress on ramp for people who feel behind.');
  D('ctflearn', 'CTFlearn', 'CTFlearn', 'https://ctflearn.com/', 'ctf', 'beginner', 'free', 'browser', 'A community CTF platform with hundreds of small challenges in every category.', 'Sort by easiest, clear 20, build confidence fast.');
  D('w3challs', 'W3Challs', 'W3Challs', 'https://w3challs.com/', 'ctf', 'intermediate', 'free-tier', 'browser', 'Challenges across web, crypto, network, stego and programming with a nice difficulty curve.', 'Free accounts can solve everything, some challenges need points to unlock.');
  D('ringzer0', 'RingZer0 CTF', 'RingZer0Team', 'https://ringzer0team.com/', 'ctf', 'intermediate', 'free', 'account', 'Hundreds of challenges, famous for stego, coding and web puzzle variety.', 'The stego section quietly builds forensic instincts.');
  D('webhacking-kr', 'webhacking.kr', 'webhacking.kr', 'https://webhacking.kr/', 'web', 'advanced', 'free', 'account', 'Korean web hacking challenge site, old, brutal and respected.', 'Challenge 1 alone has defeated thousands. Persistence required.');
  D('hackthis', 'HackThis!!', 'HackThis', 'https://www.hackthis.co.uk/', 'web', 'beginner', 'free', 'browser', 'Layered web security levels: basic through to quite devious application logic.', 'Good middle ground between DVWA and Root Me.');
  D('hacksplaining', 'Hacksplaining', 'Hacksplaining', 'https://www.hacksplaining.com/', 'web', 'beginner', 'free', 'browser', 'Interactive animated lessons: XSS, SQLi, CSRF, RCE with step by step attack visualizations.', 'Each lesson ends with the exact code fix, rare and valuable.');
  D('pentest-ground', 'Pentest Ground', 'Pentest-Ground', 'https://pentest-ground.com/', 'web', 'beginner', 'free', 'browser', 'Free vulnerable training environments: XSS playgrounds, SQLi labs, command injection arenas.', 'No signup needed, pick a lab and start firing payloads.');
  D('holidayhack', 'SANS Holiday Hack Challenge', 'SANS', 'https://www.holidayhackchallenge.com/', 'ctf', 'intermediate', 'free', 'browser', 'The annual SANS Christmas themed CTF: story driven, free forever, archives online.', 'Start with a past year. The story keeps you going when the challenges get hard.');
  D('google-ctf', 'Google CTF Beginner Quests', 'Google', 'https://capturetheflag.withgoogle.com/', 'ctf', 'intermediate', 'free', 'browser', 'Past Google CTF beginner quests remain playable: high quality, production values off the charts.', 'The beginner quests are exactly the right step up from picoCTF.');
  D('ctftime', 'CTFtime', 'CTFtime', 'https://ctftime.org/', 'ctf', 'mixed', 'free', 'browser', 'Not a lab: the calendar and ranking of every CTF on earth, with writeup archives for every event.', 'Register, find a beginner friendly jeopardy style event, join a team, play. That is how you level up.');

  /* ------------- VulnHub boxes ------------- */
  const VH = 'https://www.vulnhub.com/';
  D('vulnhub', 'VulnHub (platform)', 'VulnHub', VH, 'linux', 'intermediate', 'free', 'download', 'Thousands of community built vulnerable VMs: boot, scan, root, learn.', 'Read the description for the intended difficulty, and never run these bridged to your home LAN.');
  D('vh-metasploitable2', 'Metasploitable 2', 'VulnHub', VH + 'entry/metasploitable-2,29/', 'linux', 'beginner', 'free', 'download', 'The deliberately vulnerable Ubuntu server: the standard first box for a decade.', 'Every service on it is exploitable. Nmap first, always nmap first.');
  D('vh-kioptrix1', 'Kioptrix: Level 1', 'VulnHub', VH + 'entry/kioptrix-level-1-1,1/', 'linux', 'beginner', 'free', 'download', 'A legendary beginner box: old school vulnerabilities, clean learning curve.', 'Boot it, find it on the network, root it, feel the addiction begin.');
  D('vh-mrrobot', 'Mr-Robot: 1', 'VulnHub', VH + 'entry/mr-robot-1,151/', 'web', 'intermediate', 'free', 'download', 'A Mr Robot themed box: web bugs, hidden keys and three flags.', 'The show references make it fun, the hash cracking makes it real.');

  /* ------------- Mobile ------------- */
  D('diva-android', 'DIVA Android', 'Payatu', 'https://github.com/payatu/diva-android', 'mobile', 'intermediate', 'free', 'download', 'A deliberately vulnerable Android app: 13 lessons from insecure storage to input validation.', 'You need Android Studio or a device. Mobile skills are rare and paid accordingly.');
  D('insecurebank', 'InsecureBankv2', 'Dinesh Shetty', 'https://github.com/dineshshetty/Android-InsecureBankv2', 'mobile', 'advanced', 'free', 'download', 'A vulnerable Android banking app: backup leaks, hardcoding, intent attacks.', 'Pairs perfectly with the DIVA app for a complete mobile curriculum.');

  /* ------------- API + OSINT ------------- */
  D('crapi', 'OWASP crAPI', 'OWASP', 'https://github.com/OWASP/crAPI', 'web', 'intermediate', 'free', 'download', 'Completely Ridiculous API: a modern vulnerable API covering the OWASP API Top 10 with a realistic flow.', 'The best free API hacking target. Do it right after the PortSwigger API testing path.');
  D('tracelabs', 'Trace Labs Search Party CTFs', 'Trace Labs', 'https://www.tracelabs.org/', 'ctf', 'intermediate', 'free', 'browser', 'OSINT competitions where teams locate real missing persons using open source intelligence.', 'Ethically meaningful and the OSINT skills transfer directly to recon work.');
})();
