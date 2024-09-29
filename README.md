## Epubber - simple low-level API for creating .epub files

[![NPM Version](https://img.shields.io/npm/v/epubber)](https://npmjs.com/package/epubber)

### Install

`npm install epubber`

### Documentation

Not (yet) available. See comprehensive example below.

### Example

Run it: `npm run build && node examples/node.js`

```js
const fs = require("node:fs");
const p = require("node:path");
const { Epubber } = require("../dist/epubber.min");
// replace this with either `const { Epubber } = require("epubber")`
// or `import { Epubber } from "epubber"`

const fsp = fs.promises;

async function main() {
  const epubber = new Epubber({
    id: "test-book",
    title: "Test book",
    lang: "en",
    date: "2024-09-29",
    modified: "2024-09-29T14:00:00Z",
  });

  epubber.addContent({
    path: "style.css",
    mime: "text/css",
    content: "body { font-family: sans-serif; }",
  });

  epubber.addContent({
    path: "foreword.xhtml",
    mime: "application/xhtml+xml",
    content: `<?xml version="1.0" encoding="utf-8" standalone="no"?>
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Test foreword</title>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <p>Test foreword</p>
        </body>
      </html>`,
    addToSpine: true,
    guideType: "foreword",
  });

  epubber.addContent({
    path: "tome-00.xhtml",
    mime: "application/xhtml+xml",
    content: `<?xml version="1.0" encoding="utf-8" standalone="no"?>
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Test tome</title>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <p>Test tome</p>
        </body>
      </html>`,
    addToSpine: true,
    guideType: "text",
  });

  const sample = await fsp.readFile(p.join(__dirname, "sample-image.png"));
  const u8 = new Uint8Array(sample.buffer);

  epubber.addContent({
    path: "image.png",
    mime: "image/png",
    content: u8,
  });

  epubber.addContent({
    path: "chapter-00.xhtml",
    mime: "application/xhtml+xml",
    content: `<?xml version="1.0" encoding="utf-8" standalone="no"?>
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Test chapter</title>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <p>Test chapter</p>
          <img src="image.png" />
        </body>
      </html>`,
    addToSpine: true,
    guideType: "text",
  });

  epubber.addTocEntry({
    content: "foreword.xhtml",
    label: "Foreword",
  });

  const tome1 = epubber.addTocEntry({
    content: "tome-00.xhtml",
    label: "Tome 1",
  });

  epubber.addTocEntry({
    content: "chapter-00.xhtml",
    label: "Chapter 1",
    parent: tome1,
  });

  const blob = await epubber.generate();
  await fsp.writeFile("test-book.epub", Buffer.from(await blob.arrayBuffer()));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

```

### In Browser

See [examples/browser/](examples/browser/) for details.

### Credits

Sample image from https://www.learningcontainer.com/sample-png-image-for-testing/
