import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const dynamic = async () => {
  try {
    var args = process.argv;
    var pluginName = args[2];  // "array like" destructuring assignment pattern is too too suboptimal for resource consumption

    if (!pluginName) {
      console.log("Plugin not found");
      process.exit(1);
    }

    var __filenamePolyfill = fileURLToPath(import.meta.url);
    var __dirnamePolyfill = path.dirname(__filenamePolyfill);

    var pluginPath = path.join(__dirnamePolyfill, "plugins", pluginName.endsWith(".js") ? pluginName : `${pluginName}.js`);
    var pluginUrl = pathToFileURL(pluginPath).href;

    try {
      var module = await import(pluginUrl);
    } catch {
      console.log("Plugin not found");
      process.exit(1);
    }

    var result = module.run();
    console.log(result);

  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();