/* HackGrid labs · Networking (generated from _shared/tools/labs-src, do not edit the built copy) */
(function () {
const L = o => HR.defineLab(Object.assign({ env: { type: 'static', blocks: o.blocks || [] } }, o));

L({ id: 'net-01', cat: 'net', diff: 1, title: 'How Many Hosts?',
  brief: `The campus lab network is being split up. Your team gets the subnet 192.168.10.64/26 for the new practice VMs. Before you plan the IP addresses, work out how many machines can actually get an address in it.`,
  blocks: [{ t: 'code', title: 'Assigned subnet', text: '192.168.10.64/26' }],
  q: 'How many usable host addresses does this subnet have?', ph: 'a number',
  accept: ["81b8a03f97e8787c53fe1a86bda042b6f0de9b0ec9c09357e107c99ba4d6948a"],
  hints: [`The /26 means the first 26 bits are the network part. That leaves 32 - 26 bits for hosts.`, `6 host bits give 2^6 = 64 addresses in total.`, `Two of those are reserved: the network address and the broadcast address.`],
  walk: `A /26 leaves <span class="mono">32 - 26 = 6</span> host bits, so the block holds <span class="mono">2^6 = 64</span> addresses (192.168.10.64 to .127). The first is the network address and the last is the broadcast, so <b>62</b> are usable. The quick formula: usable hosts = 2^(host bits) - 2. Memorize /24 = 254, /25 = 126, /26 = 62, /27 = 30, /28 = 14 and you will size subnets in your head.` });

L({ id: 'net-02', cat: 'net', diff: 1, title: 'Edge of the Network',
  brief: `A firewall rule needs the broadcast address of the network that 10.20.37.200/22 belongs to. Get it wrong and the rule covers the wrong machines.`,
  blocks: [{ t: 'code', title: 'Host', text: '10.20.37.200/22' }],
  q: 'What is the broadcast address of this network?', ph: 'x.x.x.x',
  accept: ["5d013b37d42dd42851621bcf2f29929092e3bd078b5c777550e3c674045a9cc4"],
  hints: [`A /22 mask is 255.255.252.0. Only the third octet is interesting.`, `252 means the third octet moves in blocks of 4: 0, 4, 8 ... 32, 36, 40.`, `37 falls in the block that starts at 36. That block covers 36, 37, 38, 39.`],
  walk: `/22 = <span class="mono">255.255.252.0</span>, so the third octet is grouped in blocks of 256 - 252 = 4. 37 sits in the 36 to 39 block, so the network is <span class="mono">10.20.36.0</span> and the broadcast is the last address of the block: <b>10.20.39.255</b>. The block-size trick (256 minus the mask octet) works for every mask and is much faster than binary.` });

L({ id: 'net-03', cat: 'net', diff: 1, title: 'Too Many Doors',
  brief: `The admin of a small web server tells you only two things should be reachable from the internet: SSH and plain HTTP on port 80. Your external scan of the server found these open ports.`,
  blocks: [{ t: 'code', title: 'Open TCP ports (external scan)', text: '21/tcp   open  ftp\n22/tcp   open  ssh\n25/tcp   open  smtp\n80/tcp   open  http\n110/tcp  open  pop3\n139/tcp  open  netbios-ssn\n445/tcp  open  microsoft-ds\n3306/tcp open  mysql\n3389/tcp open  ms-wbt-server\n8080/tcp open  http-proxy' }],
  q: 'How many of these ports should be closed to the internet?', ph: 'a number',
  accept: ["2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3", "c195d2d8756234367242ba7616c5c60369bc25ced2dcb5b92808d31b58ef217a"],
  hints: [`Count every open port, then remove the ones the admin says are expected.`, `Expected: 22 (SSH) and 80 (HTTP). 8080 is a different port, even if it also speaks HTTP.`, `10 open ports minus 2 expected.`],
  walk: `Ten ports are open. Only <span class="mono">22</span> and <span class="mono">80</span> are expected, so <b>8</b> should be closed: FTP, SMTP, POP3, SMB (139/445), MySQL, RDP (3389) and the alternate HTTP port 8080. SMB, RDP and database ports exposed to the internet are among the most common root causes of real breaches. Attack surface reduction starts with exactly this comparison: what is open versus what is supposed to be open.` });

L({ id: 'net-04', cat: 'net', diff: 2, title: 'Read the Scan',
  brief: `You ran a service-version scan against a test server you are authorized to assess. Your report needs a top finding. Find the service running software that has been end-of-life for years.`,
  blocks: [{ t: 'code', title: 'Service scan of 10.0.5.23', text: 'PORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13\n80/tcp   open  http     nginx 1.26.2\n443/tcp  open  ssl/http nginx 1.26.2\n5432/tcp open  postgresql PostgreSQL 16.4\n8080/tcp open  http     Apache Tomcat/Coyote JSP engine 1.1 (Apache Tomcat 7.0.0)\n9100/tcp open  jetdirect?' }],
  q: 'Which port runs the end-of-life software?', ph: 'port number',
  accept: ["6c237681e70921603a306be9a1a5d9833fce5c1e268f52b1650970eaad0dce21", "343154b3512ed939d896b2b88788b30ed3f643152d329a5f581e375a652fa935"],
  hints: [`Look at the version numbers and ask: is this a current release line?`, `OpenSSH 9.x, nginx 1.26 and PostgreSQL 16 are all recent.`, `Apache Tomcat 7 reached end of life in 2021, and 7.0.0 is its very first release.`],
  walk: `Apache Tomcat 7.0.0 on <b>8080</b> is the oldest possible build of a branch that stopped receiving security fixes in 2021. Everything else is current. Version strings are the cheapest win in any assessment: an unsupported version means known, public vulnerabilities that will never be patched. Also worth a note: 5432 (database) should probably not be reachable from your scan position at all.` });

L({ id: 'net-05', cat: 'net', diff: 2, title: 'Shake Hands',
  brief: `A packet capture shows a client trying two ports on a server. One attempt fails, one connects. Read the TCP flags.`,
  blocks: [{ t: 'table', title: 'Capture (client 10.0.0.15, server 10.0.0.80)', cols: ['#', 'Source', 'Destination', 'Flags'],
    rows: [['1', '10.0.0.15:51022', '10.0.0.80:23', 'SYN'], ['2', '10.0.0.80:23', '10.0.0.15:51022', 'RST, ACK'], ['3', '10.0.0.15:51024', '10.0.0.80:22', 'SYN'], ['4', '10.0.0.80:22', '10.0.0.15:51024', 'SYN, ACK'], ['5', '10.0.0.15:51024', '10.0.0.80:22', 'ACK'], ['6', '10.0.0.15:51024', '10.0.0.80:22', 'PSH, ACK']] }],
  q: 'Which server port is open, and which packet number completes its handshake? Answer as port:packet', ph: 'e.g. 80:3',
  accept: ["e9e51c5a1d6cbbb3fcf4161626c1374b4f8d55ab67bd26e4d265ddb32e02df4c", "c36e4b99fcaed5055feaeab040da9988a01e715d3379ec6c479897016fb39357", "38c10308ed249ef7856748efc89935ae08f26ed0bfda694954d269ebb20e1f5e", "ef8bd460c481cd1a9f9b91d087cddd49ad58c2917c1ffce586d0dfe7f30f70a7", "3b7f1c027eae2830c9057d6b96d1d7ffa7c15c8f478225f756ec8c6d6e11970e"],
  hints: [`A closed port answers a SYN with RST. An open port answers with SYN, ACK.`, `The handshake is SYN, then SYN-ACK, then ACK.`, `Port 23 replied RST. Port 22 replied SYN, ACK in packet 4. What comes next?`],
  walk: `Port 23 answered the SYN with <span class="mono">RST, ACK</span>: closed. Port 22 answered with <span class="mono">SYN, ACK</span>, and the client's <span class="mono">ACK</span> in packet 5 completes the three-way handshake, so the answer is <b>22:5</b>. Packet 6 (PSH) is the first data. Scanners use exactly this difference to decide open versus closed.` });

L({ id: 'net-06', cat: 'net', diff: 2, title: 'Dangling Record',
  brief: `While mapping corp.example (in scope of a program you joined), you collect DNS records. One subdomain points at a cloud storage bucket that no longer exists. That is a takeover risk you should report.`,
  blocks: [{ t: 'code', title: 'DNS answers', text: 'corp.example.            A      203.0.113.10\nwww.corp.example.        CNAME  corp.example.\nmail.corp.example.       MX 10  mx1.mailhost.example.\nstatus.corp.example.     CNAME  corp.statuspage.example.\nassets.corp.example.     CNAME  corp-assets.bucket.cloudstore.example.\ndocs.corp.example.       CNAME  corp-docs.pages.example.' },
    { t: 'res', title: 'GET https://assets.corp.example/', status: '404 Not Found', headers: 'content-type: application/xml', text: '<Error><Code>NoSuchBucket</Code><Message>The specified bucket does not exist</Message></Error>' }],
  q: 'Which subdomain is at risk of takeover?', ph: 'hostname',
  accept: ["b81a41184dba1268ccaf0a309c01902905ec14a27fa64cfa6f50d518662eff7e", "a0966e786bec364200d67f504ef8c16fc5994b9c88f357a4ca81d4a2cfe3e2c9"],
  hints: [`A CNAME points a name at another name. If the target is gone, whoever recreates it controls the content.`, `Which response says the thing behind the record does not exist?`, `NoSuchBucket came from the assets host.`],
  walk: `<span class="mono">assets.corp.example</span> still points at <span class="mono">corp-assets.bucket.cloudstore.example</span>, but the bucket was deleted (<span class="mono">NoSuchBucket</span>). Anyone who creates a bucket with that name would serve content on the company's own subdomain. The fix is simple: delete stale DNS records when you delete cloud resources. In a report, prove the dangling state; do not actually claim the bucket unless the program explicitly allows it.` });

L({ id: 'net-07', cat: 'net', diff: 3, title: 'Leaving Home',
  brief: `Traceroute from an office laptop to a public website. Which hop is the first one on the public internet? Careful: not every non-192.168 address is public.`,
  blocks: [{ t: 'code', title: 'traceroute www.example.org', text: ' 1  10.0.0.1         1.2 ms\n 2  10.255.0.1       2.0 ms\n 3  172.16.4.1       3.1 ms\n 4  100.64.12.1      7.8 ms\n 5  198.51.100.17    9.4 ms\n 6  198.51.100.90   11.0 ms\n 7  203.0.113.5     14.2 ms' }],
  q: 'Which hop number is the first public address?', ph: 'hop number',
  accept: ["ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", "bc44e5384b0be4c052445d34c480d852e06391d1ad68645a1631b0adc48b27ed"],
  hints: [`Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.`, `There is another non-public range used by internet providers for carrier-grade NAT: 100.64.0.0/10.`, `Hops 1 to 4 are all in private or shared ranges.`],
  walk: `10.x and 172.16.x are private (RFC 1918). The trap is hop 4: <span class="mono">100.64.12.1</span> is in <span class="mono">100.64.0.0/10</span>, the shared address space ISPs use for carrier-grade NAT, so it is not public either. The first public hop is <b>5</b>. Knowing the special ranges stops you from scanning or reporting addresses that are not what they look like.` });

L({ id: 'net-08', cat: 'net', diff: 2, title: 'Who Is Calling Out?',
  brief: `A web server is acting strangely. You list its network connections. Everything looks normal except one outbound connection made by a process with a name that tries to look like a kernel thread.`,
  blocks: [{ t: 'code', title: 'ss -tnp', text: 'State   Local Address:Port   Peer Address:Port    Process\nLISTEN  0.0.0.0:22           0.0.0.0:*            users:(("sshd",pid=812))\nLISTEN  0.0.0.0:443          0.0.0.0:*            users:(("nginx",pid=1101))\nESTAB   10.0.5.23:443        198.51.100.24:51544  users:(("nginx",pid=1104))\nESTAB   10.0.5.23:22         10.0.0.15:51024      users:(("sshd",pid=4410))\nESTAB   10.0.5.23:40122      203.0.113.66:4444    users:(("kworkerd",pid=6631))\nESTAB   10.0.5.23:5432       10.0.5.30:39102      users:(("postgres",pid=990))' }],
  q: 'Which remote IP address should incident response investigate?', ph: 'x.x.x.x',
  accept: ["a6353bfbe92ae34a8544b367820743d0175595f96dcad8b904c39583f24c3eec", "fae8632d6560d31cea24fca46c449b37d3096b69f4977ba26004111db43234a8"],
  hints: [`Inbound connections land on the server's listening ports (22, 443, 5432). Look for one that goes OUT to an unusual port.`, `Real kernel threads are named in brackets like [kworker/0:1] and do not open network connections.`, `pid 6631 talks to port 4444 on an outside address.`],
  walk: `Every connection is explained by a listening service except one: <span class="mono">kworkerd</span> (pid 6631) connected out to <b>203.0.113.66</b>:4444. Real kernel workers never make TCP connections, and 4444 is a classic default for remote-access tools. Next steps in real IR: capture the process (<span class="mono">/proc/6631/exe</span>, cmdline), block the IP at the firewall, and look for how it got there.` });
})();
