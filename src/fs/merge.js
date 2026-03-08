import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const merge = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var workspacePath = path.join(projectRoot, "workspace");
    var partsPath = path.join(workspacePath, "parts");
    var mergedPath = path.join(workspacePath, "merged.txt");

    var stat = await fs.stat(partsPath);
    if (!stat.isDirectory()) {
      throw new Error();
    }

    var args = process.argv;
    var filesArg = null;

    for (var i = 0; i < args.length; i++) {
      if (args[i] === "--files" && args[i + 1]) {
        filesArg = args[i + 1];
      }
    }

    var files = [];

    if (filesArg) {
      files = filesArg.split(",");
    } else {
      var items = await fs.readdir(partsPath);

      for (var i = 0; i < items.length; i++) {
        if (path.extname(items[i]) === ".txt") {
          files.push(items[i]);
        }
      }

      if (files.length === 0) {
        throw new Error();
      }

      files.sort();
    }

    var result = "";

    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(partsPath, files[i]);

      var fileStat;
      try {
        fileStat = await fs.stat(filePath);
      } catch {
        throw new Error();
      }

      if (!fileStat.isFile()) {
        throw new Error();
      }

      var content = await fs.readFile(filePath, "utf8");
      result += content;
    }

    await fs.writeFile(mergedPath, result);
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();