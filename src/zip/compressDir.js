import { createReadStream, createWriteStream, promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createBrotliCompress } from "zlib";

const compressDir = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var workspacePath = path.join(projectRoot, "workspace");
    var sourceDir = path.join(workspacePath, "toCompress");
    var compressedDir = path.join(workspacePath, "compressed");
    var archivePath = path.join(compressedDir, "archive.br");

    var stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) {
      throw new Error();
    }

    await fs.mkdir(compressedDir, { recursive: true });

    var files = [];

    var scan = async function (dir) {
      var items = await fs.readdir(dir);

      for (var i = 0; i < items.length; i++) {
        var fullPath = path.join(dir, items[i]);
        var itemStat = await fs.stat(fullPath);

        if (itemStat.isDirectory()) {
          await scan(fullPath);
        } else if (itemStat.isFile()) {
          files.push(fullPath);
        }
      }
    };

    await scan(sourceDir);

    var brotli = createBrotliCompress();
    var output = createWriteStream(archivePath);

    brotli.pipe(output);

    for (var i = 0; i < files.length; i++) {
      var filePath = files[i];

      var relative = path
        .relative(sourceDir, filePath)
        .split(path.sep)
        .join("/");

      var header = Buffer.from("FILE:" + relative + "\n");

      brotli.write(header);

      await new Promise(function (resolve, reject) {
        var stream = createReadStream(filePath);

        stream.on("data", function (chunk) {
          brotli.write(chunk);
        });

        stream.on("end", resolve);
        stream.on("error", reject);
      });

      brotli.write(Buffer.from("\nEND\n"));
    }

    brotli.end();

  } catch {
    throw new Error("FS operation failed");
  }
};

await compressDir();