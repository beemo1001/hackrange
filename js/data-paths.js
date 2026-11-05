/* ============================================================
   HackRange data-paths.js
   Six guided roadmaps mixing arena labs, external labs and
   plain links. Steps track automatically from your progress.
   Step kinds: {a:'lab-id'} arena, {e:'ext-id'} external,
   {label, url, note} manual link, {note} pure advice step.
   ============================================================ */

(function () {
  HR.definePath({
    id: 'day-zero',
    title: 'Day Zero',
    tagline: 'From "what is a terminal" to your first five flags',
    level: 'Absolute beginner',
    hours: 'About 20 hours',
    steps: [
      { e: 'linuxjourney', note: 'Finish the command line and permissions sections. Vocabulary first, everything else later.' },
      { a: 'linux-01', note: 'Your first real diagnosis in our simulated terminal. Take your time, use the hints only if stuck twice.' },
      { a: 'linux-02', note: 'Second diagnosis: full disk. Same terminal, new failure mode.' },
      { e: 'otw-bandit', note: 'Play Bandit levels 0 to 10. Keep a personal cheat sheet file as you climb, you will keep it for years.' },
      { e: 'thm-room-linuxfundamentalspart1', note: 'A real Linux box over SSH. Everything you learned in our terminal, now for real.' },
      { a: 'enc-01', note: 'Warm up the decoder mindset. Base64 is everywhere in security work.' },
      { a: 'enc-02', note: 'Layers. The single most useful habit in payload work: peel, check, peel again.' },
      { a: 'enc-03', note: 'Hex. You will read hex for the rest of your career, starting today.' },
      { a: 'xss-01', note: 'Your first injection. Reflection plus execution, the core of web security.' },
      { e: 'xssgame', note: 'Google\'s XSS game, six browser puzzles, zero setup. You are ready for it now.' },
      { a: 'crypto-01', note: 'Learn to identify hashes on sight. Five minutes that pay off forever.' },
      { a: 'asm-01', note: 'Read your first assembly function. Five instructions, no fear.' }
    ]
  });

  HR.definePath({
    id: 'web-exploit',
    title: 'Web Exploitation',
    tagline: 'The full web attack surface, from reflection to deserialization',
    level: 'Beginner to intermediate',
    hours: 'About 60 hours',
    steps: [
      { e: 'ps-xss', note: 'The academy XSS path. Read a topic, solve its labs, then continue. Do not marathon the reading.' },
      { a: 'xss-01', note: 'Context first, payload second. Our arena makes the point in eight escalating labs.' },
      { a: 'xss-02', note: 'Blocklists block words, not behavior.' },
      { a: 'xss-03', note: 'Attribute breakouts: the interview favorite.' },
      { a: 'xss-05', note: 'JavaScript string contexts, where most hunters give up. Not you.' },
      { a: 'xss-08', note: 'The full gauntlet. Stack your bypasses like a professional.' },
      { e: 'ps-sql-injection', note: 'The SQLi path: UNION, blind, time based. The academy is the gold standard here.' },
      { a: 'sqli-01', note: 'Our query console takes over: you write the injection, you see the SQL form.' },
      { a: 'sqli-03', note: 'Column counting, the professional first move.' },
      { a: 'sqli-04', note: 'information_schema thinking. Ask the database to describe itself.' },
      { a: 'sqli-06', note: 'Blind extraction. Automate it with a ten line script, that is the real lesson.' },
      { e: 'sqli-labs', note: 'The classic 65 level ladder locally. Levels 1 to 20 this month.' },
      { e: 'ps-os-command-injection', note: 'Command injection path: short, sharp, complete.' },
      { a: 'cmdi-01', note: 'Separator thinking in our simulated shell.' },
      { a: 'cmdi-03', note: 'No spaces? No problem.' },
      { a: 'cmdi-05', note: 'Out of band exfiltration: create a channel when the response is blind.' },
      { e: 'juiceshop', note: 'A full modern vulnerable app. Chase the scoreboard: XSS, SQLi, and everything else you now know.' }
    ]
  });

  HR.definePath({
    id: 'bug-bounty',
    title: 'Bug Bounty Ready',
    tagline: 'From labs to your first real submission',
    level: 'Intermediate',
    hours: 'About 50 hours',
    steps: [
      { a: 'adapt-01', note: 'Bounty work is adaptation: read the evidence, find the context, fix the payload. Start here.' },
      { a: 'adapt-02', note: 'Fingerprint everything. Databases identify themselves if you let them talk.' },
      { e: 'ps-access-control', note: 'IDOR and access control: the highest finding per hour ratio in all of bug bounty.' },
      { e: 'ps-information-disclosure', note: 'Recon findings: low glamour, steady income.' },
      { e: 'ps-authentication', note: 'Authentication flaws affect everything downstream.' },
      { a: 'adapt-04', note: 'Learn to spot false positives before they burn your reputation. This lab is a real report review.' },
      { a: 'sqli-05', note: 'WAF era SQLi: filters are suggestions.' },
      { a: 'cmdi-05', note: 'Blind command injection through out of band channels.' },
      { e: 'ps-ssrf', note: 'SSRF: the cloud era super weapon.' },
      { e: 'ps-xxe', note: 'XXE still ships in real enterprise software today.' },
      { e: 'h101-ctf', note: 'HackerOne\'s own CTF. Solving it unlocks real private program invitations. This is the door.' },
      { a: 'adapt-07', note: 'Pipeline positioning: the final adaptation skill, WAF grade.' },
      { e: 'ps-logic-flaws', note: 'Business logic: no payloads, pure reasoning, top payouts.' },
      { e: 'dvwa', note: 'Run DVWA at Impossible security and study the FIXES. Knowing the defense makes your reports credible.' },
      { note: 'Graduate to BountyFlow: pick a target with a wide scope, read the policy twice, test only what is in scope, and write your first report like the professional this path built.' }
    ]
  });

  HR.definePath({
    id: 'linux-privesc',
    title: 'Linux and Privilege Escalation',
    tagline: 'Own the box, then own root',
    level: 'Beginner to advanced',
    hours: 'About 45 hours',
    steps: [
      { e: 'thm-room-linuxfundamentalspart2', note: 'File system, permissions, processes. The vocabulary of privesc.' },
      { a: 'linux-03', note: 'A dead nginx: status, journal, config test. The diagnosis ladder for every service.' },
      { a: 'linux-04', note: 'DNS bisection: name fails, IP works. Two commands, one answer.' },
      { e: 'thm-room-linuxfundamentalspart3', note: 'Cron, logs, packages: where real servers actually break.' },
      { e: 'otw-bandit', note: 'Bandit levels 11 to 34. Yes, all of them. This is where terminal fluency is built.' },
      { e: 'exploit-edu-nebula', note: 'The legendary privesc course: SUID, PATH abuse, cron trust. Every level is a real world misconfiguration.' },
      { a: 'linux-05', note: 'The cron trap: cron is not your shell. Fix it in our terminal.' },
      { a: 'linux-06', note: 'Inodes: the full disk that was not full. Senior level diagnosis.' },
      { e: 'rm-app-script', note: 'Scripting puzzles that build your automation muscles.' },
      { e: 'vh-kioptrix1', note: 'Your first full box: boot it, find it, root it. Old vulnerabilities, real satisfaction.' },
      { e: 'thm-room-kenobi', note: 'A guided modern privesc box: enumeration to root.' },
      { e: 'vh-metasploitable2', note: 'The classic kitchen sink box. Every service is a door.' }
    ]
  });

  HR.definePath({
    id: 'rev-eng',
    title: 'Reverse Engineering',
    tagline: 'Read binaries like the author intended you not to',
    level: 'Intermediate to advanced',
    hours: 'About 55 hours',
    steps: [
      { a: 'asm-01', note: 'Calling conventions first. rdi, rsi, rdx: the grammar of everything that follows.' },
      { a: 'asm-02', note: 'Recognize the silhouettes: strlen, memcpy, atoi.' },
      { a: 'asm-03', note: 'Spot the missing bounds check. The vulnerability silhouette.' },
      { e: 'pwn-college', note: 'The assembly course at pwn.college: lectures plus dojo. The best free RE foundation anywhere.' },
      { a: 'asm-04', note: 'XOR obfuscation: the malware writer\'s first name.' },
      { a: 'asm-05', note: 'Full argument mapping across the six registers.' },
      { e: 'crackmes', note: 'Solve five crackmes at difficulty 1 to 2 with Ghidra. Your brain adapts to reading disassembly, it just takes reps.' },
      { e: 'reversing-kr', note: 'The Korean classics. Dense, fair, famous.' },
      { a: 'asm-06', note: 'The password in the data section: constants are free intel.' },
      { e: 'pwnable-kr', note: 'Toddler\'s Bottle at pwnable.kr: fd, collision, bof. RE meets exploitation.' },
      { e: 'microcorruption', note: 'Embedded reversing in your browser. Pure thinking, no tooling.' },
      { e: 'rm-cracking', note: 'Root Me cracking challenges to finish the set.' }
    ]
  });

  HR.definePath({
    id: 'ctf-prep',
    title: 'CTF Prep',
    tagline: 'From solo practice to competing with a team',
    level: 'Beginner to intermediate',
    hours: 'About 35 hours',
    steps: [
      { e: 'picogym', note: 'Solve 20 picoGym challenges across categories. No time pressure, perfect reps.' },
      { e: 'ctflearn', note: 'Another 15 quick ones. Speed comes from pattern recognition, this builds the patterns.' },
      { a: 'crypto-02', note: 'Weak hash cracking: the most common easy CTF category.' },
      { a: 'crypto-03', note: 'XOR key reuse: the second most common.' },
      { a: 'crypto-04', note: 'Caesar and friends: classical ciphers appear in every beginner CTF.' },
      { e: 'cryptohack', note: 'The intro and data formats courses at CryptoHack. Free and brilliant.' },
      { a: 'enc-07', note: 'JWT archaeology: tokens are a CTF category of their own now.' },
      { a: 'cmdi-06', note: 'The full command injection gauntlet, CTF finale style.' },
      { e: '247ctf', note: 'A permanent CTF, no event pressure. Clear 10 challenges.' },
      { e: 'google-ctf', note: 'A past Beginner Quest: the quality bar for your next level.' },
      { e: 'ctftime', note: 'Register on CTFtime, find a beginner friendly event, join or form a team, and play your first live CTF.' }
    ]
  });
})();
