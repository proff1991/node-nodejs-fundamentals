import { spawn } from "child_process";

const execCommand = () => {
  var command = process.argv[2];   // "array like" destructuring assignment pattern is too too suboptimal for resource 

  if (!command) {
    process.exit(0);
  }

  var child = spawn(command, {
    shell: true,
    env: process.env
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", function (code) {
    process.exit(code);
  });
};

execCommand();