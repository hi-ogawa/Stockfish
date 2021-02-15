const Stockfish = require("./stockfish.js");

const runRepl = async (stockfish) => {
  const readline = require("readline");
  const readline_iface = readline.createInterface({ input: process.stdin });
  for await (const command of readline_iface) {
    if (command == 'quit') { break; }
    stockfish.postMessage(command);
  }
  stockfish.postMessage('quit');
};

const main = async () => {
  const stockfish = await Stockfish();

  const argv = process.argv.slice(2);
  if (argv.length > 0) {
    stockfish.postMessage(argv.join(' '));
    stockfish.postMessage('quit')
  } else {
    runRepl(stockfish);
  }
}

main();
