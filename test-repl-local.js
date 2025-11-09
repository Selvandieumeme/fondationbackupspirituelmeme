// test-repl-local.js
const readline = require('readline');

// =======================================================
// Sipoze MEME_QA deja defini nan inspecteurmeme.js
// =======================================================
if (typeof MEME_QA === 'undefined') {
  console.error("❌ MEME_QA pa defini. Asire w ke inspecteurmeme.js chaje avan sa.");
  process.exit(1);
}

// =======================================================
// Local query function
// =======================================================
function testLocalQuery(question) {
  if (!MEME_QA || MEME_QA.length === 0) {
    console.log("MEME_QA pa chaje toujou!");
    return;
  }

  const answer = MEME_QA.find(entry =>
    entry.question.toLowerCase().includes(question.toLowerCase())
  );

  if (answer) {
    console.log(">>> Repons jwenn:", answer.answer);
  } else {
    console.log(">>> Pa gen repons ki koresponn ak:", question);
  }
}

// =======================================================
// REPL setup
// =======================================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '🔹 Kesyon ou: '
});

rl.prompt();

rl.on('line', (line) => {
  const question = line.trim();
  if (question.toLowerCase() === 'exit') {
    console.log('👋 Bye!');
    rl.close();
    process.exit(0);
  }
  testLocalQuery(question);
  rl.prompt();
}).on('close', () => {
  console.log('✅ REPL fini.');
  process.exit(0);
});
