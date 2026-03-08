import { createReadStream, promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const verify = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var projectRoot = path.resolve(__dirnamePolyfill, "../../");
    var checksumsPath = path.join(projectRoot, "checksums.json");

    var data = await fs.readFile(checksumsPath, "utf8");
    var checksums = JSON.parse(data);

    var files = Object.keys(checksums);

    for (var i = 0; i < files.length; ++i) {
      var fileName = files[i];
      var expectedHash = checksums[fileName];

      var filePath = path.join(projectRoot, fileName);

      var hash = crypto.createHash("sha256");

      await new Promise((resolve, reject) => {
        var stream = createReadStream(filePath);

        stream.on("data", (chunk) => {
          hash.update(chunk);
        });

        stream.on("end", () => {
          resolve();
        });

        stream.on("error", () => {
          reject();
        });
      });

      var actualHash = hash.digest("hex");

      // console.log(actualHash); // current hash

      if (actualHash === expectedHash) {
        console.log(fileName + " — OK");
      } else {
        console.log(fileName + " — FAIL");
      }
    }

  } catch {
    throw new Error("FS operation failed");
  }
};

await verify();