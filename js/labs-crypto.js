/* ============================================================
   HackRange labs · Crypto & Hashes (6 labs)
   Hash identification, weak secrets, XOR key reuse, Caesar
   shifts, JWT forgery thinking and the two time pad.
   ============================================================ */

HR.defineLab({
  id: 'crypto-01', cat: 'crypto', diff: 1,
  title: 'Name That Hash',
  brief: 'A password dump lands on your desk (it is a lab, everyone consented). Three columns, three different looking digest formats. Before you can crack or even reason about them, you need to identify the algorithm, because hash LENGTH is a fingerprint. Hashing the same sentence with three algorithms produces the tell below.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The same input hashed three ways:' },
      { t: 'code', title: 'input: "the quick brown fox jumps over the lazy dog"', text: 'digest A: ' + HR_MAT.STR['crypto-01-md5'] + '\ndigest B: ' + HR_MAT.STR['crypto-01-sha1'] + '\ndigest C: ' + HR_MAT.STR['crypto-01-sha256'] },
      { t: 'p', html: 'Count the characters and name the algorithm that produced <b>digest C</b>.' }
    ]
  },
  flagNote: 'The algorithm name, one word (no dashes needed).',
  hints: [
    'Count the hex characters of digest C. Each pair is one byte.',
    '32 hex chars = 16 bytes = MD5. 40 = SHA1. 64 = 32 bytes = ?',
    '64 hex characters is the SHA-2 family output at 256 bits: SHA256.'
  ],
  walk: 'Digest C is 64 hexadecimal characters = 32 bytes = 256 bits, the signature of <span class="mono">SHA256</span>. MD5 digests are always 32 hex chars, SHA1 always 40, SHA256 always 64, SHA512 always 128. Prefixed formats are even louder: <span class="mono">$2y$</span> is bcrypt, <span class="mono">$6$</span> is SHA-512 crypt, <span class="mono">$1$</span> is MD5 crypt. The flag is <span class="mono">HR{sha256}</span>. Length first, prefix second, and you can identify 95 percent of hashes you will ever meet before touching a cracker. It also tells you what is WORTH cracking: MD5 of a password falls to GPU brute force, bcrypt barely notices.',
  study: 'SecLab · Payload Lab · hash length identification table.'
});

HR.defineLab({
  id: 'crypto-02', cat: 'crypto', diff: 2,
  title: 'The Weak Season',
  brief: 'One hash from the dump, no salt, MD5. The user followed corporate policy ("must contain a season and a year"), which conveniently shrinks the search space from trillions to dozens. This is not cracking, it is guessing with extra steps, and it is how most real password breaks actually happen.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The leaked hash:' },
      { t: 'code', title: 'users.password_hash', text: HR_MAT.STR['crypto-02-md5'] },
      { t: 'p', html: 'Policy says the password is a lowercase season name glued to a year (like spring2022). Recover the password.' }
    ]
  },
  flagNote: 'The recovered password, no braces needed.',
  hints: [
    'Four seasons, a handful of plausible years. The whole candidate list is under 30 entries. Hash each candidate with MD5 and compare.',
    'Python one liner: import hashlib; hashlib.md5(b"summer2024").hexdigest()  then try the others.',
    'The season is the one with the sun, and the year is the one this lab was written in: 2024.'
  ],
  walk: 'Generate candidates (4 seasons x recent years) and hash: <span class="mono">hashlib.md5(b"summer2024").hexdigest()</span> equals the dump value. The password is <span class="mono">summer2024</span>, the flag <span class="mono">HR{summer2024}</span>. The real world version of this lab runs at scale: rockyou style wordlists plus rule files in hashcat, GPU speeds of billions of guesses per second against unsalted MD5. Everything a policy of "season plus year" does is shrink the keyspace for the attacker. When you write reports, the recommendation writes itself: long passphrases or password managers, salted slow hashes (bcrypt, argon2), and rate limiting.',
  study: 'SecLab · Payload Lab · hash cracking workflow and wordlist strategy.'
});

