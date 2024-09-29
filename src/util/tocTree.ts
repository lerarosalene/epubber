import type { FullTocEntry } from "../epubber";
import isNil from "lodash/isNil";

function exists<T>(object: T | null | undefined): object is T {
  return !isNil(object);
}

export type TocTreeNode = Omit<FullTocEntry, "children" | "parent"> & {
  children: TocTreeNode[];
  order: number;
};

class Order {
  private order = 0;
  public getNext() {
    return ++this.order;
  }
}

export function resolveTocTree(
  ids: string[],
  map: Map<string, FullTocEntry>,
  root = true,
  order = new Order(),
): TocTreeNode[] {
  const result = ids
    .map((id) => {
      const entry = map.get(id);
      if (!entry) {
        return null;
      }
      if (root && !isNil(entry.parent)) {
        return null;
      }
      const node: TocTreeNode = {
        id: entry.id,
        content: entry.content,
        label: entry.label,
        order: order.getNext(),
        children: resolveTocTree(entry.children, map, false, order),
      };
      return node;
    })
    .filter(exists);

  return result;
}

export function getTocTreeDepth(tree: TocTreeNode[]): number {
  if (tree.length === 0) {
    return 0;
  }
  const subtreeDepths = tree.map((node) => getTocTreeDepth(node.children));
  let maxDepth = subtreeDepths[0];
  for (let i = 1; i < subtreeDepths.length; ++i) {
    if (maxDepth < subtreeDepths[i]) {
      maxDepth = subtreeDepths[i];
    }
  }
  return 1 + maxDepth;
}
