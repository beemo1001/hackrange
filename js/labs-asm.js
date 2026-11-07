/* ============================================================
   HackGrid labs · Assembly Reading (6 labs)
   x86-64 System V, Intel syntax. Read code like a story:
   calling conventions, loops, overflow patterns, hidden data.
   ============================================================ */

HR.defineLab({
  id: 'asm-01', cat: 'asm', diff: 1,
  title: 'The Two Register Function',
  brief: 'Your first reverse engineering exercise. A stripped binary contains a tiny function. No name, no symbols, five instructions. Before you can exploit code you must be able to READ it, and reading starts with the calling convention: where arguments arrive and where results leave.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The disassembly of the mystery function:' },
      { t: 'code', title: 'mystery (x86-64, Intel syntax)', text: 'mystery:\n    push rbp\n    mov  rbp, rsp\n    mov  eax, edi\n    add  eax, esi\n    pop  rbp\n    ret' },
      { t: 'p', html: 'On x86-64 System V, the FIRST argument arrives in <span class="mono">edi</span> and the SECOND in <span class="mono">esi</span>. The return value leaves in <span class="mono">eax</span>. If the program calls <span class="mono">mystery(7, 35)</span>, what value is in eax after it returns?' }
    ]
  },
  flagNote: 'Just the number.',
  hints: [
    'Trace one instruction at a time. mov eax, edi copies the first argument (7) into eax.',
    'add eax, esi adds the second argument (35) to whatever is in eax (7).',
    '7 + 35 = 42. The function is simply addition.'
  ],
  walk: 'Line by line: <span class="mono">push rbp / mov rbp, rsp</span> build the stack frame (boilerplate). <span class="mono">mov eax, edi</span> puts the first argument, 7, into the return register. <span class="mono">add eax, esi</span> adds the second argument, 35, giving 42. <span class="mono">pop rbp / ret</span> tear down the frame and return with eax = 42. The flag is <span class="mono">HR{42}</span>. Memorize the register roles once and every stripped binary becomes readable: arguments in rdi, rsi, rdx, rcx, r8, r9, return in rax. This same discipline scales to spotting vulnerabilities later: you cannot break what you cannot read.',
  study: 'SecLab · ASM Annotator · paste this function and read the per instruction notes.'
});

HR.defineLab({
  id: 'asm-02', cat: 'asm', diff: 1,
  title: 'The Loop That Counts',
  brief: 'A crackme binary calls a helper on your input before checking a license code. The helper has a familiar shape: a counter, a byte comparison against zero, and a jump back. Every C programmer has written this function. Name it.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The helper function:' },
      { t: 'code', title: 'helper (x86-64, Intel syntax)', text: 'helper:\n    push rbp\n    mov  rbp, rsp\n    mov  rax, -1\n.loop:\n    inc  rax\n    cmp  byte ptr [rdi + rax], 0\n    jne  .loop\n    pop  rbp\n    ret' },
      { t: 'p', html: 'The first argument in rdi is a pointer to a NUL terminated string. What C standard library function does this replicate? (one word)' }
    ]
  },
  flagNote: 'One word, the function name.',
  hints: [
    'The loop reads one byte at a time: [rdi + rax] with rax increasing from 0.',
    'It stops when the byte equals 0. In C strings, what marks the end?',
    'It counts bytes until the NUL terminator. That is exactly what strlen does.'
  ],
  walk: '<span class="mono">rax</span> starts at -1, increments to 0, reads <span class="mono">byte [rdi + 0]</span>, the first character. As long as the byte is not zero, <span class="mono">jne .loop</span> jumps back and increments. The loop exits when the byte is 0, the C string terminator, and rax holds the number of characters before it: the string length. This is <span class="mono">strlen</span>, hand rolled. The flag is <span class="mono">HR{strlen}</span>. Recognizing common function shapes (strlen, memcpy, atoi, xor loops) in stripped binaries is how reversers orient themselves fast: you stop reading instructions and start recognizing silhouettes.',
  study: 'SecLab · ASM Annotator · loop patterns section.'
});

