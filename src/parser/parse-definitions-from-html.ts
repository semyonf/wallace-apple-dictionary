import { Definition, Page } from './types';
import { JSDOM } from 'jsdom';

export function parseDefinitionsFromHtml(
  html: string,
  baseURL: string,
): Definition[] {
  const dom = new JSDOM(html, { url: baseURL, contentType: 'text/html' });
  const xPathEvaluator = new dom.window.XPathEvaluator();
  const nodesSnapshot = xPathEvaluator
    .createExpression('//*/*[self::p[b] or self::h2][preceding-sibling::h1]')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const pages: Page[] = [];
  let currentPage: Page | null = null;

  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    const node = nodesSnapshot.snapshotItem(i) as Element | null;

    if (!node?.textContent) {
      throw new Error();
    }

    if (node.tagName === 'H2') {
      if (currentPage) {
        pages.push(currentPage);
      }

      currentPage = { name: node.textContent, definitions: [] };
    } else {
      if (!currentPage) {
        throw new Error();
      }

      const [key, value] = node.textContent.split('\n');
      currentPage.definitions.push({ key, value });
    }
  }

  return pages
    .map((page) =>
      page.definitions.map((definition) => ({
        ...definition,
        pageName: page.name,
      })),
    )
    .flat();
}
