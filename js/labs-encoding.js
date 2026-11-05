/* ============================================================
   HackRange labs · Encoding & Decoding (7 labs)
   The decoder mindset: layers, structure, and the difference
   between encoding and encryption.
   ============================================================ */

HR.defineLab({
  id: 'enc-01', cat: 'enc', diff: 1,
  title: 'The Obvious Base',
  brief: 'During a recon pass you photograph a sticky note on a monitor in the university lab. Back home you transcribe it: one line of seemingly random letters and numbers ending in two equal signs. Your teammate says "that is just noise". You are not so sure. Decoding is the first skill of payload work: before you can build encoded payloads, you must learn to peel them.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The sticky note contains exactly this string:' },
      { t: 'code', title: 'Transcribed note', text: HR_MAT.STR['enc-01'] },
      { t: 'p', html: 'Decode it and enter what it says as the flag. Flag format is <span class="mono">HR{...}</span>.' }
    ]
  },
  flagNote: 'The decoded text itself is the flag.',
  hints: [
    'Two equal signs at the end, letters and digits mixed, 4 character alphabet blocks. You have seen this format a hundred times.',
    'It is Base64. Decode it in a terminal (base64 -d), in CyberChef, or with any browser dev console trick you like.',
    'Run: echo SFJ7YmFzZTY0X2lzX25vdF9lbmNyeXB0aW9ufQ== | base64 -d  and read the output carefully. It is already in flag format.'
  ],
  walk: 'The string ends with == padding and uses only the Base64 alphabet, so it is Base64 encoded. In a terminal run <span class="mono">echo SFJ7YmFzZTY0X2lzX25vdF9lbmNyeXB0aW9ufQ== | base64 -d</span> or paste it into CyberChef with the From Base64 recipe. The decoded text is <span class="mono">HR{base64_is_not_encryption}</span>. The lesson: Base64 is an ENCODING, not encryption. Anyone can read it. You will meet it in JWTs, HTTP basic auth, data URIs and WAF evasion, so recognizing it on sight is table stakes.',
  study: 'SecLab · Payload Lab · Layer analysis section shows how to peel multiple encodings automatically.'
});

HR.defineLab({
  id: 'enc-02', cat: 'enc', diff: 1,
  title: 'Double Trouble',
  brief: 'A scanner report contains a cookie value that looks like Base64, but when you decode it once you get another pile of gibberish that ALSO looks like Base64. Lazy attackers encode twice. Lazy analysts give up after one layer. You are not lazy.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The cookie value is:' },
      { t: 'code', title: 'Cookie: session', text: HR_MAT.STR['enc-02'] },
      { t: 'p', html: 'Peel every layer. The final plaintext is the flag.' }
    ]
  },
  flagNote: 'Keep decoding until you get readable text.',
  hints: [
    'Decode once and look at the result. Does it still smell like Base64 (alphabet, padding)?',
    'It does. Decode the output a second time.',
    'Two layers of Base64 total. After the second decode you get readable text in flag format.'
  ],
  walk: 'Decode the value once: you get <span class="mono">SFJ7bGF5ZXJzX29uX2xheWVyc30=</span> style output, in other words another Base64 string, which proves the data was encoded twice. Decode that result again and the readable flag appears: <span class="mono">HR{layers_on_layers}</span>. Attackers chain encodings precisely to defeat one-shot tools. When you write a decoder script, always loop: decode, check readability, decode again if needed. That loop idea is exactly how real fuzzers and payload generators handle arbitrary nesting.',
  study: 'SecLab · Payload Lab · try stacking two layers and watch the analyzer handle them.'
});

