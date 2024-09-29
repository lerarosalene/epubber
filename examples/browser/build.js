const fs = require("node:fs");
const p = require("node:path");
const esbuild = require("esbuild");

const fsp = fs.promises;

async function main() {
  await esbuild.build({
    entryPoints: [p.join(__dirname, "src", "index.js")],
    bundle: true,
    minify: true,
    outfile: p.join(__dirname, "dist", "index.js"),
    platform: "browser",
  });

  await fsp.copyFile(
    p.join(__dirname, "..", "sample-image.png"),
    p.join(__dirname, "dist", "image.png"),
  );

  await fsp.copyFile(
    p.join(__dirname, "src", "index.html"),
    p.join(__dirname, "dist", "index.html"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
