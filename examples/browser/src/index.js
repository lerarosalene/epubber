import { Epubber } from "../../../dist";
// replace this with either `const { Epubber } = require("epubber")`
// or `import { Epubber } from "epubber"`

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

  const sample = await fetch("image.png").then((response) =>
    response.arrayBuffer(),
  );
  const u8 = new Uint8Array(sample);

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
  const downloadLink = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = downloadLink;
  a.download = "test-epub.epub";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blob);
}

document
  .getElementById("generate")
  .addEventListener("click", () =>
    main().catch((error) => console.error(error)),
  );