HR.defineLab({
  id: 'enc-03', cat: 'enc', diff: 1,
  title: 'Hex Marks the Spot',
  brief: 'A firmware analysis exercise hands you a memory dump region. The engineer next to you squints: "48 52 7b... every value is under 0x80, that is not random data, that is TEXT in disguise." ASCII text stored as raw bytes always looks like this in hex dumps.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The dumped region is:' },
      { t: 'code', title: 'Memory region 0x004012a0', text: HR_MAT.STR['enc-03'] },
      { t: 'p', html: 'Recover the string and enter it as the flag.' }
    ]
  },
  flagNote: 'Two hex digits equal one character.',
  hints: [
    'Every two hex digits are one byte, one ASCII character. 0x48 is the letter H. Notice the pattern.',
    'Split into pairs and map through an ASCII table, or use a tool: xxd -r -p, or CyberChef From Hex.',
    'echo 48527b6865785f69735f6a7573745f62797465737d | xxd -r -p  gives you the flag.'
  ],
  walk: 'Hex encodes each byte as two characters: <span class="mono">48 52 7b 68 65 78 ...</span> maps to <span class="mono">H R { h e x ...</span>. Run <span class="mono">echo 48527b6865785f69735f6a7573745f62797465737d | xxd -r -p</span> to decode. The flag is <span class="mono">HR{hex_is_just_bytes}</span>. Hex appears constantly in real work: hex encoded payloads that dodge quote filters (0x61646d696e), string obfuscation in malware, and debug output. Reading it by sight, at least the ASCII range, is a daily driver skill.',
  study: 'SecLab · Payload Lab · hex layer card explains hex in filter evasion context.'
});

HR.defineLab({
  id: 'enc-04', cat: 'enc', diff: 2,
  title: 'Percent Signs All the Way Down',
  brief: 'You are reviewing proxy logs and find a suspicious request. The parameter value contains percent signs, which means URL encoding, but something feels off: there are percent signs that decode INTO MORE PERCENT SIGNS. That usually means the value was encoded twice, often by two different layers of the same app stack.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The log entry parameter is:' },
      { t: 'code', title: 'GET /search?q=...', text: HR_MAT.STR['enc-04'] },
      { t: 'p', html: 'Decode the parameter value completely and submit the result.' }
    ]
  },
  flagNote: 'The percent signs nest.',
  hints: [
    '%25 decodes to %. That means the first decode produces ANOTHER percent encoded string.',
    'Decode twice: once to get HR%7B...%7D, once more to get the readable flag.',
    'In Burp Repeater or CyberChef: From URL Encode, twice. The result is plain text in flag format.'
  ],
  walk: 'The value <span class="mono">HR%257B...</span> contains <span class="mono">%25</span>, which decodes to a literal <span class="mono">%</span>. After one decode you get <span class="mono">HR%7Bpercent_double_trouble%7D</span>, still URL encoded. Decode again for the flag: <span class="mono">HR{percent_double_trouble}</span>. Double URL encoding is also an ATTACK technique: a WAF decodes once, sees nothing dangerous, passes the request, and the backend decodes again producing the live payload. When a payload mysteriously fails against a filter, try encoding it one more time.',
  study: 'SecLab · Payload Lab · encoding layer cards show URL encoding rules in detail.'
});

HR.defineLab({
  id: 'enc-05', cat: 'enc', diff: 2,
  title: 'The Unicode Trick',
  brief: 'A web app stores user display names. A malicious profile name appears in the database as a sequence of backslash-u sequences. The junior analyst calls it "encrypted". It is not. It is unicode escaping, the JSON way of writing non-ASCII characters. Attackers use unicode tricks to smuggle payloads past naive filters that match on raw characters only.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The stored profile name is:' },
      { t: 'code', title: 'profiles.display_name', text: HR_MAT.STR['enc-05'] },
      { t: 'p', html: 'Recover the readable string and submit it.' }
    ]
  },
  flagNote: 'Four hex digits after every backslash u.',
  hints: [
    'Each \\uXXXX is one character whose codepoint is XXXX in hex. \\u0048 is H.',
    'Look up a few codepoints in an ASCII table and the pattern will be obvious. Or paste the whole thing into a JSON parser: it decodes escapes natively.',
    'In Python: print("the string") with the escapes, or json.loads. In JS: any console. The result is the flag.'
  ],
  walk: 'Unicode escapes write each character as <span class="mono">\\uXXXX</span> where XXXX is the hex codepoint. <span class="mono">\\u0048</span> is H, <span class="mono">\\u0052</span> is R, <span class="mono">\\u007b</span> is the opening brace. Decode all of them for the flag: <span class="mono">HR{unicode_is_not_safety}</span>. The security angle: filters that block raw <span class="mono">&lt;script&gt;</span> can be bypassed when the app decodes unicode AFTER the filter runs. Order of operations bugs like this are exactly how real WAF bypasses happen. When you see backslash-u soup, decode before you judge what it contains.',
  study: 'SecLab · Payload Lab · unicode and overlong encoding discussion in the context section.'
});

