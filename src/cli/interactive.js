import readline from "readline";

const interactive = () => {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
  });

  rl.prompt();

  rl.on("line", function (line) {
    var cmd = line.trim().toLowerCase();   // small tolerance for more comfortable use

    if (cmd === "uptime") {
      console.log("Uptime: " + process.uptime().toFixed(2) + "s");
    } else if (cmd === "cwd") {
      console.log(process.cwd());
    } else if (cmd === "date") {
      console.log(new Date().toISOString());
    } else if (cmd === "exit") {
      console.log("Goodbye!");
      process.exit(0);
    } else {
      console.log("Unknown command");
    }

    rl.prompt();
  });

  rl.on("close", function () {
    console.log("Goodbye!");
    process.exit(0);
  });
};

interactive();