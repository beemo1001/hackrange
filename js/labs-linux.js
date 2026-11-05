/* ============================================================
   HackRange labs · Linux Diagnosis (6 labs)
   An interactive simulated shell. No hints on the box itself:
   explore, run commands, reason. Realistic failure scenarios
   from junior sysadmin life.
   ============================================================ */

function F(content, opts) {
  return Object.assign({ type: 'f', mode: '-rw-r--r--', content: content, filetype: 'ASCII text' }, opts || {});
}
function D(children, opts) {
  return Object.assign({ type: 'd', mode: 'drwxr-xr-x', children: children || {} }, opts || {});
}

HR.defineLab({
  id: 'linux-01', cat: 'linux', diff: 1,
  title: 'Permission Denied',
  brief: 'You SSH into the club deploy box. The deploy script is right there in your home directory, but ./deploy.sh spits back Permission denied. Nothing is broken, nothing is missing. Linux is simply telling you that a file and the RIGHT to execute it are two different things. Fix the permission and run the script.',
  env: {
    type: 'terminal',
    user: 'student', host: 'deploy-01',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)',
      '',
      'Last login: Mon Nov  3 18:42:11 2026 from 192.168.1.20',
      ''
    ],
    fs: D({
      home: D({
        student: D({
          'deploy.sh': F('#!/bin/bash\n# club site deployer\necho "[*] pulling latest build..."\necho "[*] running deploy checklist..."\necho "[+] deployment finished successfully"', { mode: '-rw-r--r--' }),
          'notes.txt': F('TODO before Friday:\n- run deploy.sh\n- fix the backup cron\n- ask admin about sudo rights')
        })
      }),
      etc: D({ hostname: F('deploy-01'), 'os-release': F('NAME="Ubuntu"\nVERSION="22.04.3 LTS (LTS: Jammy Jellyfish)"') })
    }),
    onScript: function (path, node, io, ctx) {
      if (node.mode && node.mode[3] === 'x') {
        io.print('[*] pulling latest build...');
        io.print('[*] running deploy checklist...');
        io.print('[+] deployment finished successfully');
        io.print('');
        io.print('deploy daemon: integrity token HR{execute_bit}');
        io.solve('HR{execute_bit}');
      }
      return true;
    }
  },
  flag: 'HR{execute_bit}',
  flagNote: 'Run the script successfully. The terminal reveals the flag.',
  hints: [
    'Start with ls -l deploy.sh. Read the permission string character by character.',
    '-rw-r--r-- means: owner can read and write, NOBODY can execute. The x bit is simply absent.',
    'chmod 700 deploy.sh (owner gets read, write, execute) and then run ./deploy.sh'
  ],
  walk: '<span class="mono">ls -l deploy.sh</span> shows <span class="mono">-rw-r--r--</span>: three triads for owner, group, others, and no x anywhere. <span class="mono">chmod 700 deploy.sh</span> grants read, write, execute to the owner only (7 = rwx, 0 = nothing for everyone else), then <span class="mono">./deploy.sh</span> runs. The deploy daemon prints the flag <span class="mono">HR{execute_bit}</span>. Permission triads are read as 4 read, 2 write, 1 execute, summed per owner group other: 700 is a private executable, 755 is a shared one, 644 is a normal file. When something refuses to run, check the x bit BEFORE blaming the script: Linux answers "permission denied" for missing x and "no such file" for a broken interpreter line, and the two diagnoses lead to completely different fixes.',
  study: 'SecLab · Linux Errors · EACCES page explains every permission character.'
});

