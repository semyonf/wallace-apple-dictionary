import { Annotation } from './types';
import { JSDOM } from 'jsdom';

export function parseAnnotationsFromDOM(dom: JSDOM): Annotation[] {
  const nodesSnapshot = new dom.window.XPathEvaluator()
    .createExpression('//*/*[self::p[b] or self::h2][preceding-sibling::h1]')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const annotations: Annotation[] = [];
  let pageName: string | null = null;

  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    const node = nodesSnapshot.snapshotItem(i) as Element | null;

    if (!node?.textContent) {
      console.warn('Invalid node encountered, skipping');

      continue;
    }

    if (node.tagName === 'H2') {
      pageName = node.textContent;
    } else {
      if (!pageName) {
        throw new Error(`Current page is unknown`);
      }

      const [title, content] = node.textContent.split('\n');
      annotations.push({ title, content, pageName });
    }
  }

  return annotations;
}
