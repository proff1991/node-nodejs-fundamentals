import { access, mkdir } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { createBrotliDecompress } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const decompressDir = async () => {
  try {
    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = dirname(__filenamePolyfill);
    var root = join(__dirnamePolyfill, "../../");

    var archivePath = join(root, "workspace", "compressed", "archive.br");
    var outputDir = join(root, "workspace", "decompressed");

    await access(archivePath);

    await mkdir(outputDir, { recursive: true });

    var stream = createReadStream(archivePath).pipe(createBrotliDecompress());

    var buffer = Buffer.alloc(0);
    var mode = "metadata-size";

    var metaSize = 0;
    var metadata;
    var need = 4;
    var writeStream;

    for await (var chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= need) {
        if (mode === "metadata-size") {
          metaSize = buffer.readUInt32BE(0);
          buffer = buffer.subarray(4);

          mode = "metadata";
          need = metaSize;
        }

        if (mode === "metadata" && buffer.length >= need) {
          metadata = JSON.parse(buffer.subarray(0, metaSize).toString());
          buffer = buffer.subarray(metaSize);

          if (metadata.type === "directory") {
            await mkdir(join(outputDir, metadata.path), { recursive: true });

            mode = "metadata-size";
            need = 4;
          } else {
            writeStream = createWriteStream(join(outputDir, metadata.path));

            mode = "content";
            need = metadata.fileSize;
          }
        }

        if (mode === "content" && buffer.length >= need) {
          writeStream.write(buffer.subarray(0, metadata.fileSize));
          writeStream.end();

          buffer = buffer.subarray(metadata.fileSize);

          mode = "metadata-size";
          need = 4;
        }
      }
    }

  } catch {
    throw new Error("FS operation failed");
  }
};

await decompressDir();