HR.defineLab({
  id: 'crypto-03', cat: 'crypto', diff: 2,
  title: 'One Key, Two Messages',
  brief: 'A badly built "encryption feature" XORs every message with the SAME repeating key. You captured two ciphertexts. You also know, from protocol chatter, the full plaintext of the first message. With a known plaintext and its ciphertext, the key falls out for free, and with the key, every past and future message falls too.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'Known plaintext message 1: <span class="mono">attack at dawn by the river</span>' },
      { t: 'code', title: 'captured ciphertexts (hex)', text: 'c1 (message 1): ' + HR_MAT.STR['crypto-03-c1'] + '\nc2 (message 2): ' + HR_MAT.STR['crypto-03-c2'] },
      { t: 'p', html: 'Recover the key from message 1, then decrypt message 2. The plaintext of message 2 is the flag.' }
    ]
  },
  flagNote: 'XOR the key out of c2. Plain flag format.',
  hints: [
    'XOR is its own inverse: plaintext XOR key = ciphertext, so plaintext XOR ciphertext = key.',
    'Key length is 6 (the key repeats). Compute p1 XOR c1 byte by byte: the first 6 bytes repeat and they even spell a familiar word.',
    'The key is SecLab. XOR those 6 bytes against c2, cycling, and read the flag.'
  ],
  walk: 'Key recovery is one operation: <span class="mono">key[i] = plaintext1[i] XOR ciphertext1[i]</span> for each position, then the 6 byte key repeats. In Python: <span class="mono">key = bytes(a ^ b for a, b in zip(b"attack at dawn by the river", bytes.fromhex(c1)))</span>. Then decrypt message 2 the same way: <span class="mono">bytes(a ^ b for a, b in zip(bytes.fromhex(c2), key))</span>. Out comes <span class="mono">HR{xor_reuse_is_fatal}</span>. The property is iron: a key used twice is not a key, it is a transcription error waiting to be found. The same idea at industrial scale is what broke real World War II systems and what makes nonce reuse in AES-CTR catastrophic today.',
  study: 'SecLab · Payload Lab · XOR layer and key reuse notes.'
});

HR.defineLab({
  id: 'crypto-04', cat: 'crypto', diff: 2,
  title: 'Shift Work',
  brief: 'An old note from the club archive is unreadable, but the letters look like letters, the spacing is intact, and the braces survived. That profile is the oldest cipher in the book. Shift each letter a fixed number of positions and the message reappears. When you do not know the shift, you have only 25 keys to try.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The archived note:' },
      { t: 'code', title: 'archive/note.txt', text: HR_MAT.STR['crypto-04-ct'] },
      { t: 'p', html: 'Every letter was shifted forward by the same unknown amount. Braces and underscores were left alone. Decode the note.' }
    ]
  },
  flagNote: 'The decoded note is the flag.',
  hints: [
    'Only 25 possible shifts. You can brute force them all in minutes, or be smarter: the note contains braces, and the flag format starts with HR.',
    'H shifted by +7 gives O, which matches the first letter of the ciphertext. R shifted by +7 gives Y, the second letter. So the shift is 7.',
    'Shift every letter BACK by 7. The underscore and braces stay where they are.'
  ],
  walk: 'The ciphertext preserves word shapes and flag structure, so guess the header: <span class="mono">OY{...}</span> must be <span class="mono">HR{...}</span>, a shift of +7 (H to O, R to Y). Shift every letter back 7: O to H, Y to R, and so on. The plaintext: <span class="mono">HR{caesar_salad}</span>. Caesar is trivial, but it appears constantly as a first layer inside CTF chains and obfuscated malware configs, and its cousin ROT13 (shift 13) shows up in vanilla tooling. The takeaway is the attack shape though: a keyspace small enough to enumerate is no keyspace at all.',
  study: 'SecLab · Payload Lab · classical ciphers in the layer stack.'
});

