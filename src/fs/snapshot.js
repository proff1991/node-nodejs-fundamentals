import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const snapshot = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var workspacePath = path.join(projectRoot, "workspace");
    var snapshotPath = path.join(projectRoot, "snapshot.json");

    var stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) {
      throw new Error("FS operation failed");
    }

    var entries = [];

    var scan = async function (dir) {
      var items = await fs.readdir(dir);

      for (var i = 0; i < items.length; ++i) {
        var name = items[i];
        var fullPath = path.join(dir, name);
        var itemStat = await fs.stat(fullPath);

        var relativePath = path
          .relative(workspacePath, fullPath)
          .split(path.sep)
          .join("/");

        if (itemStat.isDirectory()) {
          entries.push({
            path: relativePath,
            type: "directory",
          });

          await scan(fullPath);
        } else if (itemStat.isFile()) {
          var buffer = await fs.readFile(fullPath);

          entries.push({
            path: relativePath,
            type: "file",
            size: itemStat.size,
            content: buffer.toString("base64"),
          });
        }
      }
    };

    await scan(workspacePath);

    var result = {
      rootPath: workspacePath,
      entries: entries,
    };

    await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
  } catch {
    throw new Error("FS operation failed");
  }
};

await snapshot();