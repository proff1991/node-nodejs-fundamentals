import { stat, readdir, mkdir } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { PassThrough } from "stream";
import { createBrotliCompress } from "zlib";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";

const compressDir = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = dirname(__filenamePolyfill);
    var root = join(__dirnamePolyfill, "../../");

    var workspace = join(root, "workspace");
    var sourceDir = join(workspace, "toCompress");
    var outDir = join(workspace, "compressed");
    var archive = join(outDir, "archive.br");

    var st = await stat(sourceDir);
    if (!st.isDirectory()) throw new Error();

    await mkdir(outDir, { recursive: true });

    var globalStream = new PassThrough();

    pipeline(
      globalStream,
      createBrotliCompress(),
      createWriteStream(archive)
    );

    var writeMeta = function (meta) {
      var json = JSON.stringify(meta);
      var sizeBuf = Buffer.alloc(4);
      sizeBuf.writeUInt32BE(Buffer.byteLength(json), 0);
      globalStream.write(sizeBuf);
      globalStream.write(Buffer.from(json));
    };

    var scan = async function (dir) {
      var items = await readdir(dir);

      for (var i = 0; i < items.length; ++i) {
        var full = join(dir, items[i]);
        var s = await stat(full);

        var rel = relative(sourceDir, full);

        if (s.isDirectory()) {
          writeMeta({ path: rel, type: "directory" });
          await scan(full);
        } else {
          writeMeta({ path: rel, type: "file", fileSize: s.size });

          var rs = createReadStream(full);
          for await (var chunk of rs) {
            globalStream.write(chunk);
          }
        }
      }
    };

    await scan(sourceDir);

    globalStream.end();
  } catch {
    throw new Error("FS operation failed");
  }
};

await compressDir();