HR.defineLab({
  id: 'linux-02', cat: 'linux', diff: 1,
  title: 'No Space Left',
  brief: 'The club wiki stopped saving edits. You SSH in, try to create a test file, and the shell answers: No space left on device. Something on this box is eating the disk whole. Find it, prove it, remove it, and get the storage daemon to breathe again.',
  env: {
    type: 'terminal',
    user: 'student', host: 'wiki-01',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS',
      '',
      'systemd[1]: storaged.service: Failed with result \'disk-full\'.',
      ''
    ],
    fs: D({
      home: D({
        student: D({
          'todo.txt': F('wiki maint day:\n- check disk\n- restart storaged if you free space')
        })
      }),
      var: D({
        log: D({
          'app.log': F('2026-11-03 ERROR: request failed\n2026-11-03 ERROR: request failed\n... (41 GB of repeated errors)', { mode: '-rw-r--r--', size: '41G' }),
          'syslog.1': F('Nov  3 09:12:11 wiki-01 kernel: [UFW BLOCK] IN=eth0', { size: '2.1M' }),
          'storaged.log': F('Nov  3 18:44:02 storaged: ERROR: cannot write checkpoint: No space left on device')
        })
      })
    }),
    df: function () {
      const full = this._cleaned ? 38 : 100;
      const use = this._cleaned ? '15G' : '40G';
      return 'Filesystem      Size  Used Avail Use% Mounted on\n' +
        '/dev/sda1        40G   ' + use + '   ' + (this._cleaned ? '23G' : '0') + '  ' + full + '% /';
    },
    du: function (t) {
      if (t.indexOf('/var/log') === 0) {
        if (this._cleaned) return '2.1M\t/var/log';
        return '41G\t/var/log/app.log\n2.1M\t/var/log/syslog.1\n8.0K\t/var/log/storaged.log';
      }
      return '8.0K\t' + t;
    },
    onRm: function (abs, node, io, ctx) {
      if (abs === '/var/log/app.log') {
        this._cleaned = true;
        io.print('');
        io.print('removed 41G from /var/log/app.log');
        io.print('systemd[1]: storaged.service: recovering...');
        io.print('storaged: checkpoint written, manifest contains HR{disk_clear}');
        io.solve('HR{disk_clear}');
        return true;
      }
      return false;
    }
  },
  flag: 'HR{disk_clear}',
  flagNote: 'Free the disk. The terminal reveals the flag when the daemon recovers.',
  hints: [
    'Confirm the problem and its size: df -h shows the filesystem at 100%. Now find WHAT is eating it.',
    'du -sh /var/log/* walks the log directory and prints per directory sizes. One file dwarfs the rest.',
    'rm /var/log/app.log removes the runaway log. The storage daemon restarts itself once space exists.'
  ],
  walk: 'The diagnostic ladder for full disks: <span class="mono">df -h</span> confirms which filesystem is full (here /, at 100%). <span class="mono">du -sh /var/log/*</span> hunts the bulk and finds <span class="mono">41G /var/log/app.log</span>, a log with a stuck error loop. <span class="mono">rm /var/log/app.log</span> frees the space and the storage daemon writes its checkpoint containing the flag <span class="mono">HR{disk_clear}</span>. Two pro habits: first, when a process holds an open deleted file, space is not freed until restart (logrotate exists for this reason), and second, ALWAYS find the cause (the error loop), not just the symptom (the big file), or the log grows back tomorrow.',
  study: 'SecLab · Linux Errors · ENOSPC page: the deleted-but-open file gotcha.'
});

