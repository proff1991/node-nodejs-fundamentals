import { Transform } from "stream";

const lineNumberer = () => {
  var line = 1;
  var buffer = "";

  var transformer = new Transform({
    transform(chunk, _, callback) {
      buffer += chunk.toString();

      var parts = buffer.split("\n");
      buffer = parts.pop();

      for (var i = 0; i < parts.length; ++i) {
        var numbered = line + " | " + parts[i] + "\n";
        this.push(numbered);
        ++line;
      }

      callback();
    },

    flush(callback) {
      if (buffer.length > 0) {
        this.push(line + " | " + buffer + "\n");
      }
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();