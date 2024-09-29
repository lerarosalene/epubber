import uniqueId from "lodash/uniqueId";
import { BlobWriter, TextReader, BlobReader, ZipWriter } from "@zip.js/zip.js";
import pugRuntime from "pug-runtime";

import contentOpf from "./content.pug";
import tocNcx from "./toc.pug";
import containerXML from "./container.pug";
import iBooksOptions from "./com.apple.ibooks.display-options.pug";

import { getTocTreeDepth, resolveTocTree, typeId } from "./util";

type WithId<U> = U & { id: string };

export interface ContentEntry {
  path: string;
  mime: string;
  content: string | Uint8Array;
  guideType?: string;
  addToSpine?: boolean;
}

export interface Params {
  id: string;
  title: string;
  lang: string;
  date?: string;
  modified?: string;
}

export interface TocEntry {
  content: string;
  label: string;
  parent?: string;
}

export interface FullTocEntry extends TocEntry {
  id: string;
  children: string[];
}

export class Epubber {
  private content: WithId<ContentEntry>[] = [];
  private toc: string[] = [];
  private tocById: Map<string, FullTocEntry> = new Map();
  private params: Params;

  constructor(params: Params) {
    this.params = params;
  }

  public addContent(entry: ContentEntry) {
    const id = uniqueId("content-");
    this.content.push({ ...entry, path: entry.path, id });
    return id;
  }

  public addTocEntry(entry: TocEntry) {
    const id = uniqueId("toc-");
    const full: FullTocEntry = { ...entry, id, children: [] };
    if (entry.parent) {
      const parentEntry = this.tocById.get(entry.parent);
      parentEntry?.children.push(id);
    }
    this.tocById.set(id, full);
    this.toc.push(id);
    return id;
  }

  private creteManifest() {
    return contentOpf(pugRuntime)({ ...this.params, content: this.content });
  }

  private createToc() {
    const tree = resolveTocTree(this.toc, this.tocById);
    const depth = getTocTreeDepth(tree);
    const title = this.params.title;
    return tocNcx(pugRuntime)({ navPoints: tree, depth, title });
  }

  public async generate() {
    const blobWriter = new BlobWriter();
    const zipWriter = new ZipWriter(blobWriter);

    await zipWriter.add("mimetype", new TextReader("application/epub+zip"), {
      level: 0,
      extendedTimestamp: false,
    });

    await zipWriter.add(
      "OEBPS/content.opf",
      new TextReader(this.creteManifest()),
    );
    await zipWriter.add("OEBPS/toc.ncx", new TextReader(this.createToc()));
    await zipWriter.add(
      "META-INF/container.xml",
      new TextReader(containerXML(pugRuntime)()),
    );
    await zipWriter.add(
      "META-INF/com.apple.ibooks.display-options.xml",
      new TextReader(iBooksOptions(pugRuntime)()),
    );

    for (let file of this.content) {
      const fullPath = `OEBPS/${file.path}`;
      if (file.content instanceof Uint8Array) {
        const blob = new Blob([file.content.buffer], { type: file.mime });
        await zipWriter.add(fullPath, new BlobReader(blob));
        continue;
      }
      if (typeof file.content === "string") {
        await zipWriter.add(fullPath, new TextReader(file.content));
        continue;
      }
      throw new TypeError(
        `ContentEntry.content must be either string of Uint8Array. Got ${typeId(file.content)} instead.`,
      );
    }

    await zipWriter.close();
    return await blobWriter.getData();
  }
}