HR.defineLab({
  id: 'linux-03', cat: 'linux', diff: 2,
  title: 'Nginx Refuses to Start',
  brief: 'You changed one line in the club reverse proxy config last night. This morning nginx will not start and the site is down. Everyone is watching. The machine will tell you exactly what it hates, but only if you ask it properly: status, logs, then config test. Find the bad line and fix it.',
  env: {
    type: 'terminal',
    user: 'student', host: 'proxy-01',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS',
      '',
      'systemd[1]: nginx.service: Failed with result \'exit-code\'.',
      ''
    ],
    fs: D({
      home: D({ student: D({}) }),
      etc: D({
        nginx: D({
          'nginx.conf': F('user www-data;\nworker_processes auto;\ninclude /etc/nginx/sites-enabled/*;'),
          'sites-enabled': D({
            'app.conf': F('server {\n    listen 80;\n    serverr_name club.example;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n    }\n}\n# line 4 contains the typo you introduced')
          })
        })
      })
    }),
    exec: function (cmd, io, ctx) {
      if (/^systemctl\s+(status|start|restart)\s+nginx/.test(cmd)) {
        if (!ctx.fixed) {
          io.print('nginx.service: Main process exited, code=exited, status=1/FAILURE');
          io.print('Nov 03 18:50:12 proxy-01 systemd[1]: Failed to start A high performance web server.');
          io.print('hint: run nginx -t or journalctl -u nginx for details');
        } else {
          io.print('nginx.service: Scheduled restart job, restart counter is at 1.');
          io.print('Nov 03 18:58:40 proxy-01 systemd[1]: Started A high performance web server.');
          io.print('');
          io.print('root page now serves: proxy up · health token HR{config_ninja}');
          io.solve('HR{config_ninja}');
        }
        return true;
      }
      if (/^journalctl/.test(cmd)) {
        io.print('Nov 03 18:50:12 proxy-01 nginx[812]: nginx: [emerg] unknown directive "serverr_name" in /etc/nginx/sites-enabled/app.conf:4');
        io.print('Nov 03 18:50:12 proxy-01 systemd[1]: nginx.service: Control process exited, code=exited status=1');
        return true;
      }
      if (/^nginx\s+-t/.test(cmd)) {
        io.print('nginx: [emerg] unknown directive "serverr_name" in /etc/nginx/sites-enabled/app.conf:4');
        io.print('nginx: configuration file /etc/nginx/nginx.conf test failed');
        return true;
      }
      if (/^cat\s/.test(cmd)) return false;
      if (/^sed\s/.test(cmd)) {
        const m = cmd.match(/^sed\s+-i\s+['"]?s(.)['"]?(.*?)\1(.*?)\1['"]?\s+(\S+)$/);
        if (m && node3(this, m[4])) {
          if (m[2].indexOf('serverr') !== -1 && m[3].indexOf('server') !== -1 && m[3].indexOf('serverr') === -1) {
            ctx.fixed = true;
            this.fs.children.etc.children.nginx.children['sites-enabled'].children['app.conf'].content =
              this.fs.children.etc.children.nginx.children['sites-enabled'].children['app.conf'].content.replace('serverr_name', 'server_name');
            io.print('(line 4 corrected: server_name)');
            return true;
          }
          io.print('(sed applied, but the typo on line 4 is still there)');
          return true;
        }
        io.print('sed: -e expression: unmatched or malformed');
        return true;
      }
      return false;
    }
  },
  flag: 'HR{config_ninja}',
  flagNote: 'Fix the config and start nginx. The terminal reveals the flag.',
  hints: [
    'Ask in order: systemctl status nginx (what), journalctl -u nginx (why), nginx -t (where exactly).',
    'The error names the file, the line and the crime: unknown directive "serverr_name" in app.conf line 4.',
    'sed -i \'s/serverr/server/\' /etc/nginx/sites-enabled/app.conf then systemctl start nginx'
  ],
  walk: 'The diagnostic ladder for dead services: <span class="mono">systemctl status nginx</span> shows failed, <span class="mono">journalctl -u nginx</span> prints <span class="mono">nginx: [emerg] unknown directive "serverr_name" in /etc/nginx/sites-enabled/app.conf:4</span>, and <span class="mono">nginx -t</span> confirms the config test fails. The crime: a typo, <span class="mono">serverr_name</span> instead of <span class="mono">server_name</span>. Fix: <span class="mono">sed -i \'s/serverr/server/\' /etc/nginx/sites-enabled/app.conf</span> then <span class="mono">systemctl start nginx</span>. The health page carries the flag <span class="mono">HR{config_ninja}</span>. The lesson generalizes to every service on Linux: status tells you THAT it died, the journal tells you WHY, and the config test tells you WHERE. Never debug a config file by reading all of it when the daemon will point at the exact line.',
  study: 'SecLab · Linux Errors · service failure diagnosis ladder.'
});

/* helper so sed can verify the target file exists without env scope games */
function node3(env, path) {
  return path.indexOf('app.conf') !== -1;
}

