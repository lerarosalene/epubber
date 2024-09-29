const fs = require("node:fs");
const p = require("node:path");
const pug = require("pug");
const esbuild = require("esbuild");

const fsp = fs.promises;

class PugPlugin {
  name = "pug";
  setup = (build) => {
    build.onResolve({ filter: /\.pug$/ }, (args) => ({
      path: p.join(args.resolveDir, args.path),
      namespace: "pug-ns",
    }));

    build.onLoad({ filter: /.*/, namespace: "pug-ns" }, async (args) => {
      const template = await fsp.readFile(args.path, "utf-8");
      const client = pug.compileClient(template, {
        self: true,
        inlineRuntimeFunctions: false,
        name: "template",
        debug: false,
      });

      return {
        contents:
          "export default function(pug){\n" + client + "\nreturn template;}",
        loader: "js",
      };
    });
  };
}

async function main() {
  await esbuild.build({
    entryPoints: [p.join("src", "index.ts")],
    external: ["lodash", "lodash/*", "pug-runtime", "@zip.js/zip.js"],
    outfile: p.join("dist", "index.js"),
    format: "cjs",
    bundle: true,
    plugins: [new PugPlugin()],
  });

  await fsp.copyFile(
    p.join("src", "epubber.d.ts"),
    p.join("dist", "index.d.ts"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
