const fs = require('fs');

// 1. Write to a file (creates the file if it doesn't exist)
fs.writeFile('example.txt', 'Hello, Node.js File System!', (err) => {
  if (err) throw err;
  console.log('✅ File created and data written!');
});

// 2. Read the file
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('📖 File content:', data);
});

// 3. Append to the file
fs.appendFile('example.txt', '\nThis is appended text.', (err) => {
  if (err) throw err;
  console.log('➕ Text appended to file.');
});

// 4. Rename the file
fs.rename('example.txt', 'renamed.txt', (err) => {
  if (err) throw err;
  console.log('✏️ File renamed to renamed.txt');
});

// 5. Delete the file
// ⚠️ Delay to make sure rename happens first
setTimeout(() => {
  fs.unlink('renamed.txt', (err) => {
    if (err) throw err;
    console.log('🗑️ File deleted.');
  });
}, 2000);
