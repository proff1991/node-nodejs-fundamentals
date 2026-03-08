import { createReadStream, createWriteStream } from "fs";
import { Transform } from "stream";
import path from "path";
import { fileURLToPath } from "url";

const split = () => {
  var args = process.argv;
  var maxLines = 10;

  for (var i = 0; i < args.length; ++i) {
    if (args[i] === "--lines" && args[i + 1]) {
      maxLines = Number(args[i + 1]);
    }
  }

  var __filenamePolyfill = fileURLToPath(import.meta.url);
  var __dirnamePolyfill = path.dirname(__filenamePolyfill);
  var projectRoot = path.resolve(__dirnamePolyfill, "../../");

  var sourcePath = path.join(projectRoot, "source.txt");

  var lineCount = 0;
  var chunkIndex = 1;
  var buffer = "";

  var writer = createWriteStream(path.join(projectRoot, "chunk_" + chunkIndex + ".txt"));

  var transformer = new Transform({
    transform(chunk, _, callback) {
      buffer += chunk.toString();

      var parts = buffer.split("\n");
      buffer = parts.pop();

      for (var i = 0; i < parts.length; ++i) {
        writer.write(parts[i] + "\n");
        ++lineCount;

        if (lineCount >= maxLines) {
          writer.end();
          ++chunkIndex;
          writer = createWriteStream(
            path.join(projectRoot, "chunk_" + chunkIndex + ".txt")
          );
          lineCount = 0;
        }
      }

      callback();
    },

    flush(callback) {
      if (buffer.length > 0) {
        writer.write(buffer + "\n");
      }

      writer.end();
      callback();
    }
  });

  var reader = createReadStream(sourcePath);

  reader.pipe(transformer);
};

split();