HR.defineLab({
  id: 'enc-06', cat: 'enc', diff: 3,
  title: 'Layer Cake',
  brief: 'A CTF qualifier, final crypto-lite challenge. The organizers promise "nothing cryptographic, just patience". The file contains one Base64 blob. Your teammate decodes it and frowns: "the result is neither text nor hex... wait, actually it IS hexy, but wrong." Sometimes a layer changes the ALPHABET rather than the structure.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The challenge file contains:' },
      { t: 'code', title: 'challenge.txt', text: HR_MAT.STR['enc-06'] },
      { t: 'p', html: 'Three layers stand between you and the flag. Peel them all.' }
    ]
  },
  flagNote: 'Base64 on the outside, then a classic alphabet shift on letters only, then hex.',
  hints: [
    'Decode the Base64. The output contains only 0-9 and the letters a-s. Which decoder accepts that alphabet? Hex, but it will not decode to text... unless the letters are wrong.',
    'The letters are shifted. Try ROT13: it only affects letters, digits pass through untouched, which fits perfectly.',
    'Chain: Base64 decode, then ROT13, then hex decode. The hex string even starts with 48 52, the ASCII of HR.'
  ],
  walk: 'Step 1: Base64 decode the blob to get <span class="mono">48527d... nonsense like 48527o636861696c...</span> a mix of hex digits and letters a-s. Step 2: recognize that hex only uses a-f, but a-s is exactly what you get from hex digits a-f rotated by 13 (a becomes n, b becomes o, and so on). Apply ROT13: <span class="mono">48527b...</span> now pure hex. Step 3: hex decode for the flag <span class="mono">HR{chain_reaction}</span>. The meta lesson: identify each layer by its ALPHABET and STRUCTURE before decoding. Hex means 0-9 a-f. Base64 means A-Z a-z 0-9 + / with = padding. ROT13 preserves the alphabet shape. Structure tells you what to try next.',
  study: 'SecLab · Payload Lab · layer tree is built for exactly this kind of chain analysis.'
});

HR.defineLab({
  id: 'enc-07', cat: 'enc', diff: 4,
  title: 'JWT Archaeology',
  brief: 'You captured a session token from a test application. It has two base64url-ish segments and a signature, so it is a JWT. The claim set contains a memo field. Somewhere inside that structure the developer left a flag. JWTs are never encrypted by default: everything before the signature is readable by anyone who holds the token.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The captured token is:' },
      { t: 'code', title: 'Authorization: Bearer ...', text: HR_MAT.STR['enc-07'] },
      { t: 'p', html: 'Decode the token, inspect every claim, and follow what you find. The flag is hidden one level deeper than the obvious.' }
    ]
  },
  flagNote: 'Three segments, two dots. Decode the first two. Then look closer at the values.',
  hints: [
    'Split on the dots: header, payload, signature. Base64url decode the first two segments. Remember: no padding characters.',
    'The payload has a memo claim whose value is itself base64url. Decode that too.',
    'Full chain: decode payload segment, read the memo field, base64url decode the memo value. That is your flag.'
  ],
  walk: 'A JWT is three base64url parts: <span class="mono">header.payload.signature</span>. Decode part one: <span class="mono">{"alg":"HS256","typ":"JWT"}</span>. Decode part two: <span class="mono">{"sub":"1337-student","role":"user","memo":"..."}</span>. The memo value is itself base64url, decode it for the flag: <span class="mono">HR{three_part_harmony}</span>. Two lessons. First: JWT payloads are BASE64, not encryption, so any token you capture leaks its claims. Second: nested encodings are a pattern, and a claim that looks like an encoding probably is one. Grab jwt.io or CyberChef and never treat a JWT as a black box again.',
  study: 'SecLab · Payload Lab · JWT structure breakdown, and the crypto labs below attack JWTs directly.'
});
