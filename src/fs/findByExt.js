import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const findByExt = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var workspacePath = path.join(projectRoot, "workspace");

    var stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) {
      throw new Error();
    }

    var ext = ".txt";
    var args = process.argv;

    for (var i = 0; i < args.length; i++) {
      if (args[i] === "--ext" && args[i + 1]) {
        ext = args[i + 1].startsWith(".") ? args[i + 1] : "." + args[i + 1];
      }
    }

    var results = [];

    var scan = async function (dir) {
      var items = await fs.readdir(dir);

      for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var fullPath = path.join(dir, name);
        var itemStat = await fs.stat(fullPath);

        if (itemStat.isDirectory()) {
          await scan(fullPath);
        }

        if (itemStat.isFile()) {
          if (path.extname(name) === ext) {
            var relativePath = path
              .relative(workspacePath, fullPath)
              .split(path.sep)
              .join("/");

            results.push(relativePath);
          }
        }
      }
    };

    await scan(workspacePath);

    results.sort();

    for (var i = 0; i < results.length; i++) {
      console.log(results[i]);
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();