HR.defineLab({
  id: 'asm-03', cat: 'asm', diff: 2,
  title: 'The Copy With No Brakes',
  brief: 'You are auditing a firmware image for memory corruption. One function accepts a pointer to attacker controlled data and copies it into a local buffer. The copy loop has exactly one stopping condition. Look for the condition that is MISSING, because the bug class you find here pays bounties in every product on earth.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The suspicious function:' },
      { t: 'code', title: 'copy_and_log (x86-64, Intel syntax)', text: 'copy_and_log:\n    push rbp\n    mov  rbp, rsp\n    sub  rsp, 16          ; 16 byte local buffer\n    lea  rbx, [rbp - 16]  ; destination: the buffer\n.loop:\n    mov  al, [rdi]        ; read one byte from source (user input)\n    mov  [rbx], al        ; write it into the buffer\n    inc  rdi\n    inc  rbx\n    cmp  al, 0            ; stop only at NUL\n    jne  .loop\n    lea  rdi, [rbp - 16]\n    call log_string\n    leave\n    ret' },
      { t: 'p', html: 'Name the vulnerability class. (two words or the underscore form)' }
    ]
  },
  flagNote: 'The classic two word name works, so does the underscore form.',
  hints: [
    'The destination buffer is 16 bytes, allocated with sub rsp, 16. How many bytes can the loop write?',
    'The loop stops only when it meets a NUL byte in the SOURCE. Who decides how long the source is?',
    'The attacker does. Twenty input bytes into a sixteen byte buffer: past-the-end writes. That is the class.'
  ],
  walk: 'The buffer is 16 bytes, but the loop copies until the SOURCE ends, with zero checks against the destination size. An attacker sending 100 bytes overwrites 84 bytes past the buffer: saved registers, the return address, whatever sits above. This is a stack buffer overflow, the bug class behind countless CVEs and the ancestor of every memory corruption exploit. The flag is <span class="mono">HR{buffer_overflow}</span>. In compiled real world code, look for the silhouette: a local buffer via <span class="mono">sub rsp, N</span>, a copy loop with only a source condition, and no canary check before <span class="mono">ret</span>. Modern compilers insert stack canaries, so their absence is itself a finding.',
  study: 'SecLab · ASM Annotator · stack frames and the canary discussion.'
});

HR.defineLab({
  id: 'asm-04', cat: 'asm', diff: 2,
  title: 'The Constant Decryptor',
  brief: 'Malware hides its strings from antivirus signatures by storing them encrypted and decrypting at runtime. This function decrypts in place using the world\'s cheapest cipher: every byte XORed with a single constant key. Recover the plaintext and you recover the flag.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The decryptor and the encrypted blob:' },
      { t: 'code', title: 'decrypt (x86-64, Intel syntax)', text: 'decrypt:\n    lea  rsi, [rip + secret]\n    mov  rcx, 12\n.loop:\n    mov  al, [rsi]\n    xor  al, 0x37\n    mov  [rsi], al\n    inc  rsi\n    loop .loop\n    ret\n\nsecret:\n    .byte ' + HR_MAT.STR['asm-04-bytes'] },
      { t: 'p', html: 'XOR each stored byte with 0x37 to recover the plaintext. What is it?' }
    ]
  },
  flagNote: 'The decrypted string is the flag.',
  hints: [
    'The key is right there in the instruction: xor al, 0x37. The loop runs 12 times, once per byte.',
    'Take the first byte 0x7f. 0x7f XOR 0x37 = 0x48, which is the ASCII letter H. That is a promising start for a flag format.',
    'Keep going: 0x65 XOR 0x37 = 0x52 (R), 0x4c XOR 0x37 = 0x7b ({)... decode all 12 bytes.'
  ],
  walk: 'XOR with a single byte key is symmetric: apply it twice and you get the original back, which is why the same routine encrypts and decrypts. Byte by byte: 0x7f^0x37=0x48 (H), 0x65^0x37=0x52 (R), 0x4c^0x37=0x7b ({), and so on for all 12 bytes. The plaintext: <span class="mono">HR{xor_king}</span>. Any time you see a tight loop of xor with a constant over a data section, you are looking at string obfuscation. CyberChef with XOR key 37 hex, or a one line Python: <span class="mono">bytes(b ^ 0x37 for b in blob)</span>.',
  study: 'SecLab · ASM Annotator · XOR idioms, then SecLab Payload Lab crypto layers.'
});

