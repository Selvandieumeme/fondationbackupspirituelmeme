const readline = require('readline');

// Asire MEME_QA deja chaje anvan REPL lan kòmanse
function startLocalREPL() {
  if (!MEME_QA || MEME_QA.length === 0) {
    console.log("MEME_QA pa chaje toujou! Tanpri tann li fini chaje...");
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Tape kesyon ou > '
  });

  console.log("REPL MEME_QA demare. Tape 'exit' pou sòti.");
  rl.prompt();

  rl.on('line', (line) => {
    const question = line.trim();
    if (question.toLowerCase() === 'exit') {
      rl.close();
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

    rl.prompt();
  }).on('close', () => {
    console.log("REPL MEME_QA fini. Bye!");
    process.exit(0);
  });
}


