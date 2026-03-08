import { Worker } from "worker_threads";
import { cpus } from "os";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const main = async () => {
  var __filenamePolyfill = fileURLToPath(import.meta.url);
  var __dirnamePolyfill = path.dirname(__filenamePolyfill);

  var dataPath = path.join(__dirnamePolyfill, "data.json");

  var content = await readFile(dataPath, "utf8");
  var numbers = JSON.parse(content);

  var cpuCount = cpus().length;

  var chunkSize = Math.ceil(numbers.length / cpuCount);

  var chunks = [];

  for (var i = 0; i < cpuCount; ++i) {
    var start = i * chunkSize;
    var end = start + chunkSize;

    var chunk = numbers.slice(start, end);

    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  var workerPromises = [];

  for (var i = 0; i < chunks.length; ++i) {
    workerPromises.push(
      new Promise(function (resolve, reject) {
        var worker = new Worker(
          path.join(__dirnamePolyfill, "worker.js"),
          { workerData: chunks[i] }
        );

        worker.on("message", function (sorted) {
          resolve(sorted);
        });

        worker.on("error", reject);
      })
    );
  }

  var sortedChunks = await Promise.all(workerPromises);

  var result = [];

  var indexes = new Array(sortedChunks.length).fill(0);

  while (true) {
    var min = Infinity;
    var minIndex = -1;

    for (var i = 0; i < sortedChunks.length; i++) {
      var idx = indexes[i];

      if (idx < sortedChunks[i].length) {
        var value = sortedChunks[i][idx];

        if (value < min) {
          min = value;
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) {
      break;
    };

    result.push(min);
    indexes[minIndex]++;
  }

  console.log(result);
};

await main();