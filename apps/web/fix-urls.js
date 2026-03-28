// Save this as fix-urls.js in apps/web/ then run: node fix-urls.js
const fs   = require('fs');
const path = require('path');

let fixed = 0;

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', '.git', 'out'].includes(f)) return;
      walk(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes("'http://localhost:4000'") || content.includes('"http://localhost:4000"')) {
        // Add API const after 'use client'; or at top if no use client
        if (!content.includes('process.env.NEXT_PUBLIC_API_URL')) {
          // Replace all occurrences safely inside backtick template literals
          content = content.replaceAll(
            "'http://localhost:4000'",
            "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`"
          );
          content = content.replaceAll(
            '"http://localhost:4000"',
            "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`"
          );
          fs.writeFileSync(full, content, 'utf8');
          console.log('✓ Fixed:', f);
          fixed++;
        }
      }
    }
  });
}

walk('./app');
console.log(`\nDone — fixed ${fixed} files`);