HR.defineLab({
  id: 'crypto-05', cat: 'crypto', diff: 3,
  title: 'The Algorithm That Trusted Nobody',
  brief: 'The worst four letters in JWT history: none. Some libraries once accepted alg:none tokens, verifying nothing at all, because the header TOLD them to skip verification. You have a server that still does. The token below is unsigned: header, payload, and a trailing dot where the signature should be. To forge admin access you must know what belongs in the alg field.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The unsigned token:' },
      { t: 'code', title: 'Authorization: Bearer ...', text: HR_MAT.STR['crypto-05-token'] },
      { t: 'p', html: 'Decode the header (first segment, base64url) and read the alg value. When you forge a token with role:admin, what single word goes in that alg field?' }
    ]
  },
  flagNote: 'One word: the alg value that means "no signature at all".',
  hints: [
    'Split the token on the dots. Note the last segment is EMPTY: no signature was ever computed.',
    'Base64url decode the first segment and read the JSON. The alg claim holds your answer.',
    'The header reads {"alg":"none","typ":"JWT"}. The word is none.'
  ],
  walk: 'The token has three dot separated parts and the third is empty: an unsigned token. Decoding the header: <span class="mono">{"alg":"none","typ":"JWT"}</span>. The alg value is <span class="mono">none</span>, and the flag is <span class="mono">HR{none}</span>. The historical bug: libraries trusted the header to decide whether to verify, so an attacker set alg:none, edited the payload to role:admin, left the signature empty, and walked in. The fix teaches the deeper rule: the server must FIX its accepted algorithm list and reject everything else, because client controlled data (the header is client controlled!) must never select the verification mode. Every JWT attack since is a variation: weak HMAC secrets, RS256 to HS256 key confusion, kid header injection. Same root: trusting the token to describe how it should be checked.',
  study: 'SecLab · Payload Lab · JWT attack classes, the none attack is card one.'
});

HR.defineLab({
  id: 'crypto-06', cat: 'crypto', diff: 4,
  title: 'The Two Time Pad',
  brief: 'The crown jewel of crypto failures. A one time pad is unbreakable ONLY if the key is used exactly once and is truly random. This operator used the same pad for two messages. You have both ciphertexts and the plaintext of the first message. That is not a hint, that is the whole attack: the key cancels out and the second message lies bare.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'Known plaintext of message 1: <span class="mono">' + 'meet me at the old dock at midnight' + '</span>' },
      { t: 'code', title: 'intercepted (hex)', text: 'c1 = ' + HR_MAT.STR['crypto-06-c1'] + '\nc2 = ' + HR_MAT.STR['crypto-06-c2'] },
      { t: 'p', html: 'Recover the key from message 1, then decrypt message 2. The flag is message 2.' }
    ]
  },
  flagNote: 'Decrypt c2 with the recovered key. Plain flag format.',
  hints: [
    'Same attack as the XOR key reuse lab: XOR message 1 with c1, byte by byte, and you recover the pad (keystream) at every position.',
    'key = m1 XOR c1, byte by byte. Then m2 = c2 XOR that same keystream, byte by byte. Python with zip does this in two lines.',
    'bytes(a ^ b for a, b in zip(m1.encode(), bytes.fromhex(c1))) gives the keystream. XOR it against c2 and read the flag.'
  ],
  walk: 'Recover the keystream: <span class="mono">ks = bytes(a ^ b for a, b in zip(b"meet me at the old dock at midnight", bytes.fromhex(c1)))</span>. Then <span class="mono">m2 = bytes(a ^ b for a, b in zip(bytes.fromhex(c2), ks))</span>. The second message is <span class="mono">HR{never_reuse_a_key}</span>. Why this is fatal: with a pad reused, <span class="mono">c1 XOR c2 = m1 XOR m2</span>, the key vanishes from the equation entirely, leaving plaintext XOR plaintext, which falls to crib dragging (guess a likely word, drag it along, read fragments). This exact mistake decided the Venona counterintelligence breakthrough and still ships in hobby crypto today. The rule has no exceptions: a key is a number of USES equal to one.',
  study: 'SecLab · Payload Lab · one time pad and crib dragging notes.'
});
