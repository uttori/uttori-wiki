const input = `Mode 7 - Mode 7 is extremely different from all the modes before. You have one background of 256 colors.
However, the tilemap and character map are laid out completely differently.
The tilemap and character map are interleaved, with the character data being in the high byte of each word and the tilemap data being in the low byte (note that in hardware, VRAM is set up such that odd bytes are in one RAM chip and even in another, and each RAM chip has a separate address bus.
The Mode 7 renderer probably accesses the two chips independently).
The tilemap is 128x128 entries of one byte each, with that one byte being simply a character map index.
The character data is stored packed pixel rather than bitplaned, with one pixel per byte.
Thus, to calculate the tilemap entry byte address for an X and Y position in the playing field, you would calculate:

\`\`\`
(((Y & ~7) << 4) + (X >> 3)) << 1
\`\`\`

To find the byte address of the pixel, you would calculate:

\`\`\`
(((TileData << 6) + ((Y & 7) << 3) + (X & 7)) << 1) + 1
\`\`\`

Note that bits 4-7 of \`$2105\` are ignored, as are \`$2107-$210C\`.
They can be considered to be always 0. The next odd thing about Mode 7 is that you have full matrix transformation abilities.
With creative use of HDMA, you can even change the matrix per scanline.
See registers \`$211B-$2120\` for details on the matrix transformation formula. The entire screen can be flipped with bits 0-1 of \`$211A (M7SEL)\`.
And finally, the playing field can actually be made larger than the tilemap.
If bit 7 of \`$211A\` is set, bit 6 of \`$211A\` controls what is seen filling the space surrounding the map.
The background priorities are:

\`\`\`
Sprites with priority 3
Sprites with priority 2
Sprites with priority 1
BG1
Sprites with priority 0
\`\`\`

When bit 6 of \`$2133\` is set, you get a related mode known as Mode 7 EXTBG.
In this mode, you get a BG2 with 128 colors, which uses the same tilemap and character data as BG1 but interprets the high bit of the pixel as a priority bit.
The priority map is:

\`\`\`
Sprites with priority 3
Sprites with priority 2
BG2 pixels with priority 1
Sprites with priority 1
BG1
Sprites with priority 0
BG2 pixels with priority 0
\`\`\`

Note that the BG1 pixels (if BG1 is enabled) will usually completely obscure the low-priority BG2 pixels.
BG2 uses the Mode 7 scrolling registers ( \`$210D-E\` ) rather than the 'normal' BG2 ones ( \`$210F-10\` ).
Subscreen, pseudo-hires, math, and clip windows work as normal; keep in mind OBJ and that you can do things like enable BG1 on main and BG2 on sub if you so desire.
Mosaic is somewhat weird, see the section on Mosaic below.
Note that BG1, being a 256-color background, can do Direct Color mode (in this case, of course, there is no palette value so you're limited to 256 colors instead of 2048).
BG2 does not do direct color mode, since it is only 7-bit.
Rendering the Backgrounds - Rendering a background is simple.
1.) Get your H and V offsets (either by reading the appropriate registers or by doing the offset-per-tile calculation).
2.) Use those to translate the screen X and Y into playing field X and Y (Note this is rather complicated for Mode 7)
3.) Look up the tilemap for those coordinates
4.) Use that to find the character data
5.) If necessary, de-bitplane it and stick it in a buffer. See the section Rendering the Screen for more details.
Unresolved Issues -
1.) What happens to the very first pixel on the scanline in Hires Math?
2.) Various registers still need to know when writing to them is effective.`;

// const input = `Mode 7 - Mode 7 is extremely different from all the modes before. You have one background of 256 colors.
// However, the tilemap and character map are laid out completely differently.
// The tilemap and character map are interleaved, with the character data being in the high byte of eac...
// The Mode 7 renderer probably accesses the two chips independently).
// The tilemap is 128x128 entries of one byte each, with that one byte being simply a character map ind...
// The character data is stored packed pixel rather than bitplaned, with one pixel per byte. Thus, to c...
// \`\`\`
// (((Y&~7)<<4) + (X>>3))<<1
// \`\`\`
//   To find the byte address of the pixel, you'd calculate:
// \`\`\`
//  (((TileData<<6) + ((Y&7)<<3) + (X&7))<<1) + 1
// \`\`\``;

const lines = input.split('\n');

function checkUnicode(text, label) {
  // Check for any non-ASCII characters
  const unicodeChars = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127 || code === 0) {
      unicodeChars.push({
        char: text[i],
        code: code,
        hex: '\\u' + code.toString(16).padStart(4, '0'),
        position: i
      });
    }
  }

  if (unicodeChars.length > 0) {
    console.log(`  🔤 Unicode found in ${label}:`);
    unicodeChars.forEach(u => {
      console.log(`    Position ${u.position}: "${u.char}" (${u.hex}, decimal ${u.code})`);
    });
  }

  return unicodeChars;
}

async function testEmbedding(text, label) {
  try {
    const response = await fetch(`http://localhost:11434/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: "bge-m3:latest", input: text, prompt: text }),
    });
    if (!response.ok) {
      const msg = await response.text();
      console.log(`❌ ${label}: ${response.status} - ${msg}`);
      return false;
    } else {
      const data = await response.json();
      console.log(`✅ ${label}: OK (embedding length: ${data.embedding?.length || 0})`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${label}: ${error.message}`);
    return false;
  }
}