HR.defineLab({
  id: 'asm-05', cat: 'asm', diff: 3,
  title: 'Three Arguments In Flight',
  brief: 'A binary calls an internal math routine. Before the call, it loads three registers with three constants. To predict the program you need the full calling convention: not just that rdi is first, but the exact ORDER of all six argument registers, and which one carries which value.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The caller:' },
      { t: 'code', title: 'caller (x86-64, Intel syntax)', text: 'compute:\n    push rbp\n    mov  rbp, rsp\n    mov  edi, 5\n    mov  esi, 10\n    mov  edx, 15\n    call math_func\n    pop  rbp\n    ret\n\n; math_func(a, b, c) returns a * b + c\n; a is the FIRST argument, b the second, c the third' },
      { t: 'p', html: 'After <span class="mono">call math_func</span> returns, what value is in <span class="mono">eax</span>?' }
    ]
  },
  flagNote: 'Just the number.',
  hints: [
    'System V order: 1st argument rdi, 2nd rsi, 3rd rdx. Map each mov to its parameter name.',
    'edi=5 becomes a, esi=10 becomes b, edx=15 becomes c. So the call is math_func(5, 10, 15).',
    'Apply the formula: 5 * 10 + 15 = 65.'
  ],
  walk: 'Register to argument mapping: <span class="mono">edi=5</span> is argument a, <span class="mono">esi=10</span> is b, <span class="mono">edx=15</span> is c. The call is <span class="mono">math_func(5, 10, 15)</span> and the formula a*b+c gives <span class="mono">5*10+15 = 65</span>. The flag is <span class="mono">HR{65}</span>. The full order to burn into memory: rdi, rsi, rdx, rcx, r8, r9, then the stack for arguments seven and up. Windows x64 uses a DIFFERENT order (rcx, rdx, r8, r9), so identify the platform first. Calling conventions are the grammar of binary exploitation: ROP chains and format string exploits are literally arguments placed into these registers by hand.',
  study: 'SecLab · ASM Annotator · calling convention tables for both major ABIs.'
});

HR.defineLab({
  id: 'asm-06', cat: 'asm', diff: 4,
  title: 'The Password in Plain Sight',
  brief: 'A licensing check compares your serial key against a hardcoded secret, byte by byte, before unlocking the software. Developers hide this behind layers of obfuscation. This one did not. The entire password is sitting in the data section, one immediate per byte. Read the constants, decode them, and you have bypassed the check without ever running the binary.',
  env: {
    type: 'static',
    blocks: [
      { t: 'p', html: 'The license check:' },
      { t: 'code', title: 'check_license (x86-64, Intel syntax)', text: 'check_license:\n    lea  rsi, [rip + secret]\n    mov  rcx, 0\n.next_byte:\n    mov  al, [rdi + rcx]   ; your input, byte rcx\n    cmp  al, [rsi + rcx]   ; compare with secret byte\n    jne  .reject\n    inc  rcx\n    cmp  rcx, 29\n    jl   .next_byte\n    mov  eax, 1            ; accepted\n    ret\n.reject:\n    mov  eax, 0\n    ret\n\nsecret:\n    .byte ' + HR_MAT.STR['asm-06-bytes'] },
      { t: 'p', html: 'The comparison runs for 29 bytes. Decode the secret blob and enter it.' }
    ]
  },
  flagNote: 'The secret blob decodes to the flag itself.',
  hints: [
    'The secret is 29 bytes of ASCII, written as hex immediates. 0x48 is H, 0x52 is R, 0x7b is {. That is a flag header.',
    'Two hex digits per character. Convert the whole sequence: 0x73=s, 0x74=t, 0x61=a, 0x74=t... it spells a word about keys.',
    'The string is HR{static_key_in_plain_sight}. Any hex to ASCII tool confirms it.'
  ],
  walk: 'The routine walks 29 bytes comparing your input against a static array. No hash, no salt, no server check: a simple memory comparison. Converting the .byte sequence from hex to ASCII yields <span class="mono">HR{static_key_in_plain_sight}</span>, the accepted key AND the flag. The lesson cuts both ways. As an attacker: constants in binaries are free intel, and tools like strings, radare2 or a five line Python script extract them instantly, which is why hardcoded secrets are banned in serious code review. As a defender: this is why real license checks use server side validation, or at minimum key derivation. Anything embedded in the binary IS in the attacker\'s hands.',
  study: 'SecLab · ASM Annotator · data section references, then try annotating this function.'
});