HR.defineLab({
  id: 'linux-04', cat: 'linux', diff: 2,
  title: 'The Name That Would Not Resolve',
  brief: 'The build server cannot download packages. The error says Could not resolve host. Half the class says "the internet is down". You suspect otherwise, because a box with dead networking usually fails differently. Prove where the resolution chain breaks, fix it, and pull the package.',
  env: {
    type: 'terminal',
    user: 'student', host: 'build-01',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS',
      '',
      'bash: curl https://packages.example.com/deb list ... failed',
      "curl: (6) Could not resolve host: packages.example.com",
      ''
    ],
    fs: D({
      home: D({ student: D({}) }),
      etc: D({
        'resolv.conf': F('# generated by NetworkManager\nnameserver 192.168.1.999\nsearch lab.local'),
        hosts: F('127.0.0.1\tlocalhost\n127.0.1.1\tbuild-01')
      })
    }),
    exec: function (cmd, io, ctx) {
      const self = this;
      const dnsOk = function () {
        const rc = self.fs.children.etc.children['resolv.conf'];
        return rc && /nameserver\s+(1\.1\.1\.1|8\.8\.8\.8|9\.9\.9\.9|1\.0\.0\.1|208\.67\.222\.222)/.test(rc.content || '');
      };
      if (/^ping\s+(\S+)/.test(cmd)) {
        const target = cmd.match(/^ping\s+(\S+)/)[1];
        if (/^\d+\.\d+\.\d+\.\d+$/.test(target)) {
          io.print('PING ' + target + ' 56(84) bytes of data.');
          io.print('64 bytes from ' + target + ': icmp_seq=1 ttl=57 time=9.8 ms');
          io.print('64 bytes from ' + target + ': icmp_seq=2 ttl=57 time=9.1 ms');
        } else {
          io.print('ping: ' + target + ': Name or service not known');
        }
        return true;
      }
      if (/^curl\s+/.test(cmd)) {
        const url = cmd.match(/^curl\s+(\S+)/)[1];
        if (dnsOk()) {
          io.print('<html><body>packages index: 42 debs available</body></html>');
          io.print('');
          io.print('mirror: served HR{dns_fixed} in the mirror banner header');
          io.solve('HR{dns_fixed}');
        } else {
          io.print('curl: (6) Could not resolve host: ' + url.replace(/^https?:\/\//, ''));
        }
        return true;
      }
      if (/^nslookup\s+/.test(cmd) || /^dig\s+/.test(cmd)) {
        const t = cmd.split(/\s+/)[1];
        if (dnsOk()) {
          io.print('Server:\t\t1.1.1.1');
          io.print('Address:\t1.1.1.1#53');
          io.print('');
          io.print('Name:\t' + t.replace(/^https?:\/\//, ''));
          io.print('Address: 93.184.216.34');
        } else {
          io.print(';; connection timed out; no servers could be reached');
        }
        return true;
      }
      return false;
    }
  },
  flag: 'HR{dns_fixed}',
  flagNote: 'Repair name resolution. The terminal reveals the flag when the download succeeds.',
  hints: [
    'Split the problem in half: can you reach the NETWORK at all? ping 1.1.1.1 by IP. If yes, routing and internet are fine.',
    'ping packages.example.com by NAME fails while the IP works: the break is between names and numbers. Read /etc/resolv.conf.',
    'nameserver 192.168.1.999 is not a valid IPv4 address. Overwrite the file: echo "nameserver 1.1.1.1" > /etc/resolv.conf and retry curl.'
  ],
  walk: 'The resolution chain: IP connectivity, then DNS config, then the resolver. <span class="mono">ping 1.1.1.1</span> answers: the network is fine. <span class="mono">ping packages.example.com</span> fails: names are the problem. <span class="mono">cat /etc/resolv.conf</span> shows <span class="mono">nameserver 192.168.1.999</span>, an impossible IPv4 address (999 exceeds 255 per octet), so every lookup times out. Fix it: <span class="mono">echo "nameserver 1.1.1.1" &gt; /etc/resolv.conf</span> then <span class="mono">curl https://packages.example.com/deb</span> succeeds and the mirror banner carries <span class="mono">HR{dns_fixed}</span>. The debugging pattern is the real takeaway: NAME fails + IP works = DNS. It bisects the network stack in two commands and works on every Linux box you will ever touch.',
  study: 'SecLab · Linux Errors · DNS resolution chain and every failure point on it.'
});

HR.defineLab({
  id: 'linux-05', cat: 'linux', diff: 3,
  title: 'The Midnight Job That Never Ran',
  brief: 'A backup script sits in /home/student/scripts. Run it by hand: perfect, archives appear. Cron says it runs it every night at 2:30. Yet no backup has ever existed in the morning. The script is fine. The schedule is fine. Something about WHERE cron runs it is the killer. Diagnose, fix the path bug, and produce one successful backup.',
  env: {
    type: 'terminal',
    user: 'student', host: 'backup-01',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS',
      '',
      'cron[441]: (student) CMD (/home/student/scripts/backup.sh)',
      "cron[441]: (CRON) info (No MTA installed, discarded output)",
      ''
    ],
    fs: D({
      home: D({
        student: D({
          'backup.log': F('Nov 01 02:30:01 /home/student/scripts/backup.sh: line 2: cd: backup: No such file or directory\nNov 02 02:30:01 /home/student/scripts/backup.sh: line 2: cd: backup: No such file or directory\nNov 03 02:30:01 /home/student/scripts/backup.sh: line 2: cd: backup: No such file or directory'),
          scripts: D({
            'backup.sh': F('#!/bin/bash\ncd backup\ntar czf ../backups-$(date +%F).tar.gz ./notes/\necho "backup done"'),
            backup: D({
              notes: D({
                'club-notes.txt': F('meeting notes: the cron job still does not work, ask the new student')
              })
            })
          }),
          notes: D({})
        })
      })
    }),
    exec: function (cmd, io, ctx) {
      if (/^crontab\s+-l/.test(cmd)) {
        io.print('30 2 * * * /home/student/scripts/backup.sh >> /home/student/backup.log 2>&1');
        return true;
      }
      if (/^sed\s/.test(cmd)) {
        const m = cmd.match(/^sed\s+-i\s+['"]?s(.)['"]?(.*?)\1(.*?)\1['"]?\s+(\S+)$/);
        if (m && m[4].indexOf('backup.sh') !== -1 && m[2].indexOf('cd backup') !== -1 && m[3].indexOf('/home/student/scripts/backup') !== -1) {
          ctx.pathFixed = true;
          io.print('(line 2 corrected: absolute path)');
          return true;
        }
        io.print('sed: nothing changed. The script still uses a relative cd.');
        return true;
      }
      return false;
    },
    onScript: function (path, node, io, ctx) {
      if (path.indexOf('backup.sh') === -1) return false;
      if (ctx.pathFixed || /\bscripts\b/.test(ctx.cwd)) {
        io.print('backup done');
        io.print('');
        io.print('tar: archive contains integrity stamp HR{cron_cwd_trap}');
        io.solve('HR{cron_cwd_trap}');
      } else {
        io.print('/home/student/scripts/backup.sh: line 2: cd: backup: No such file or directory');
      }
      return true;
    }
  },
  flag: 'HR{cron_cwd_trap}',
  flagNote: 'Fix the script and produce a successful backup. The terminal reveals the flag.',
  hints: [
    'The evidence is in two places: cat backup.log (what failed at 2:30) and the script itself. Run ./scripts/backup.sh by hand from home first.',
    'The script does cd backup, a RELATIVE path. It works when you run it from the scripts directory, but cron runs it with your home as working directory. From home, there is no ./backup.',
    'sed -i \'s|cd backup|cd /home/student/scripts/backup|\' /home/student/scripts/backup.sh then bash /home/student/scripts/backup.sh'
  ],
  walk: 'The failure chain: cron executes <span class="mono">/home/student/scripts/backup.sh</span> with the user home as the working directory, the script does <span class="mono">cd backup</span> relative, and from <span class="mono">/home/student</span> there is no <span class="mono">backup</span> subdirectory, so it dies at line 2 while you sleep. The log says so every night: <span class="mono">cd: backup: No such file or directory</span>. Fix the path: <span class="mono">sed -i \'s|cd backup|cd /home/student/scripts/backup|\' /home/student/scripts/backup.sh</span>, then <span class="mono">bash /home/student/scripts/backup.sh</span> produces the archive with the stamp <span class="mono">HR{cron_cwd_trap}</span>. Cron cwd and minimal PATH are the two classic cron gotchas: cron is NOT your shell. Always use absolute paths in cron jobs, and test with the exact environment cron provides, not your interactive one.',
  study: 'SecLab · Linux Errors · cron environment differences.'
});

HR.defineLab({
  id: 'linux-06', cat: 'linux', diff: 3,
  title: 'The Full Disk That Was Not Full',
  brief: 'The most senior trap in this set. df says the filesystem is 71% used, 12 GB free, and yet every write fails with No space left on device. Disk space and the ability to create files are RELATED but not identical resources. The box has millions of something. Find out what, clean it, and let the app write again.',
  env: {
    type: 'terminal',
    user: 'student', host: 'app-02',
    welcome: [
      'Welcome to Ubuntu 22.04.3 LTS',
      '',
      'bash: touch /tmp/test.txt ... No space left on device',
      ''
    ],
    fs: D({
      home: D({ student: D({ 'hint.txt': F('app team: sessions are cached in /var/spool/sessions, cleanup is overdue') }) }),
      var: D({
        spool: D({
          sessions: D({
            '.keep': F('', { filetype: 'empty' })
          })
        })
      }),
      tmp: D({})
    }),
    df: function (args) {
      if (args.indexOf('-i') !== -1) {
        const used = this._cleaned ? 8 : 100;
        const iused = this._cleaned ? '52k' : '5.2M';
        return 'Filesystem     Inodes  IUsed   IFree IUse% Mounted on\n' +
          '/dev/sda1      5.2M   ' + iused + '     ' + (this._cleaned ? '5.1M' : '0') + '   ' + used + '% /';
      }
      return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   28G   12G  71% /';
    },
    exec: function (cmd, io, ctx) {
      if (/^touch\s+\/tmp/.test(cmd)) {
        if (this._cleaned) {
          io.print('(created /tmp/test.txt successfully)');
          io.print('');
          io.print('app daemon: storage healthy again, writing manifest HR{inodes_not_bytes}');
          io.solve('HR{inodes_not_bytes}');
        } else {
          io.print('touch: cannot touch \'/tmp/test.txt\': No space left on device');
        }
        return true;
      }
      if (/^ls\s+\/var\/spool\/sessions/.test(cmd)) {
        io.print('(the listing scrolls for a very long time... approximately 2 million tiny session files)');
        return true;
      }
      if (/^wc\s+-l\b/.test(cmd) || /^ls\s+\/var\/spool\/sessions\s*\|\s*wc/.test(cmd)) {
        io.print('2048317');
        return true;
      }
      return false;
    },
    onRm: function (abs, node, io) {
      if (abs === '/var/spool/sessions' || abs === '/var/spool/sessions/*' || abs === '/var/spool/sessions/') {
        this._cleaned = true;
        io.print('(removed 2,048,317 tiny files: this takes a while...)');
        io.print('freed: 2,048,317 inodes');
        io.print('try creating your test file again');
        return true;
      }
      return false;
    }
  },
  flag: 'HR{inodes_not_bytes}',
  flagNote: 'Restore the ability to create files. The terminal reveals the flag.',
  hints: [
    'df -h says 71% used with 12 GB free, yet writes fail. Bytes are fine, so the OTHER filesystem resource must be exhausted. df has a flag for it.',
    'df -i shows inode usage: 100%. Every file, however tiny, consumes one inode. Now hunt the file COUNT: what directory could hold millions of files?',
    'The hint file names it: /var/spool/sessions. ls it (pipe through wc -l if you like) then rm -rf /var/spool/sessions and retry touch /tmp/test.txt'
  ],
  walk: 'A filesystem has TWO capacities: bytes (df -h) and inodes (df -i), the metadata slots for files. Here bytes are at 71% but inodes are at 100%: 5.2M inodes, all consumed. <span class="mono">df -i</span> is the tell. Counting suspects: <span class="mono">ls /var/spool/sessions | wc -l</span> reports 2,048,317 tiny session cache files, each stealing an inode while wasting almost no bytes, which is why -h looked innocent. <span class="mono">rm -rf /var/spool/sessions</span> frees them and <span class="mono">touch /tmp/test.txt</span> succeeds; the app manifest carries <span class="mono">HR{inodes_not_bytes}</span>. Whenever "No space" contradicts df -h, check df -i. It is the interview question that separates admins who memorize commands from admins who understand filesystems.',
  study: 'SecLab · Linux Errors · ENOSPC page, the inode half of the story.'
});