async function debugLines() {
  console.log(`Total lines: ${lines.length}\n`);

  // Check each line for unicode
  console.log('=== Checking all lines for unicode ===');
  lines.forEach((line, idx) => {
    const unicode = checkUnicode(line, `Line ${idx + 1}`);
  });
  console.log('');

  // Step 1: Test full input
  console.log('=== Step 1: Testing full input ===');
  const fullSuccess = await testEmbedding(input, 'Full text');

  if (fullSuccess) {
    console.log('\n✅ Full input works! No issue found.');
    return;
  }

  console.log('\n❌ Full input fails. Finding minimal subset...\n');

  // Step 2: Binary search to find first failing line count
  console.log('=== Step 2: Binary search for breaking point ===');
  let left = 1;
  let right = lines.length;
  let breakingPoint = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const testText = lines.slice(0, mid).join('\n');
    console.log(`Testing lines 1-${mid}...`);
    const success = await testEmbedding(testText, `Lines 1-${mid}`);

    if (success) {
      left = mid + 1;
    } else {
      breakingPoint = mid;
      right = mid - 1;
    }
  }

  if (breakingPoint === -1) {
    console.log('\n🤔 Could not find breaking point');
    return;
  }

  console.log(`\n🔍 Breaking point: lines 1-${breakingPoint} FAILS, but 1-${breakingPoint - 1} WORKS`);

  // Step 3: Test if it's just the last line
  console.log('\n=== Step 3: Testing if line', breakingPoint, 'alone causes issue ===');
  const lastLineSuccess = await testEmbedding(lines[breakingPoint - 1], `Line ${breakingPoint} alone`);

  if (!lastLineSuccess) {
    console.log(`\n✅ Found it! Line ${breakingPoint} alone breaks embedding:`);
    console.log(`"${lines[breakingPoint - 1]}"`);
    return;
  }

  // Step 4: Find minimal subset from the breaking point
  console.log('\n=== Step 4: Finding minimal subset ===');
  const failingLines = lines.slice(0, breakingPoint);

  // Try removing each line one at a time to find which are necessary
  console.log(`Testing which lines in 1-${breakingPoint} are required for failure...\n`);

  const required = new Array(failingLines.length).fill(true);

  for (let i = 0; i < failingLines.length; i++) {
    // Try removing this line
    const testLines = failingLines.filter((_, idx) => idx !== i);
    const testText = testLines.join('\n');
    console.log(`Testing without line ${i + 1}...`);
    const success = await testEmbedding(testText, `Without line ${i + 1}`);

    if (success) {
      required[i] = true; // This line is required for the failure
      console.log(`  → Line ${i + 1} is REQUIRED for failure`);
    } else {
      required[i] = false; // Not necessary
      console.log(`  → Line ${i + 1} is NOT required`);
    }
  }

  const minimalLines = failingLines.filter((_, idx) => required[idx]);
  console.log(`\n=== Minimal failing subset (${minimalLines.length} lines) ===`);
  minimalLines.forEach((line, idx) => {
    const originalIdx = failingLines.findIndex(l => l === line);
    console.log(`Line ${originalIdx + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
  });

  console.log('\n=== Verifying minimal subset fails ===');
  const minimalSuccess = await testEmbedding(minimalLines.join('\n'), 'Minimal subset');

  if (minimalSuccess) {
    console.log('\n⚠️  Minimal subset actually passes! Something went wrong in analysis.');
    return;
  }

  // Step 5: Verify each line in minimal subset is truly necessary
  console.log('\n=== Step 5: Verifying each line in minimal subset is necessary ===');
  const trulyRequired = [];

  for (let i = 0; i < minimalLines.length; i++) {
    const testLines = minimalLines.filter((_, idx) => idx !== i);
    if (testLines.length === 0) {
      console.log(`\nOnly one line in minimal set, must be required.`);
      trulyRequired.push(minimalLines[i]);
      break;
    }

    const testText = testLines.join('\n');
    console.log(`\nRemoving line ${i + 1} from minimal set: "${minimalLines[i].substring(0, 80)}${minimalLines[i].length > 80 ? '...' : ''}"`);
    const success = await testEmbedding(testText, `Minimal set without line ${i + 1}`);

    if (success) {
      console.log(`  ✅ REQUIRED - removing this line makes it work`);
      trulyRequired.push(minimalLines[i]);
    } else {
      console.log(`  ❌ NOT REQUIRED - still fails without this line`);
    }
  }

  console.log(`\n\n${'='.repeat(80)}`);
  console.log('FINAL RESULT: Absolute minimal reproducible subset');
  console.log(`${'='.repeat(80)}`);
  console.log(`\nLines required: ${trulyRequired.length}\n`);
  trulyRequired.forEach((line, idx) => {
    console.log(`[${idx + 1}] ${line}`);
    checkUnicode(line, `  Line ${idx + 1}`);
  });

  console.log('\n--- Combined Text ---');
  console.log(trulyRequired.join('\n'));
  console.log(`\n${'='.repeat(80)}`);
}

debugLines();

