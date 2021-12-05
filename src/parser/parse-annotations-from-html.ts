import { Annotation } from './types';
import { JSDOM } from 'jsdom';

export function parseAnnotationsFromHtml(
  html: string,
  baseURL: string,
): Annotation[] {
  const dom = new JSDOM(html, { url: baseURL, contentType: 'text/html' });
  const nodesSnapshot = new dom.window.XPathEvaluator()
    .createExpression('//*/*[self::p[b] or self::h2][preceding-sibling::h1]')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const annotations: Annotation[] = [];
  let currentPageName: string | null = null;

  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    const node = nodesSnapshot.snapshotItem(i) as Element | null;

    if (!node?.textContent) {
      console.warn('Invalid node encountered, skipping');

      continue;
    }

    if (node.tagName === 'H2') {
      currentPageName = node.textContent;
    } else {
      if (!currentPageName) {
        throw new Error(`Current page is unknown`);
      }

      const [term, explanation] = node.textContent.split('\n');
      annotations.push({
        title: term,
        content: explanation,
        pageName: currentPageName,
      });
    }
  }

  return annotations;
}