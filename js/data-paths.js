/* ============================================================
   HackGrid data-paths.js
   Guided roadmaps mixing HackGrid labs ({a}) and external
   platforms ({e}). Steps tick themselves off from progress.
   ============================================================ */
(function () {
  HR.definePath({ id: 'day-zero', title: 'Day Zero', level: 'Absolute beginner', hours: '15 hours',
    tagline: 'From "what is a terminal" to reading your first logs and links like a pro.',
    steps: [
      { e: 'linuxjourney', note: 'Command line and permissions sections. Vocabulary first.' },
      { a: 'linux-08', note: 'Permissions as numbers. You will use this weekly.' },
      { a: 'linux-01', note: 'Your first diagnosis in a live terminal.' },
      { a: 'linux-02', note: 'A full disk. Same terminal, new failure.' },
      { a: 'net-01', note: 'Subnets without fear.' },
      { a: 'net-03', note: 'Attack surface in one comparison.' },
      { a: 'web-01', note: 'Status codes: the language of the web.' },
      { a: 'enc-01', note: 'Base64 is everywhere in security.' },
      { a: 'crypto-07', note: 'Why lockouts matter.' },
      { a: 'phish-01', note: 'Read domains right to left.' },
      { a: 'phish-05', note: 'The red flags everyone should know.' },
      { e: 'otw-bandit', note: 'Bandit levels 0 to 10 on a real server. Keep notes as you go.' }
    ] });

  HR.definePath({ id: 'web-foundations', title: 'Web Security Foundations', level: 'Beginner', hours: '40 hours',
    tagline: 'HTTP, cookies, origins and the bug classes behind most real findings.',
    steps: [
      { a: 'web-01' }, { a: 'web-02' }, { a: 'web-05' }, { a: 'web-07' },
      { a: 'enc-04', note: 'URL encoding layers, the daily bread of web testing.' },
      { a: 'code-01', note: 'SQL injection from the defender side.' },
      { e: 'ps-sql-injection', note: 'Now break it for real in PortSwigger\'s free labs.' },
      { a: 'code-02', note: 'XSS from the defender side.' },
      { e: 'ps-xss', note: 'Reflected, stored and DOM XSS labs. Finish every DOM lab.' },
      { a: 'web-09' }, { a: 'code-04' },
      { e: 'ps-access-control', note: 'IDOR and privilege escalation, the most paid bug class.' },
      { a: 'web-03' }, { a: 'web-08' }, { a: 'code-03' },
      { e: 'juiceshop', note: 'A full vulnerable app. Chase the scoreboard.' }
    ] });

  HR.definePath({ id: 'bug-bounty', title: 'Bug Bounty Ready', level: 'Intermediate', hours: '50 hours',
    tagline: 'Scope, recon, high-value bug classes and payloads that work in the wild.',
    steps: [
      { a: 'web-04', note: 'Scope first. Always.' },
      { a: 'net-06', note: 'Recon finds what scanners miss.' },
      { a: 'web-06' }, { a: 'code-10' }, { a: 'code-09' },
      { e: 'ps-logic-flaws', note: 'Logic bugs need no payloads and pay well.' },
      { e: 'ps-authentication' },
      { a: 'adapt-01', note: 'When a payload fails, diagnose instead of guessing.' },
      { a: 'adapt-02' }, { a: 'adapt-04' }, { a: 'adapt-07' },
      { e: 'h101-ctf', note: 'Hacker101 CTF flags can earn private program invites.' },
      { e: 'ps-ssrf' }
    ] });

  HR.definePath({ id: 'soc-analyst', title: 'SOC Analyst', level: 'Beginner to intermediate', hours: '35 hours',
    tagline: 'Find the attacker in the logs, build the timeline, write the report.',
    steps: [
      { a: 'logs-01' }, { a: 'logs-02' }, { a: 'logs-03' }, { a: 'logs-04' },
      { a: 'net-08' }, { a: 'phish-02' },
      { a: 'logs-05', note: 'Timelines are the backbone of every report.' },
      { a: 'logs-06' }, { a: 'logs-07' }, { a: 'logs-08' },
      { e: 'letsdefend', note: 'A simulated SOC with real alerts to triage.' },
      { e: 'blueteamlabs' },
      { e: 'bots', note: 'Millions of events, one intrusion. Bring Splunk skills.' }
    ] });

  HR.definePath({ id: 'forensics', title: 'Forensics & Incident Response', level: 'Intermediate', hours: '30 hours',
    tagline: 'Make files, timestamps, memory of the shell and DNS tell the story.',
    steps: [
      { a: 'for-01' }, { a: 'for-02' }, { a: 'for-03' }, { a: 'for-04' },
      { a: 'for-07' }, { a: 'for-05' }, { a: 'for-06' },
      { e: 'malware-traffic', note: 'Real infection traffic with answers.' },
      { e: 'wireshark-samples' },
      { e: 'cyberdefenders', note: 'Blue team CTF challenges with real artifacts.' },
      { e: 'digitalcorpora' }
    ] });

  HR.definePath({ id: 'linux', title: 'Linux & Server Security', level: 'Beginner to intermediate', hours: '30 hours',
    tagline: 'Diagnose broken boxes, then audit them like an attacker would.',
    steps: [
      { a: 'linux-01' }, { a: 'linux-02' }, { a: 'linux-03' }, { a: 'linux-04' }, { a: 'linux-05' }, { a: 'linux-06' },
      { a: 'linux-07' }, { a: 'linux-08' }, { a: 'linux-09' }, { a: 'linux-10' },
      { e: 'thm-room-linuxfundamentalspart1' }, { e: 'thm-room-linuxfundamentalspart2' }, { e: 'thm-room-linuxfundamentalspart3' },
      { e: 'sadservers', note: 'Real broken servers on a timer.' },
      { e: 'otw-bandit' }
    ] });

  HR.definePath({ id: 'networking', title: 'Networking', level: 'Beginner', hours: '25 hours',
    tagline: 'Subnets, ports, handshakes, DNS and traffic you can read at a glance.',
    steps: [
      { a: 'net-01' }, { a: 'net-02' }, { a: 'net-03' }, { a: 'net-05' }, { a: 'net-07' },
      { a: 'net-04' }, { a: 'net-06' }, { a: 'net-08' },
      { e: 'messer-netplus', note: 'Free video theory for everything above.' },
      { e: 'wireshark-samples', note: 'Open captures and find the handshakes yourself.' }
    ] });

  HR.definePath({ id: 'reverse-engineering', title: 'Reverse Engineering', level: 'Intermediate', hours: '45 hours',
    tagline: 'Read assembly, follow data through functions, then crack real binaries.',
    steps: [
      { a: 'asm-01' }, { a: 'asm-02' }, { a: 'asm-03' }, { a: 'asm-04' }, { a: 'asm-05' }, { a: 'asm-06' },
      { a: 'for-04', note: 'strings: the first five minutes of every analysis.' },
      { e: 'crackmes' }, { e: 'reversing-kr' }, { e: 'microcorruption' },
      { e: 'pwn-college', note: 'The most complete free binary course there is.' }
    ] });

  HR.definePath({ id: 'crypto', title: 'Encoding & Crypto', level: 'Beginner to advanced', hours: '30 hours',
    tagline: 'Peel every encoding layer, then learn why crypto breaks in practice.',
    steps: [
      { a: 'enc-01' }, { a: 'enc-02' }, { a: 'enc-03' }, { a: 'enc-04' }, { a: 'enc-05' }, { a: 'enc-06' }, { a: 'enc-07' },
      { a: 'crypto-01' }, { a: 'crypto-07' }, { a: 'crypto-08' }, { a: 'crypto-09' },
      { a: 'crypto-02' }, { a: 'crypto-03' }, { a: 'crypto-04' }, { a: 'crypto-05' }, { a: 'crypto-06' },
      { e: 'cryptohack' }, { e: 'cryptopals' }
    ] });

  HR.definePath({ id: 'ctf-prep', title: 'CTF Prep', level: 'All levels', hours: 'Ongoing',
    tagline: 'A bit of everything, fast. Then go play real competitions.',
    steps: [
      { a: 'enc-06' }, { a: 'for-01' }, { a: 'crypto-04' }, { a: 'asm-04' }, { a: 'for-06' }, { a: 'net-05' },
      { e: 'picogym', note: 'Hundreds of beginner-friendly challenges.' },
      { e: 'ctflearn' }, { e: 'google-ctf' }, { e: '247ctf' },
      { e: 'ctftime', note: 'Find a team and a weekend competition.' }
    ] });

  HR.definePath({ id: 'cloud-ad', title: 'Cloud & Active Directory', level: 'Advanced', hours: '60 hours',
    tagline: 'Where real enterprise breaches happen: cloud misconfigurations and Windows domains.',
    steps: [
      { a: 'net-06', note: 'Dangling cloud resources, from the DNS side.' },
      { e: 'flaws-cloud' }, { e: 'flaws2-cloud' }, { e: 'cloudgoat' },
      { a: 'logs-04', note: 'Windows security events you must recognize.' },
      { e: 'goad', note: 'A full vulnerable domain in your lab.' }
    ] });
})();
