import { Transform } from "stream";

const filter = () => {
  var args = process.argv;
  var pattern = "";

  for (var i = 0; i < args.length; ++i) {
    if (args[i] === "--pattern" && args[i + 1]) {
      pattern = args[i + 1];
    }
  }

  var buffer = "";

  var transformer = new Transform({
    transform(chunk, _, callback) {
      buffer += chunk.toString();

      var parts = buffer.split("\n");
      buffer = parts.pop();

      for (var i = 0; i < parts.length; ++i) {
        var line = parts[i];

        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }

      callback();
    },

    flush(callback) {
      if (buffer.includes(pattern)) {
        this.push(buffer + "\n");
      }
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();