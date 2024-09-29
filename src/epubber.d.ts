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

export class Epubber {
  constructor(params: Params);
  public addContent(entry: ContentEntry): string;
  public addTocEntry(entry: TocEntry): string;
  public generate(): Promise<Blob>;
}
