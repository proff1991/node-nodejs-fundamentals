import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const restore = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var snapshotPath = path.join(projectRoot, "snapshot.json");
    var restoredPath = path.join(projectRoot, "workspace_restored");

    try {
      var snapshotStat = await fs.stat(snapshotPath);
    } catch {
      throw new Error("FS operation failed");
    }

    if (!snapshotStat.isFile()) {
      throw new Error("FS operation failed");
    }

    try {
      await fs.stat(restoredPath);
      throw new Error("FS operation failed");
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw new Error("FS operation failed");
      }
    }

    var snapshotContent = await fs.readFile(snapshotPath, "utf8");
    var snapshot = JSON.parse(snapshotContent);

    await fs.mkdir(restoredPath);

    var entries = snapshot.entries;

    for (var i = 0; i < entries.length; ++i) {
      var entry = entries[i];
      var targetPath = path.join(restoredPath, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(targetPath, { recursive: true });
      }

      if (entry.type === "file") {
        var dir = path.dirname(targetPath);
        await fs.mkdir(dir, { recursive: true });

        var buffer = Buffer.from(entry.content, "base64");
        await fs.writeFile(targetPath, buffer);
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();