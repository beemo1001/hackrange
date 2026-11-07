# HackGrid

Hands-on cybersecurity practice labs by **CyberFlow**. Part of the CyberFlow toolkit with [BountyFlow](https://beemo1001.github.io/bountyflow/) and [SecLab](https://beemo1001.github.io/seclab/).

- **87 labs across 11 skills:** Linux & terminal, Networking, Web & HTTP, Secure code review, Encoding, Crypto & passwords, Logs & incident response, Forensics, Phishing, Assembly reading, Payload diagnosis.
- **Interactive Linux terminal labs:** fix a broken box to capture the flag.
- **11 learning paths** (Day Zero, Web Foundations, Bug Bounty Ready, SOC Analyst, Forensics, Linux, Networking, Reverse Engineering, Crypto, CTF Prep, Cloud & AD).
- **131 curated external platforms** for hands-on attacking of legal targets (PortSwigger Academy, TryHackMe, Hack The Box, OverTheWire, picoCTF, flAWS, GOAD and more).
- XP, ranks and badges. Progress stays in the browser (export and import as JSON). Progress from the old HackRange site carries over automatically.

Answers are stored as SHA-256 hashes, so viewing the page source does not reveal them.

## Run locally

Open `index.html`, or serve the folder: `python -m http.server 4103`.

## Deploy

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root. No build step.

## Editing labs

The lab files in `js/labs-net.js`, `labs-web.js`, `labs-code.js`, `labs-logs.js`, `labs-forensics.js` and `labs-phish.js` are generated from the source files kept outside this repo (`community-sites/_shared/tools/labs-src`). Edit the source, then run `python _shared/tools/build_labs.py` to re-hash the answers.

Every target in HackGrid is fictional, uses reserved example domains and documentation IP ranges, or is a platform built for legal practice. Only test systems you are authorized to test.
