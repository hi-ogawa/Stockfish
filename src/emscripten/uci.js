const readline = require("readline");
const Stockfish = require("./stockfish.js");

const runRepl = async (Module) => {
  const readline_iface = readline.createInterface({ input: process.stdin });
  for await (const command of readline_iface) {
    Module.postCustomMessage(command);
    if (command == 'quit') { break; }
  }
};

const main = async () => {
  const Module = await Stockfish();

  const argv = process.argv.slice(2);
  if (argv.length > 0) {
    Module.postCustomMessage(argv.join(' '));
    return;
  }
  runRepl(Module);
}

main();
